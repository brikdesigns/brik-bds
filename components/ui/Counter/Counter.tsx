import { type HTMLAttributes, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

/**
 * Counter status variants
 */
export type CounterStatus = 'success' | 'error' | 'warning' | 'neutral' | 'progress' | 'brand';

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
 * - --color-system-green = #27ae60 (success)
 * - --color-system-red = #eb5757 (error)
 * - --color-system-yellow = #f2c94c (warning)
 * - --color-system-blue = #2f80ed (progress)
 * - --color-grayscale-lighter = #e0e0e0 (neutral)
 * - --background-brand-primary (brand background)
 * - --text-inverse (on-color text)
 */
const statusStyles: Record<CounterStatus, CSSProperties> = {
  success: {
    backgroundColor: 'var(--color-system-green)',
    color: 'var(--text-inverse)',
  },
  error: {
    backgroundColor: 'var(--color-system-red)',
    color: 'var(--text-inverse)',
  },
  warning: {
    backgroundColor: 'var(--color-system-yellow)',
    color: 'var(--text-primary)',
  },
  neutral: {
    backgroundColor: 'var(--color-grayscale-lighter)',
    color: 'var(--text-primary)',
  },
  progress: {
    backgroundColor: 'var(--color-system-blue)',
    color: 'var(--text-inverse)',
  },
  brand: {
    backgroundColor: 'var(--background-brand-primary)',
    color: 'var(--text-inverse)',
  },
};

/**
 * Size-based styles
 *
 * Figma specs (pre-spacing-update, tokens now resolve to larger values):
 * - sm: --padding-sm (12px) x --padding-md (16px), font-size ~11px (body--tiny)
 * - md: --padding-md (16px) x --padding-lg (24px), font-size 14px (label--sm)
 * - lg: --padding-md (16px) x --padding-lg (24px), font-size 16px (label--md-base)
 */
const sizeStyles: Record<CounterSize, CSSProperties> = {
  sm: {
    padding: 'var(--padding-sm) var(--padding-md)',
    fontSize: 'var(--body-tiny)',
  },
  md: {
    padding: 'var(--padding-md) var(--padding-lg)',
    fontSize: 'var(--label-sm)',
  },
  lg: {
    padding: 'var(--padding-md) var(--padding-lg)',
    fontSize: 'var(--label-md)',
  },
};

/**
 * Base counter styles
 *
 * Token reference:
 * - --font-family-label (label font)
 * - --font-weight-semi-bold = 600
 * - border-radius: 9999px (full pill)
 */
const baseStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-family-label)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
  borderRadius: 'var(--border-radius-pill)',
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
      className={bdsClass('bds-counter', className)}
      style={combinedStyles}
      aria-label={`Count: ${count}`}
      {...props}
    >
      {displayValue}
    </span>
  );
}

export default Counter;
