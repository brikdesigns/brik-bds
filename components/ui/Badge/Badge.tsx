import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './Badge.css';

/** Badge status variants */
export type BadgeStatus = 'positive' | 'warning' | 'error' | 'info' | 'progress' | 'brand';

/** Badge size variants — shared scale with Tag */
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Badge fill appearance — shared axis with Chip (`solid | outline`) and
 * Tag (`solid | subtle`). Badge supports the two pastel-capable values.
 * - `solid`  — saturated status-color background, high emphasis.
 * - `subtle` — pastel status-color background, saturated text, lower emphasis.
 */
export type BadgeAppearance = 'solid' | 'subtle';

/** Badge component props */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status variant */
  status?: BadgeStatus;
  /** Size variant — xs is icon-only (no text) */
  size?: BadgeSize;
  /** Fill appearance — solid (saturated bg) or subtle (pastel bg). */
  appearance?: BadgeAppearance;
  /** Children content (optional for xs/icon-only size) */
  children?: ReactNode;
  /** Optional icon before text (required for xs size) */
  icon?: ReactNode;
}

/**
 * Badge — status indicator with semantic colors.
 *
 * Pill-shaped label for communicating status, category, or count.
 * Uses BDS system color tokens for consistent status semantics.
 * Sizing scale is shared with Tag for side-by-side alignment.
 *
 * **Indicator, not action.** Badge is non-interactive. Render it as a
 * `<span>` reflecting state; never attach `onClick` or wrap it to
 * navigate. For clickable pills use `Chip` (filters, selections) or
 * `Button` / `LinkButton` (primary actions). See the "Indicators vs
 * Actions" section of Badge.mdx for the full decision tree.
 *
 * @example
 * ```tsx
 * <Badge status="positive">Success</Badge>
 * <Badge status="warning" size="sm" appearance="subtle">Pending</Badge>
 * <Badge status="error" size="lg">Failed</Badge>
 * ```
 *
 * @summary Status indicator with semantic tones and sizes
 */
export function Badge({
  status = 'info',
  size = 'md',
  appearance = 'solid',
  children,
  icon,
  className,
  style,
  ...props
}: BadgeProps) {
  const isIconOnly = size === 'xs';

  const classes = bdsClass(
    'bds-badge',
    `bds-badge--${status}`,
    `bds-badge--${size}`,
    `bds-badge--${appearance}`,
    className
  );

  return (
    <span className={classes} style={style} {...props}>
      {icon && <span className="bds-badge__icon">{icon}</span>}
      {!isIconOnly && children}
    </span>
  );
}

export default Badge;
