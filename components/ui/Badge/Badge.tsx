import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';

/**
 * Badge status variants
 */
export type BadgeStatus = 'default' | 'positive' | 'warning' | 'error' | 'info';

/**
 * Badge component props
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status variant */
  status?: BadgeStatus;
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
  padding: 'var(--_space---tiny) var(--_space---sm)',
  fontFamily: 'var(--_typography---font-family--label)',
  fontSize: 'var(--_typography---label--sm)',
  fontWeight: 600,
  lineHeight: 1.5,
  borderRadius: 'var(--_border-radius---sm)',
  whiteSpace: 'nowrap',
};

/**
 * Badge - BDS themed badge component
 *
 * Uses CSS variables for theming. Supports status variants for
 * indicating state (positive, warning, error, info).
 * All spacing, colors, typography, and border-radius reference BDS tokens.
 *
 * @example
 * ```tsx
 * <Badge status="positive">Success</Badge>
 * <Badge status="warning">Pending</Badge>
 * <Badge status="error">Failed</Badge>
 * <Badge>New</Badge>
 * ```
 */
export function Badge({
  status = 'default',
  children,
  icon,
  className = '',
  style,
  ...props
}: BadgeProps) {
  const combinedStyles: CSSProperties = {
    ...baseStyles,
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
