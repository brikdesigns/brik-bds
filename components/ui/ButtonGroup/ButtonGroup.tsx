import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './ButtonGroup.css';

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
 * // IconButton toolbar (up to 4 actions)
 * <ButtonGroup>
 *   <IconButton icon={<Edit />} label="Edit" variant="ghost" />
 *   <IconButton icon={<Copy />} label="Copy" variant="ghost" />
 *   <IconButton icon={<Share />} label="Share" variant="ghost" />
 *   <IconButton icon={<Trash />} label="Delete" variant="destructive" />
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
  className,
  ...props
}: ButtonGroupProps) {
  const classes = bdsClass(
    'bds-button-group',
    orientation === 'vertical' && 'bds-button-group--vertical',
    `bds-button-group--align-${align}`,
    fullWidth && 'bds-button-group--full-width',
    className
  );

  return (
    <div className={classes} role="group" {...props}>
      {children}
    </div>
  );
}

export default ButtonGroup;
