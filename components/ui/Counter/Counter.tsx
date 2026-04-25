import type { HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './Counter.css';

export type CounterStatus = 'success' | 'error' | 'warning' | 'neutral' | 'progress' | 'brand';
export type CounterSize = 'xs' | 'sm' | 'md' | 'lg';

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
 * Counter - Numeric count indicator with status colors.
 *
 * @example
 * ```tsx
 * <Counter count={5} status="success" />
 * <Counter count={150} max={99} status="error" size="lg" />
 * ```
 *
 * @summary Numeric count indicator with status colors
 */
export function Counter({
  count,
  status = 'success',
  size = 'sm',
  max,
  className,
  style,
  ...props
}: CounterProps) {
  const displayValue = max != null && count > max ? `${max}+` : String(count).padStart(2, '0');

  return (
    <span
      className={bdsClass('bds-counter', `bds-counter--${size}`, `bds-counter--${status}`, className)}
      style={style}
      aria-label={`Count: ${count}`}
      {...props}
    >
      {displayValue}
    </span>
  );
}

export default Counter;
