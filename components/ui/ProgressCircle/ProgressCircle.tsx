import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass, resolveRetiredValue } from '../../utils';
import './ProgressCircle.css';

export type ProgressCircleSize = 'sm' | 'md' | 'lg';
export type ProgressCircleTone = 'positive' | 'warning' | 'negative';

/** @deprecated Renamed `ProgressCircleTone` (ADR-033 § 2). */
export type ProgressCircleStatus = ProgressCircleTone;

/** `default` was the brand fill — what an unset `tone` renders — so it resolves to no tone class. */
const RETIRED_TONES: Record<string, string> = { default: 'brand' };
const RETIRED_REPLACEMENTS: Record<string, string> = { default: 'no `tone` (the brand fill is the default)' };

export interface ProgressCircleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'children'> {
  /** Progress value from 0 to 100. Ignored when `indeterminate` is true. */
  value: number;
  /** Diameter preset — `sm` 64px, `md` 96px, `lg` 128px */
  size?: ProgressCircleSize;
  /** Valence of the fill — omit for the brand fill */
  tone?: ProgressCircleTone;
  /**
   * @deprecated Use `tone` instead (ADR-033 § 2). Honoured for one minor
   * version; `tone` wins when both are passed.
   */
  status?: ProgressCircleTone;
  /** Accessible label for screen readers */
  label?: string;
  /** Centered slot — typically a percentage. Pass `true` to render `${value}%`, a node to render arbitrary content, or omit to render nothing. */
  showValue?: boolean | ReactNode;
  /** Animated continuous spin for unknown duration progress */
  indeterminate?: boolean;
  /** Override fill stroke color (escape hatch — defaults to the tone token) */
  fillColor?: string;
}

// bds-lint-ignore — geometry constants on the 4-pt grid; exposed as CSS-driven dimensions
const SIZE_CONFIG: Record<ProgressCircleSize, { diameter: number; stroke: number }> = {
  sm: { diameter: 64,  stroke: 6 },
  md: { diameter: 96,  stroke: 8 },
  lg: { diameter: 128, stroke: 10 },
};

/**
 * ProgressCircle — circular progress indicator.
 *
 * Third primitive in the Progress family alongside `<ProgressBar>` (linear) and
 * `<ProgressStepper>` (multi-step). Use for compact dashboards, completion
 * meters, and any single-value progress display where a circle reads better
 * than a bar.
 *
 * The centered slot accepts either a `value`-derived percentage (`showValue`)
 * or arbitrary node content for custom labels.
 *
 * @example Basic
 * ```tsx
 * <ProgressCircle value={72} showValue label="Onboarding completion" />
 * ```
 *
 * @example Tone
 * ```tsx
 * <ProgressCircle value={100} tone="positive" showValue />
 * ```
 *
 * @example Indeterminate
 * ```tsx
 * <ProgressCircle value={0} indeterminate label="Loading" />
 * ```
 *
 * @summary Themed circular progress indicator
 */
export function ProgressCircle({
  value,
  size = 'md',
  tone,
  status,
  label,
  showValue,
  indeterminate = false,
  fillColor,
  className,
  style,
  ...props
}: ProgressCircleProps) {
  const resolvedTone = resolveRetiredValue(
    'ProgressCircle',
    tone !== undefined ? 'tone' : 'status',
    (tone ?? status) as string | undefined,
    RETIRED_TONES,
    RETIRED_REPLACEMENTS,
  );
  const { diameter, stroke } = SIZE_CONFIG[size];
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const clampedValue = Math.min(100, Math.max(0, value));
  const dashOffset = indeterminate
    ? circumference * 0.75
    : circumference - (clampedValue / 100) * circumference;

  // Runtime-calculated SVG geometry — must stay inline
  const fillStyle: CSSProperties = {
    strokeDasharray: circumference,
    strokeDashoffset: dashOffset,
    ...(fillColor ? { stroke: fillColor } : {}),
  };

  const centerContent =
    showValue === true ? `${Math.round(clampedValue)}%` : showValue;

  return (
    <div
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      aria-busy={indeterminate || undefined}
      className={bdsClass(
        'bds-progress-circle',
        `bds-progress-circle--size-${size}`,
        resolvedTone && resolvedTone !== 'brand' && `bds-progress-circle--tone-${resolvedTone}`,
        indeterminate && 'bds-progress-circle--indeterminate',
        className,
      )}
      style={{ width: diameter, height: diameter, ...style }}
      {...props}
    >
      <svg
        className="bds-progress-circle__svg"
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        aria-hidden="true"
      >
        <circle
          className="bds-progress-circle__track"
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="bds-progress-circle__fill"
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          style={fillStyle}
        />
      </svg>
      {centerContent != null && centerContent !== false && (
        <div className={bdsClass('bds-progress-circle__center', `bds-progress-circle__center--size-${size}`)}>
          {centerContent}
        </div>
      )}
    </div>
  );
}

export default ProgressCircle;
