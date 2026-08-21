import type { HTMLAttributes } from 'react';
import { bdsClass, resolveRetiredValue } from '../../utils';
import './Dot.css';

export type DotTone = 'default' | 'positive' | 'warning' | 'negative' | 'info' | 'neutral';
export type DotSize = 'sm' | 'md' | 'lg';

/** @deprecated Renamed `DotTone` (ADR-033 § 2). */
export type DotStatus = DotTone;

const RETIRED_TONES: Record<string, DotTone> = { error: 'negative' };

export interface DotProps extends HTMLAttributes<HTMLSpanElement> {
  /** Valence variant */
  tone?: DotTone;
  /**
   * @deprecated Use `tone` instead (ADR-033 § 2). Honoured for one minor
   * version; `tone` wins when both are passed.
   */
  status?: DotTone;
  /** Size variant */
  size?: DotSize;
  /** Pulse animation — use for active/running states */
  pulse?: boolean;
}

/**
 * Dot - Small status indicator circle.
 *
 * @example
 * ```tsx
 * <Dot tone="positive" />
 * <Dot tone="negative" size="lg" />
 * ```
 *
 * @summary Small status indicator circle
 */
export function Dot({
  tone,
  status,
  size = 'md',
  pulse = false,
  className,
  style,
  ...props
}: DotProps) {
  const resolved =
    resolveRetiredValue('Dot', tone !== undefined ? 'tone' : 'status', tone ?? status, RETIRED_TONES) ?? 'default';

  return (
    <span
      role="status"
      aria-label={`${resolved} status`}
      className={bdsClass(
        'bds-dot',
        `bds-dot--${size}`,
        `bds-dot--tone-${resolved}`,
        pulse && 'bds-dot--pulse',
        className
      )}
      style={style}
      {...props}
    />
  );
}

export default Dot;
