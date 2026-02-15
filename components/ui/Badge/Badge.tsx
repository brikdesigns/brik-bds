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
 * Token reference:
 * - --system--green = #27ae60 (success)
 * - --system--yellow = #f2c94c (warning)
 * - --system--red = #eb5757 (error)
 * - --system--blue = #2f80ed (info)
 * - --grayscale--white (white text)
 * - --grayscale--darkest = #333 (dark text)
 */
const statusStyles: Record<BadgeStatus, CSSProperties> = {
  default: {
    backgroundColor: 'var(--_color---background--brand-primary)',
    color: 'var(--_color---text--inverse)',
  },
  positive: {
    backgroundColor: 'var(--system--green)',
    color: 'var(--grayscale--white)',
  },
  warning: {
    backgroundColor: 'var(--system--yellow)',
    color: 'var(--grayscale--darkest)',
  },
  error: {
    backgroundColor: 'var(--system--red)',
    color: 'var(--grayscale--white)',
  },
  info: {
    backgroundColor: 'var(--system--blue)',
    color: 'var(--grayscale--white)',
  },
  progress: {
    backgroundColor: 'var(--system--blue)',
    color: 'var(--grayscale--white)',
  },
  neutral: {
    backgroundColor: 'var(--_color---background--subtle)',
    color: 'var(--_color---text--muted)',
  },
};

/**
 * Size-based styles using BDS tokens
 *
 * Token reference:
 * - --_typography---label--tiny (sm size)
 * - --_typography---label--sm (md size)
 * - --_typography---label--md (lg size)
 */
const sizeStyles: Record<BadgeSize, CSSProperties> = {
  sm: {
    padding: '2px 6px',
    fontSize: 'var(--_typography---label--tiny)',
  },
  md: {
    padding: 'var(--_space---tiny) var(--_space---sm)',
    fontSize: 'var(--_typography---label--sm)',
  },
  lg: {
    padding: '6px 12px',
    fontSize: 'var(--_typography---label--md)',
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
  fontWeight: 600,
  lineHeight: 1.5,
  borderRadius: '9999px',
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
