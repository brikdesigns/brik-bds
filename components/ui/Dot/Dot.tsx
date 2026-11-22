import type { HTMLAttributes } from 'react';
import { bdsClass, resolveRetiredValue } from '../../utils';
import './Dot.css';

export type DotTone = 'positive' | 'warning' | 'negative' | 'info' | 'neutral';
/** Hue source — `brand` paints the brand fill instead of a valence colour (ADR-033 § 2). */
export type DotEmphasis = 'brand';
export type DotSize = 'sm' | 'md' | 'lg';

/** @deprecated Renamed `DotTone` (ADR-033 § 2). */
export type DotStatus = DotTone;

/** `default` painted the brand fill; the no-valence case is `neutral` (ADR-033 § 1). */
const RETIRED_TONES: Record<string, DotTone> = { error: 'negative', default: 'neutral' };

export interface DotProps extends HTMLAttributes<HTMLSpanElement> {
  /** Valence variant */
  tone?: DotTone;
  /**
   * @deprecated Use `tone` instead (ADR-033 § 2). Honoured for one minor
   * version; `tone` wins when both are passed.
   */
  status?: DotTone;
  /** Hue source — `brand` overrides the `tone` colour with the brand fill. */
  emphasis?: DotEmphasis;
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
  emphasis,
  size = 'md',
  pulse = false,
  className,
  style,
  ...props
}: DotProps) {
  const resolved =
    resolveRetiredValue('Dot', tone !== undefined ? 'tone' : 'status', tone ?? status, RETIRED_TONES) ?? 'neutral';

  return (
    <span
      role="status"
      aria-label={`${resolved} status`}
      className={bdsClass(
        'bds-dot',
        `bds-dot--size-${size}`,
        `bds-dot--tone-${resolved}`,
        emphasis === 'brand' && 'bds-dot--emphasis-brand',
        pulse && 'bds-dot--pulse',
        className
      )}
      style={style}
      {...props}
    />
  );
}

export default Dot;
