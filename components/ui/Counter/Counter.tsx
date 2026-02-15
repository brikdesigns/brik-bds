import { type HTMLAttributes, type CSSProperties } from 'react';

/**
 * Counter status variants
 */
export type CounterStatus = 'success' | 'error' | 'warning' | 'neutral' | 'progress';

/**
 * Counter size variants
 */
export type CounterSize = 'sm' | 'md' | 'lg';

/**
 * Counter component props
 */
export interface CounterProps extends HTMLAttributes<HTMLSpanElement> {
  /** Numeric count to display */
  count: number;
  /** Status variant */
  status?: CounterStatus;
  /** Size variant */
  size?: CounterSize;
  /** Max count — displays "99+" if exceeded */
  max?: number;
}

/**
 * Status-based colors using BDS system tokens
 *
 * Token reference:
 * - --system--green = #27ae60 (success)
 * - --system--red = #eb5757 (error)
 * - --system--yellow = #f2c94c (warning)
 * - --system--blue = #2f80ed (progress)
 * - --grayscale--lighter = #e0e0e0 (neutral)
 */
const statusStyles: Record<CounterStatus, CSSProperties> = {
  success: {
    backgroundColor: 'var(--system--green)',
    color: 'var(--_color---text--inverse)',
  },
  error: {
    backgroundColor: 'var(--system--red)',
    color: 'var(--_color---text--inverse)',
  },
  warning: {
    backgroundColor: 'var(--system--yellow)',
    color: 'var(--_color---text--primary)',
  },
  neutral: {
    backgroundColor: 'var(--grayscale--lighter)',
    color: 'var(--_color---text--primary)',
  },
  progress: {
    backgroundColor: 'var(--system--blue)',
    color: 'var(--_color---text--inverse)',
  },
};

/**
 * Size-based styles
 *
 * Figma specs:
 * - sm: 6px 8px padding, font-size ~11px (body--tiny)
 * - md: 8px 16px padding, font-size 14px (label--sm)
 * - lg: 8px 16px padding, font-size 16px (label--md-base)
 */
const sizeStyles: Record<CounterSize, CSSProperties> = {
  sm: {
    padding: 'var(--_space---sm) var(--_space---md)',
    fontSize: 'var(--_typography---body--tiny)',
  },
  md: {
    padding: 'var(--_space---md) var(--_space---lg)',
    fontSize: 'var(--_typography---label--sm)',
  },
  lg: {
    padding: 'var(--_space---md) var(--_space---lg)',
    fontSize: 'var(--_typography---label--md-base)',
  },
};

/**
 * Base counter styles
 *
 * Token reference:
 * - --_typography---font-family--label (label font)
 * - --font-weight--semi-bold = 600
 * - border-radius: 9999px (full pill)
 */
const baseStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--_typography---font-family--label)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  lineHeight: 1,
  borderRadius: '9999px',
  whiteSpace: 'nowrap',
  overflow: 'clip',
  minWidth: 0,
};

/**
 * Counter - BDS numeric count indicator
 *
 * Pill-shaped badge displaying a numeric count with status colors.
 * Uses CSS variables for theming. Shares the status color system
 * with Badge but displays only numeric content.
 *
 * @example
 * ```tsx
 * <Counter count={5} status="success" />
 * <Counter count={12} status="error" size="md" />
 * <Counter count={150} max={99} status="progress" size="lg" />
 * ```
 */
export function Counter({
  count,
  status = 'success',
  size = 'sm',
  max,
  className = '',
  style,
  ...props
}: CounterProps) {
  const displayValue = max != null && count > max ? `${max}+` : String(count).padStart(2, '0');

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
      aria-label={`Count: ${count}`}
      {...props}
    >
      {displayValue}
    </span>
  );
}

export default Counter;
