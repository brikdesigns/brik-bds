import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';

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
 * Token reference:
 * - --font-size--50 = 11.54px (xs icon size)
 * - --_typography---body--tiny = 10.26px (sm size — no label--tiny exists)
 * - --_typography---label--sm = 14px (md size)
 * - --_typography---label--md-base = 16px (lg size)
 * - --_space---sm = 6px, --_space---md = 8px
 * - --_border-radius---sm = 2px (xs uses square corners, not pill)
 */
const sizeStyles: Record<BadgeSize, CSSProperties> = {
  xs: {
    width: '24px',
    height: '24px',
    padding: 'var(--_space---sm) var(--_space---md)',
    fontSize: 'var(--font-size--50)', // bds-lint-ignore — no semantic token for icon-only badge size
    borderRadius: 'var(--_border-radius---sm)',
    justifyContent: 'center',
  },
  sm: {
    padding: '2px 6px',
    fontSize: 'var(--_typography---body--tiny)',
  },
  md: {
    padding: 'var(--_space---tiny) var(--_space---sm)',
    fontSize: 'var(--_typography---label--sm)',
  },
  lg: {
    padding: '6px 12px',
    fontSize: 'var(--_typography---label--md-base)',
  },
};

/**
 * Base badge styles using BDS tokens
 *
 * Token reference:
 * - --_space---gap--sm = 4px (icon gap)
 * - --_space---tiny = 4px (vertical padding)
 * - --_space---sm = 6px (horizontal padding)
 * - --_typography---font-family--label (badge font)
 * - --_typography---label--sm (small label size)
 * - --_border-radius---sm = 2px (badge corners)
 */
const baseStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--_space---gap--sm)',
  fontFamily: 'var(--_typography---font-family--label)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height--150)',
  borderRadius: '9999px', // pill shape — no BDS token equivalent
  whiteSpace: 'nowrap',
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
      className={className || undefined}
      style={combinedStyles}
      {...props}
    >
      {icon}
      {!isIconOnly && children}
    </span>
  );
}

export default Badge;
