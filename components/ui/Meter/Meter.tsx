import { type HTMLAttributes } from 'react';
import { bdsClass, resolveRetiredValue } from '../../utils';
import './Meter.css';

/**
 * Meter tone variants — maps to BDS system color tokens
 */
export type MeterTone = 'positive' | 'warning' | 'negative' | 'neutral';

/** @deprecated Renamed `MeterTone` (ADR-033 § 2). */
export type MeterStatus = MeterTone;

const RETIRED_TONES: Record<string, MeterTone> = { error: 'negative' };

/**
 * Meter size variants — controls bar height
 */
export type MeterSize = 'sm' | 'md' | 'lg';

/**
 * Label position relative to the bar
 */
export type MeterLabelPosition = 'above' | 'below';

/**
 * Visible value text form: `ratio` → "6/7", `fraction` → "6 of 7".
 */
export type MeterValueFormat = 'ratio' | 'fraction';

/**
 * Meter component props
 *
 * Horizontal bar gauge that visualizes a value relative to a maximum.
 */
export interface MeterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Current value */
  value: number;
  /** Maximum value */
  max: number;
  /** Valence variant — drives fill color via system tokens */
  tone?: MeterTone;
  /**
   * @deprecated Use `tone` instead (ADR-033 § 2). Honoured for one minor
   * version; `tone` wins when both are passed.
   */
  status?: MeterTone;
  /** Bar height: sm=8px, md=12px, lg=16px */
  size?: MeterSize;
  /** Label text (e.g. "Pass", "Fair", "Fail") */
  label?: string;
  /** Show formatted value (default: true) */
  showValue?: boolean;
  /** Custom value formatter (default: "6/7") */
  valueFormatter?: (value: number, max: number) => string;
  /**
   * Visible text form (default: "ratio" → "6/7"). "fraction" renders
   * "3 of 8" plus `unit` ("3 of 8 tasks done") with no " Score" suffix.
   * `valueFormatter` wins when passed.
   */
  valueFormat?: MeterValueFormat;
  /** Unit text after a fraction value (e.g. "tasks done"). Only used with `valueFormat="fraction"`. */
  unit?: string;
  /** Position label/value above or below the bar (default: "below") */
  labelPosition?: MeterLabelPosition;
  /** Suffix rendered after the value (default: " Score"). Pass "" to suppress. */
  valueSuffix?: string;
  /** Override the fill color. When set, `tone` no longer drives the bar color. Mirrors ProgressBar's `fillColor` escape hatch. */
  fillColor?: string;
}

function defaultFormatter(value: number, max: number): string {
  return `${value}/${max}`;
}

function fractionFormatter(value: number, max: number): string {
  return `${value} of ${max}`;
}

/**
 * Meter — a horizontal bar gauge for visualizing scores and ratings.
 *
 * Uses BDS system color tokens for tone-driven fill colors.
 *
 * @example
 * ```tsx
 * <Meter value={6} max={7} tone="positive" label="Pass" />
 * <Meter value={3} max={10} tone="warning" label="Fair" size="lg" />
 * <Meter value={1} max={5} tone="negative" label="Fail" showValue={false} />
 * <Meter value={3} max={8} valueFormat="fraction" unit="tasks done" />
 *
 * // Plain "X/Y" with no suffix (e.g. completion counters):
 * <Meter value={4} max={10} valueSuffix="" />
 *
 * // Category-driven fill (e.g. per-department palette colors):
 * <Meter value={3} max={8} valueSuffix="" fillColor={departmentColor.base} />
 * ```
 *
 * @summary Horizontal gauge bar for scores and ratings
 */
export function Meter({
  value,
  max,
  tone,
  status,
  size = 'md',
  label,
  showValue = true,
  valueFormatter,
  valueFormat = 'ratio',
  unit,
  labelPosition = 'below',
  valueSuffix,
  fillColor,
  className,
  style,
  ...rest
}: MeterProps) {
  const resolvedTone =
    resolveRetiredValue('Meter', tone !== undefined ? 'tone' : 'status', tone ?? status, RETIRED_TONES) ?? 'neutral';
  const percentage = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;

  const isFraction = valueFormat === 'fraction' && !valueFormatter;
  const formatValue = valueFormatter ?? (isFraction ? fractionFormatter : defaultFormatter);
  const suffix = valueSuffix ?? (isFraction ? (unit ? ` ${unit}` : '') : ' Score');

  const textContent = (
    <>
      {label && (
        <span className={bdsClass('bds-meter__label', `bds-meter__label--relation-${labelPosition}`)}>
          {label}
        </span>
      )}
      {showValue && (
        <div>
          <span className="bds-meter__value">{formatValue(value, max)}</span>
          {suffix && (
            <span className="bds-meter__value-suffix">{suffix}</span>
          )}
        </div>
      )}
    </>
  );

  const track = (
    <div className={bdsClass('bds-meter__track', `bds-meter__track--size-${size}`)}>
      <div
        className={bdsClass(
          'bds-meter__fill',
          `bds-meter__fill--size-${size}`,
          !fillColor && `bds-meter__fill--tone-${resolvedTone}`,
        )}
        style={{
          width: `${percentage}%`,
          ...(fillColor ? { backgroundColor: fillColor } : {}),
        }}
      />
    </div>
  );

  return (
    <div
      className={bdsClass('bds-meter', className)}
      style={style}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label ?? `${value} of ${max}`}
      {...rest}
    >
      {labelPosition === 'above' ? (
        <>
          {textContent}
          {track}
        </>
      ) : (
        <>
          {track}
          {textContent}
        </>
      )}
    </div>
  );
}

export default Meter;
