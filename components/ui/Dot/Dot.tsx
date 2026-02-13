import { type HTMLAttributes, type CSSProperties } from 'react';

/**
 * Dot status variants
 */
export type DotStatus = 'default' | 'positive' | 'warning' | 'error' | 'info' | 'neutral';

/**
 * Dot size variants
 */
export type DotSize = 'sm' | 'md' | 'lg';

/**
 * Dot component props
 */
export interface DotProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status variant */
  status?: DotStatus;
  /** Size variant */
  size?: DotSize;
}

/**
 * Status-based colors using BDS system tokens
 * Matches Badge component color system for consistency
 *
 * Token reference:
 * - --system--green = #27ae60 (success)
 * - --system--yellow = #f2c94c (warning)
 * - --system--red = #eb5757 (error)
 * - --system--blue = #2f80ed (info)
 * - --grayscale--medium (neutral)
 * - --_color---background--brand-primary (default)
 */
const statusColors: Record<DotStatus, string> = {
  default: 'var(--_color---background--brand-primary)',
  positive: 'var(--system--green)',
  warning: 'var(--system--yellow)',
  error: 'var(--system--red)',
  info: 'var(--system--blue)',
  neutral: 'var(--grayscale--medium)',
};

/**
 * Size-based dimensions
 */
const sizeStyles: Record<DotSize, CSSProperties> = {
  sm: {
    width: '6px',
    height: '6px',
  },
  md: {
    width: '8px',
    height: '8px',
  },
  lg: {
    width: '10px',
    height: '10px',
  },
};

/**
 * Base dot styles
 */
const baseStyles: CSSProperties = {
  display: 'inline-block',
  borderRadius: '50%',
  flexShrink: 0,
};

/**
 * Dot - BDS themed status indicator dot
 *
 * A small circular indicator for displaying status or state.
 * Commonly used in lists, alongside text, or as activity indicators.
 *
 * @example
 * ```tsx
 * <Dot status="positive" />
 * <Dot status="error" size="lg" />
 * ```
 */
export function Dot({
  status = 'default',
  size = 'md',
  className = '',
  style,
  ...props
}: DotProps) {
  const combinedStyles: CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    backgroundColor: statusColors[status],
    ...style,
  };

  return (
    <span
      role="status"
      aria-label={`${status} status`}
      className={className || undefined}
      style={combinedStyles}
      {...props}
    />
  );
}

export default Dot;
