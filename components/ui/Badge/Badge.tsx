import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './Badge.css';

/** Badge status variants */
export type BadgeStatus = 'positive' | 'warning' | 'error' | 'info' | 'progress';

/** Badge size variants */
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

/** Badge component props */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status variant */
  status?: BadgeStatus;
  /** Size variant — xs is icon-only (no text) */
  size?: BadgeSize;
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
    className
  );

  return (
    <span className={classes} style={style} {...props}>
      {icon}
      {!isIconOnly && children}
    </span>
  );
}

export default Badge;
