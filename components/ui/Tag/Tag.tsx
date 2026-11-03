import { type HTMLAttributes, type ReactNode } from 'react';
import { Icon } from '../Icon';
import { XBold } from '../../icons';
import { bdsClass } from '../../utils';
import './Tag.css';

/** Tag size variants — shared scale with Badge */
export type TagSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Tag density — orthogonal to `size`, shared axis with BulletList / Table.
 * - `comfortable` (default) — current spacing.
 * - `compact` — tighter horizontal padding (one token-step down per size)
 *   so more Tags fit inline in a dense table row. Height is unchanged.
 */
export type TagDensity = 'comfortable' | 'compact';

/**
 * Tag fill appearance — the indicator axis shared with Badge (`solid | subtle
 * | outline`) and Avatar (`solid | subtle`). Chip is an action, not an
 * indicator, and keeps its own `variant`.
 * - `solid`   — saturated `--bds-background-*` fill with an on-color label.
 * - `subtle`  — pale `--bds-background-*-light` fill with a dark-ink label.
 * - `outline` — transparent fill, `--bds-text-primary` label, border only.
 *
 * Renamed in 0.222: the old `subtle` (transparent + border) is now `outline`,
 * and the old `muted` (quiet neutral fill) is now `subtle`. Run
 * `scripts/codemod-tag-appearance.mjs` to migrate callsites.
 */
export type TagAppearance = 'solid' | 'subtle' | 'outline';

/**
 * Tag color — what category the Tag names. `neutral` or one of the six accent
 * hues (shared with Avatar). Status colors belong to `Badge` `tone`.
 */
export type TagColor = 'neutral' | 'blue' | 'green' | 'orange' | 'purple' | 'yellow' | 'red';

/** Tag component props */
export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Tag label content (optional for xs/icon-only size) */
  children?: ReactNode;
  /** Size variant — xs is icon-only (no text) */
  size?: TagSize;
  /**
   * Fill appearance — `solid` (saturated fill), `subtle` (pale fill), or
   * `outline` (transparent + border). Default `solid`.
   */
  appearance?: TagAppearance;
  /** Category color — `neutral` or an accent hue. Default `neutral`. */
  color?: TagColor;
  /** Density — `compact` tightens horizontal padding for dense rows. Default `comfortable`. */
  density?: TagDensity;
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
 * pills (filter selections, removable chips) use `Chip`. See
 * build-standards/indicators for the full decision tree.
 *
 * @example
 * ```tsx
 * <Tag>Category</Tag>
 * <Tag size="xs" icon={<Icon />} />
 * <Tag size="lg" icon={<Icon />}>With Icon</Tag>
 * <Tag appearance="outline">Outlined</Tag>
 * <Tag color="blue" appearance="subtle">Segment</Tag>
 * ```
 *
 * @summary Categorization label for content
 */
export function Tag({
  children,
  size = 'md',
  appearance = 'solid',
  color = 'neutral',
  density = 'comfortable',
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
    `bds-tag--${appearance}`,
    `bds-tag--color-${color}`,
    density === 'compact' && 'bds-tag--compact',
    disabled && 'bds-tag--disabled',
    className
  );

  return (
    <span className={classes} style={style} {...props}>
      {icon && <span className="bds-tag__icon">{icon}</span>}
      {!isIconOnly && (
        <span className="bds-tag__label" title={typeof children === 'string' ? children : undefined}>
          {children}
        </span>
      )}
      {!isIconOnly && trailingIcon && <span className="bds-tag__icon">{trailingIcon}</span>}
      {!isIconOnly && onRemove && !disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="bds-tag__remove bds-tag__icon"
          aria-label="Remove"
        >
          <Icon icon={XBold} />
        </button>
      )}
    </span>
  );
}

export default Tag;
