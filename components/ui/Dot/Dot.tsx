import { type HTMLAttributes, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

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
 * - --color-system-green = #27ae60 (success)
 * - --color-system-yellow = #f2c94c (warning)
 * - --color-system-red = #eb5757 (error)
 * - --color-system-blue = #2f80ed (info)
 * - --color-grayscale-light (neutral)
 * - --background-brand-primary (default)
 */
const statusColors: Record<DotStatus, string> = {
  default: 'var(--background-brand-primary)',
  positive: 'var(--color-system-green)',
  warning: 'var(--color-system-yellow)',
  error: 'var(--color-system-red)',
  info: 'var(--color-system-blue)',
  neutral: 'var(--color-grayscale-light)',
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
      className={bdsClass('bds-dot', className)}
      style={combinedStyles}
      {...props}
    />
  );
}

export default Dot;
