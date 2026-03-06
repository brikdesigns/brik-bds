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
 * - --text-on-color-dark: always white — for saturated backgrounds
 * - --text-on-color-light: always black — for light backgrounds
 * - --text-primary: adapts per theme (dark in light, light in dark)
 *   Used on warning yellow where dark text is needed for readability
 *
 * Token reference:
 * - --color-system-green = #27ae60 (success)
 * - --color-system-yellow = #f2c94c (warning)
 * - --color-system-red = #eb5757 (error)
 * - --color-system-blue = #2f80ed (info)
 */
const statusStyles: Record<BadgeStatus, CSSProperties> = {
  default: {
    backgroundColor: 'var(--background-brand-primary)',
    color: 'var(--text-on-color-dark)',
  },
  positive: {
    backgroundColor: 'var(--color-system-green)',
    color: 'var(--text-on-color-dark)',
  },
  warning: {
    backgroundColor: 'var(--color-system-yellow)',
    color: 'var(--text-on-color-light)',
  },
  error: {
    backgroundColor: 'var(--color-system-red)',
    color: 'var(--text-on-color-dark)',
  },
  info: {
    backgroundColor: 'var(--color-system-blue)',
    color: 'var(--text-on-color-dark)',
  },
  progress: {
    backgroundColor: 'var(--color-system-blue)',
    color: 'var(--text-on-color-dark)',
  },
  neutral: {
    backgroundColor: 'var(--background-secondary)',
    color: 'var(--text-muted)',
  },
};

/**
 * Size-based styles using BDS tokens
 *
 * Figma variable mapping (Base mode):
 * - padding/sm = --padding-sm = 12px
 * - padding/md = --padding-md = 16px
 * - space/150  = --gap-sm = 6px
 * - gap/sm     = --gap-sm = 6px (icon-to-text)
 * - gap/md     = --gap-md = 8px (icon-to-text, lg size)
 *
 * Token reference:
 * - --font-size-50 = 11.54px (xs icon size)
 * - --body-tiny = 10.26px (sm label — no label--xs token exists)
 * - --label-sm = 14px (md label)
 * - --label-md = 16px (lg label)
 * - --border-radius-sm = 2px (xs uses square corners, not pill)
 */
const sizeStyles: Record<BadgeSize, CSSProperties> = {
  xs: {
    width: '24px',
    height: '24px',
    padding: 0,
    fontSize: 'var(--font-size-50)', // bds-lint-ignore — no semantic token for icon-only badge size
    borderRadius: 'var(--border-radius-sm)',
    justifyContent: 'center',
    gap: 0,
  },
  sm: {
    padding: 'var(--padding-tiny) var(--padding-sm)',
    fontSize: 'var(--body-tiny)',
  },
  md: {
    padding: 'var(--padding-sm) var(--padding-md)',
    fontSize: 'var(--label-sm)',
  },
  lg: {
    padding: 'var(--padding-sm) var(--padding-md)',
    fontSize: 'var(--label-md)',
    gap: 'var(--gap-md)',
  },
};

/**
 * Base badge styles using BDS tokens
 *
 * Token reference:
 * - --gap-sm = 6px (icon-to-text gap, sm/md sizes)
 * - --font-family-label (badge font)
 * - --font-weight-semi-bold = 600
 * - --font-line-height-tight = 100% (tight, per Figma leading-none)
 */
const baseStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--gap-sm)',
  fontFamily: 'var(--font-family-label)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
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
