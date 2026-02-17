import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';

/**
 * Badge status variants
 */
export type BadgeStatus = 'default' | 'positive' | 'warning' | 'error' | 'info' | 'progress' | 'neutral';

/**
 * Badge size variants
 */
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * Badge component props
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status variant */
  status?: BadgeStatus;
  /** Size variant */
  size?: BadgeSize;
  /** Children content */
  children: ReactNode;
  /** Optional icon before text */
  icon?: ReactNode;
}

/**
 * Status-based colors using BDS system tokens
 *
 * On-color text uses theme-aware semantic tokens:
 * - --_color---text--inverse: text on colored/brand backgrounds
 *   Used on saturated backgrounds (green, red, blue, brand) for contrast
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
    color: 'var(--_color---text--inverse)',
  },
  positive: {
    backgroundColor: 'var(--system--green)',
    color: 'var(--_color---text--inverse)',
  },
  warning: {
    backgroundColor: 'var(--system--yellow)',
    color: 'var(--_color---text--primary)',
  },
  error: {
    backgroundColor: 'var(--system--red)',
    color: 'var(--_color---text--inverse)',
  },
  info: {
    backgroundColor: 'var(--system--blue)',
    color: 'var(--_color---text--inverse)',
  },
  progress: {
    backgroundColor: 'var(--system--blue)',
    color: 'var(--_color---text--inverse)',
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
 * - --_typography---body--tiny = 10.26px (sm size — no label--tiny exists)
 * - --_typography---label--sm = 14px (md size)
 * - --_typography---label--md-base = 16px (lg size)
 */
const sizeStyles: Record<BadgeSize, CSSProperties> = {
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
      {children}
    </span>
  );
}

export default Badge;
