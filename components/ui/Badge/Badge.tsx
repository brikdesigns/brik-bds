import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

/**
 * Badge status variants
 */
export type BadgeStatus = 'default' | 'positive' | 'warning' | 'error' | 'info' | 'progress' | 'neutral';

/**
 * Badge size variants
 */
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Badge component props
 */
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
 * Status-based colors using BDS system tokens
 *
 * On-color text uses constant semantic tokens:
 * - --_color---text--on-color-dark: always white — for saturated backgrounds
 * - --_color---text--on-color-light: always black — for light backgrounds
 * - --_color---text--primary: adapts per theme (dark in light, light in dark)
 *   Used on warning yellow where dark text is needed for readability
 *
 * Token reference:
 * - --system--green = #27ae60 (success)
 * - --system--yellow = #f2c94c (warning)
 * - --system--red = #eb5757 (error)
 * - --system--blue = #2f80ed (info)
 */
const statusStyles: Record<BadgeStatus, CSSProperties> = {
  default: {
    backgroundColor: 'var(--_color---background--brand-primary)',
    color: 'var(--_color---text--on-color-dark)',
  },
  positive: {
    backgroundColor: 'var(--system--green)',
    color: 'var(--_color---text--on-color-dark)',
  },
  warning: {
    backgroundColor: 'var(--system--yellow)',
    color: 'var(--_color---text--primary)',
  },
  error: {
    backgroundColor: 'var(--system--red)',
    color: 'var(--_color---text--on-color-dark)',
  },
  info: {
    backgroundColor: 'var(--system--blue)',
    color: 'var(--_color---text--on-color-dark)',
  },
  progress: {
    backgroundColor: 'var(--system--blue)',
    color: 'var(--_color---text--on-color-dark)',
  },
  neutral: {
    backgroundColor: 'var(--_color---background--secondary)',
    color: 'var(--_color---text--muted)',
  },
};

/**
 * Size-based styles using BDS tokens
 *
 * Figma variable mapping (Base mode):
 * - padding/sm = --_space---sm = 12px
 * - padding/md = --_space---md = 16px
 * - space/150  = --_space---gap--sm = 6px
 * - gap/sm     = --_space---gap--sm = 6px (icon-to-text)
 * - gap/md     = --_space---gap--md = 8px (icon-to-text, lg size)
 *
 * Token reference:
 * - --font-size--50 = 11.54px (xs icon size)
 * - --_typography---body--tiny = 10.26px (sm label — no label--xs token exists)
 * - --_typography---label--sm = 14px (md label)
 * - --_typography---label--md-base = 16px (lg label)
 * - --_border-radius---sm = 2px (xs uses square corners, not pill)
 */
const sizeStyles: Record<BadgeSize, CSSProperties> = {
  xs: {
    width: '24px',
    height: '24px',
    padding: 0,
    fontSize: 'var(--font-size--50)', // bds-lint-ignore — no semantic token for icon-only badge size
    borderRadius: 'var(--_border-radius---sm)',
    justifyContent: 'center',
    gap: 0,
  },
  sm: {
    padding: 'var(--_space---gap--sm) var(--_space---sm)',
    fontSize: 'var(--_typography---body--tiny)',
  },
  md: {
    padding: 'var(--_space---sm) var(--_space---md)',
    fontSize: 'var(--_typography---label--sm)',
  },
  lg: {
    padding: 'var(--_space---sm) var(--_space---md)',
    fontSize: 'var(--_typography---label--md-base)',
    gap: 'var(--_space---gap--md)',
  },
};

/**
 * Base badge styles using BDS tokens
 *
 * Token reference:
 * - --_space---gap--sm = 6px (icon-to-text gap, sm/md sizes)
 * - --_typography---font-family--label (badge font)
 * - --font-weight--semi-bold = 600
 * - --font-line-height--100 = 100% (tight, per Figma leading-none)
 */
const baseStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--_space---gap--sm)',
  fontFamily: 'var(--_typography---font-family--label)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height--100)',
  borderRadius: '9999px', // pill shape — no BDS token equivalent
  whiteSpace: 'nowrap',
  textTransform: 'capitalize' as const,
};

/**
 * Badge - BDS themed badge component
 *
 * Uses CSS variables for theming. Supports status variants for
 * indicating state (positive, warning, error, info, progress, neutral)
 * and size variants (sm, md, lg). Pill-shaped border radius per Figma.
 * All spacing, colors, typography reference BDS tokens.
 *
 * @example
 * ```tsx
 * <Badge status="positive">Success</Badge>
 * <Badge status="warning" size="sm">Pending</Badge>
 * <Badge status="error" size="lg">Failed</Badge>
 * <Badge status="progress">In Progress</Badge>
 * <Badge status="neutral">Inactive</Badge>
 * ```
 */
export function Badge({
  status = 'default',
  size = 'md',
  children,
  icon,
  className = '',
  style,
  ...props
}: BadgeProps) {
  const isIconOnly = size === 'xs';
  const combinedStyles: CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    ...statusStyles[status],
    ...style,
  };

  return (
    <span
      className={bdsClass('bds-badge', `bds-badge-${status}`, className)}
      style={combinedStyles}
      {...props}
    >
      {icon}
      {!isIconOnly && children}
    </span>
  );
}

export default Badge;
