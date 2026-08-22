import type { HTMLAttributes } from 'react';
import { bdsClass, resolveRetiredValue } from '../../utils';
import './Counter.css';

export type CounterTone = 'positive' | 'negative' | 'warning' | 'neutral' | 'info' | 'brand';

/** @deprecated Renamed `CounterTone` (ADR-033 § 2). */
export type CounterStatus = CounterTone;

const RETIRED_TONES: Record<string, CounterTone> = {
  success: 'positive',
  error: 'negative',
  progress: 'info',
};
export type CounterSize = 'xs' | 'sm' | 'md' | 'lg';

export interface CounterProps extends HTMLAttributes<HTMLSpanElement> {
  /** Numeric count to display */
  count: number;
  /** Valence variant */
  tone?: CounterTone;
  /**
   * @deprecated Use `tone` instead (ADR-033 § 2). Honoured for one minor
   * version; `tone` wins when both are passed.
   */
  status?: CounterTone;
  /** Size variant */
  size?: CounterSize;
  /** Max count — displays "99+" if exceeded */
  max?: number;
}

/**
 * Counter - Numeric count indicator with tone colors.
 *
 * @example
 * ```tsx
 * <Counter count={5} tone="positive" />
 * <Counter count={150} max={99} tone="negative" size="lg" />
 * ```
 *
 * @summary Numeric count indicator with tone colors
 */
export function Counter({
  count,
  tone,
  status,
  size = 'sm',
  max,
  className,
  style,
  ...props
}: CounterProps) {
  const resolvedTone =
    resolveRetiredValue('Counter', tone !== undefined ? 'tone' : 'status', tone ?? status, RETIRED_TONES) ??
    'positive';
  const displayValue = max != null && count > max ? `${max}+` : String(count).padStart(2, '0');

  return (
    <span
      className={bdsClass('bds-counter', `bds-counter--${size}`, `bds-counter--tone-${resolvedTone}`, className)}
      style={style}
      aria-label={`Count: ${count}`}
      {...props}
    >
      {displayValue}
    </span>
  );
}

export default Counter;
