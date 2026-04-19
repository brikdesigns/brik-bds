import { type HTMLAttributes, type ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { X } from '../../icons';
import { bdsClass } from '../../utils';
import './Tag.css';

/** Tag size variants — shared scale with Badge */
export type TagSize = 'xs' | 'sm' | 'md' | 'lg';

/** Tag component props */
export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Tag label content (optional for xs/icon-only size) */
  children?: ReactNode;
  /** Size variant — xs is icon-only (no text) */
  size?: TagSize;
  /** Optional leading icon (left) — required for xs size */
  icon?: ReactNode;
  /** Optional trailing icon (right) */
  trailingIcon?: ReactNode;
  /**
   * Show dismiss button and callback.
   * @deprecated Tag is an indicator — non-interactive by design. For
   *   removable pills (active filters, dismissible selections) use
   *   `Chip` with `onRemove` instead. This prop will be removed once
   *   portal/renew-pms/brikdesigns migrate their last callsites.
   */
  onRemove?: () => void;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Tag — categorization label.
 *
 * Sizing scale is shared with Badge for side-by-side alignment.
 *
 * **Indicator, not action.** Tag is non-interactive by design — use it
 * to label categories, classifications, or metadata. For interactive
 * pills (filter selections, removable chips) use `Chip`. See the
 * "Indicators vs Actions" section of Tag.mdx for the full decision
 * tree.
 *
 * @example
 * ```tsx
 * <Tag>Category</Tag>
 * <Tag size="xs" icon={<Icon />} />
 * <Tag size="lg" icon={<Icon />}>With Icon</Tag>
 * ```
 */
export function Tag({
  children,
  size = 'md',
  icon,
  trailingIcon,
  onRemove,
  disabled = false,
  className,
  style,
  ...props
}: TagProps) {
  const isIconOnly = size === 'xs';

  const classes = bdsClass(
    'bds-tag',
    `bds-tag--${size}`,
    disabled && 'bds-tag--disabled',
    className
  );

  return (
    <span className={classes} style={style} {...props}>
      {icon && <span className="bds-tag__icon">{icon}</span>}
      {!isIconOnly && children}
      {!isIconOnly && trailingIcon && <span className="bds-tag__icon">{trailingIcon}</span>}
      {!isIconOnly && onRemove && !disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="bds-tag__remove bds-tag__icon"
          aria-label="Remove"
        >
          <Icon icon={X} />
        </button>
      )}
    </span>
  );
}

export default Tag;
