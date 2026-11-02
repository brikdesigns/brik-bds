'use client';

import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useEffect,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { bdsClass } from '../../utils';
import { Ellipsis } from '../../icons';
import { Icon } from '../Icon';
import { Button, type ButtonSize } from '../Button';
import { Menu, type MenuItemData } from '../Menu';
import './ButtonGroup.css';

/** Most buttons a horizontal group shows before the rest roll into an overflow Menu. */
export const BUTTON_GROUP_MAX_VISIBLE = 3;

interface GroupChildProps {
  size?: ButtonSize;
  variant?: string;
  icon?: ReactNode;
  iconBefore?: ReactNode;
  label?: string;
  children?: ReactNode;
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
}

/** Flatten fragments one level so `<>…</>` children count as individual buttons. */
function flattenChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement(child) && child.type === Fragment
      ? flattenChildren((child.props as { children?: ReactNode }).children)
      : [child],
  );
}

function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((n) => (typeof n === 'string' || typeof n === 'number' ? String(n) : ''))
    .join('')
    .trim();
}

function isIconOnly(child: ReactNode): boolean {
  if (!isValidElement(child)) return false;
  const props = child.props as GroupChildProps;
  return props.icon != null && props.children == null;
}

function toMenuItem(child: ReactNode, index: number): MenuItemData | null {
  if (!isValidElement(child)) return null;
  const props = child.props as GroupChildProps;
  const label = props.label ?? textOf(props.children);
  if (!label) return null;
  const { href, onClick } = props;
  return {
    id: `overflow-${index}`,
    label,
    icon: props.icon ?? props.iconBefore,
    disabled: props.disabled,
    onClick: href && !onClick ? () => window.location.assign(href) : onClick,
  };
}

export type ButtonGroupOrientation = 'horizontal' | 'vertical';
export type ButtonGroupAlign = 'start' | 'center' | 'end' | 'between';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** `Button` (or `IconButton`) elements to group. */
  children: ReactNode;
  /** Stack direction. Default `horizontal`. */
  orientation?: ButtonGroupOrientation;
  /**
   * Horizontal alignment of the group's children when not `fullWidth`.
   * Replaces the prior manual `justify-content` patterns for action rows.
   * In normal flow the group spans its container (block-level flex), so
   * alignment is visible; as a flex item (e.g. a PageHeader actions slot)
   * it shrink-wraps and the parent controls placement.
   * - `start` (default) — left-aligned
   * - `center` — centered
   * - `end` — right-aligned (canonical for modal / sheet action rows: primary far right, secondary to its left)
   * - `between` — first child left, last child right (`justify-content: space-between`; always full-row)
   */
  align?: ButtonGroupAlign;
  /** When true, buttons stretch to fill the container equally */
  fullWidth?: boolean;
  /**
   * Size applied to every child that does not set its own `size` (an explicit
   * child `size` wins), so text and icon buttons in one group share one height.
   */
  size?: ButtonSize;
  /**
   * Most buttons a horizontal group shows before the rest roll into an
   * overflow Menu. Default 3 (the primary included). Not applied to vertical
   * groups. Pass `Infinity` to disable.
   */
  maxVisible?: number;
}

/**
 * ButtonGroup — groups related Button (or IconButton) components into
 * a single visual unit with consistent spacing and alignment.
 *
 * `align` replaces the prior manual `justify-content` flex patterns
 * for action rows. For mutually-exclusive option toolbars (Day / Week
 * / Month) use [`SegmentedControl`](../SegmentedControl) instead — its
 * shared-border treatment is the canonical home for that pattern.
 *
 * @example
 * ```tsx
 * // Default form-footer action set (1 primary + 2 secondary)
 * <ButtonGroup>
 *   <Button variant="primary">Save</Button>
 *   <Button variant="outline">Preview</Button>
 *   <Button variant="ghost">Cancel</Button>
 * </ButtonGroup>
 *
 * // Modal / sheet action row — primary far right, secondary to its left
 * <ButtonGroup align="end">
 *   <Button variant="ghost">Cancel</Button>
 *   <Button variant="primary">Save</Button>
 * </ButtonGroup>
 *
 * // Icon toolbar — a 4th and later button rolls into a [⋯] Menu
 * <ButtonGroup size="sm">
 *   <Button icon={<Edit />} label="Edit" variant="ghost" />
 *   <Button icon={<Copy />} label="Copy" variant="ghost" />
 *   <Button icon={<Share />} label="Share" variant="ghost" />
 *   <Button icon={<Trash />} label="Delete" variant="negative" />
 * </ButtonGroup>
 * ```
 *
 * @summary Group related Buttons (orientation + align + fullWidth)
 */
export function ButtonGroup({
  children,
  orientation = 'horizontal',
  align = 'start',
  fullWidth = false,
  size,
  maxVisible = BUTTON_GROUP_MAX_VISIBLE,
  className,
  ...props
}: ButtonGroupProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const all = flattenChildren(children);
  const canOverflow = orientation === 'horizontal' && all.length > maxVisible;
  const visible = canOverflow ? all.slice(0, maxVisible) : all;
  const overflowing = canOverflow ? all.slice(maxVisible) : [];

  const primaryCount = visible.filter(
    (c) => isValidElement(c) && (c.props as GroupChildProps).variant === 'primary',
  ).length;
  useEffect(() => {
    if (primaryCount > 1 && process.env.NODE_ENV !== 'production') {
      console.warn(`ButtonGroup: ${primaryCount} primary buttons in one group; use one primary per group.`);
    }
  }, [primaryCount]);

  const withSize = (node: ReactNode): ReactNode => {
    if (size === undefined || !isValidElement(node)) return node;
    if ((node.props as GroupChildProps).size !== undefined) return node;
    return cloneElement(node as ReactElement<GroupChildProps>, { size });
  };

  const items = overflowing
    .map((c, i) => toMenuItem(c, i))
    .filter((item): item is MenuItemData => item !== null)
    .map((item) => ({
      ...item,
      onClick: () => {
        setMenuOpen(false);
        item.onClick?.();
      },
    }));
  const iconGroup = visible.length > 0 && visible.every(isIconOnly);
  const triggerSize =
    size ??
    ((visible.find((c) => isValidElement(c) && (c.props as GroupChildProps).size) as ReactElement<GroupChildProps> | undefined)
      ?.props.size) ??
    'md';

  const classes = bdsClass(
    'bds-button-group',
    orientation === 'vertical' && 'bds-button-group--orientation-vertical',
    `bds-button-group--align-${align}`,
    fullWidth && 'bds-button-group--full-width',
    className
  );

  return (
    <div className={classes} role="group" {...props}>
      {visible.map(withSize)}
      {items.length > 0 && (
        <div className="bds-button-group__overflow">
          {iconGroup ? (
            <Button
              variant="secondary"
              size={triggerSize}
              icon={<Icon icon={Ellipsis} />}
              label="More actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            />
          ) : (
            <Button
              variant="ghost"
              size={triggerSize}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              View More
            </Button>
          )}
          <Menu
            className="bds-button-group__menu"
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            items={items}
          />
        </div>
      )}
    </div>
  );
}

export default ButtonGroup;
