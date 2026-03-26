import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './Badge.css';

/** Badge status variants */
export type BadgeStatus = 'positive' | 'warning' | 'error' | 'info' | 'progress';

/** Badge size variants — shared scale with Tag */
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

/** Badge visual style — dark (saturated bg) or light (pastel bg) */
export type BadgeVariant = 'dark' | 'light';

/** Badge component props */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status variant */
  status?: BadgeStatus;
  /** Size variant — xs is icon-only (no text) */
  size?: BadgeSize;
  /** Visual style — dark uses saturated bg, light uses pastel bg */
  variant?: BadgeVariant;
  /** Children content (optional for xs/icon-only size) */
  children?: ReactNode;
  /** Optional icon before text (required for xs size) */
  icon?: ReactNode;
}

/**
 * Badge — status indicator with semantic colors
 *
 * Pill-shaped label for communicating status, category, or count.
 * Uses BDS system color tokens for consistent status semantics.
 * Sizing scale is shared with Tag for side-by-side alignment.
 *
 * @example
 * ```tsx
 * <Badge status="positive">Success</Badge>
 * <Badge status="warning" size="sm">Pending</Badge>
 * <Badge status="error" size="lg">Failed</Badge>
 * ```
 */
export function Badge({
  status = 'info',
  size = 'md',
  variant = 'dark',
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
    `bds-badge--${variant}`,
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
