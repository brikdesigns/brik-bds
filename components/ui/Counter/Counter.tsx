import type { HTMLAttributes } from 'react';
import { bdsClass, resolveRetiredValue } from '../../utils';
import './Counter.css';

export type CounterTone = 'positive' | 'negative' | 'warning' | 'neutral' | 'info';

/** Hue source — `brand` paints the brand fill instead of a valence colour (ADR-033 § 2). */
export type CounterEmphasis = 'brand';

/** @deprecated Renamed `CounterTone` (ADR-033 § 2). */
export type CounterStatus = CounterTone;

/** `brand` was a valence member; it is a hue source now, so it moves to `emphasis`. */
const RETIRED_TONES: Record<string, string> = {
  success: 'positive',
  error: 'negative',
  progress: 'info',
  brand: 'brand',
};
const RETIRED_REPLACEMENTS: Record<string, string> = { brand: 'emphasis="brand"' };
export type CounterSize = 'xs' | 'sm' | 'md' | 'lg';

export interface CounterProps extends HTMLAttributes<HTMLSpanElement> {
  /** Numeric count to display */
  count: number;
  /** Valence variant */
  tone?: CounterTone;
  /** Hue source — `brand` overrides the `tone` colour with the brand fill. */
  emphasis?: CounterEmphasis;
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
  emphasis,
  status,
  size = 'sm',
  max,
  className,
  style,
  ...props
}: CounterProps) {
  const resolvedIncoming = resolveRetiredValue<string>(
    'Counter',
    tone !== undefined ? 'tone' : 'status',
    tone ?? status,
    RETIRED_TONES,
    RETIRED_REPLACEMENTS,
  );
  const brandTone = resolvedIncoming === 'brand';
  const resolvedTone = (brandTone ? undefined : resolvedIncoming) ?? 'positive';
  const resolvedEmphasis = emphasis ?? (brandTone ? 'brand' : undefined);
  const displayValue = max != null && count > max ? `${max}+` : String(count).padStart(2, '0');

  return (
    <span
      className={bdsClass('bds-counter', `bds-counter--size-${size}`, `bds-counter--tone-${resolvedTone}`, resolvedEmphasis === 'brand' && 'bds-counter--emphasis-brand', className)}
      style={style}
      aria-label={`Count: ${count}`}
      {...props}
    >
      {displayValue}
    </span>
  );
}

export default Counter;
