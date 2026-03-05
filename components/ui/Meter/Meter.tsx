import { type HTMLAttributes, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

/**
 * Meter status variants — maps to BDS system color tokens
 */
export type MeterStatus = 'positive' | 'warning' | 'error' | 'neutral';

/**
 * Meter size variants — controls bar height
 */
export type MeterSize = 'sm' | 'md' | 'lg';

/**
 * Meter component props
 *
 * Horizontal bar gauge that visualizes a value relative to a maximum.
 * Inspired by Carbon Design System gauge API surface.
 */
export interface MeterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Current value */
  value: number;
  /** Maximum value */
  max: number;
  /** Status variant — drives fill color via system tokens */
  status?: MeterStatus;
  /** Bar height: sm=8px, md=12px, lg=16px */
  size?: MeterSize;
  /** Label below bar (e.g. "Pass", "Fair", "Fail") */
  label?: string;
  /** Show formatted value below label (default: true) */
  showValue?: boolean;
  /** Custom value formatter (default: "6/7") */
  valueFormatter?: (value: number, max: number) => string;
}

const STATUS_COLORS: Record<MeterStatus, string> = {
  positive: 'var(--_color---system--green)',
  warning: 'var(--_color---system--yellow)',
  error: 'var(--_color---system--red)',
  neutral: 'var(--_color---background--tertiary)',
};

const SIZE_HEIGHT: Record<MeterSize, number> = {
  sm: 8,
  md: 12,
  lg: 16,
};

function defaultFormatter(value: number, max: number): string {
  return `${value}/${max}`;
}

/**
 * Meter — a horizontal bar gauge for visualizing scores and ratings.
 *
 * Uses BDS system color tokens for status-driven fill colors.
 * No external dependencies — pure CSS with inline styles.
 *
 * @example
 * ```tsx
 * <Meter value={6} max={7} status="positive" label="Pass" />
 * <Meter value={3} max={10} status="warning" label="Fair" size="lg" />
 * <Meter value={1} max={5} status="error" label="Fail" showValue={false} />
 * ```
 */
export function Meter({
  value,
  max,
  status = 'neutral',
  size = 'md',
  label,
  showValue = true,
  valueFormatter = defaultFormatter,
  className,
  style,
  ...rest
}: MeterProps) {
  const percentage = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;
  const barHeight = SIZE_HEIGHT[size];
  const fillColor = STATUS_COLORS[status];

  const trackStyle: CSSProperties = {
    width: '100%',
    height: barHeight,
    backgroundColor: 'var(--_color---background--secondary)',
    borderRadius: barHeight / 2,
    overflow: 'hidden',
  };

  const fillStyle: CSSProperties = {
    width: `${percentage}%`,
    height: '100%',
    backgroundColor: fillColor,
    borderRadius: barHeight / 2,
    transition: 'width 0.3s ease',
  };

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--_spacing---xs)',
    ...style,
  };

  const labelStyle: CSSProperties = {
    fontFamily: 'var(--_typography---font-family--body)',
    fontSize: 'var(--_typography---body--sm)',
    color: 'var(--_color---text--secondary)',
    marginTop: 'var(--_spacing---2xs)',
  };

  const valueStyle: CSSProperties = {
    fontFamily: 'var(--_typography---font-family--heading)',
    fontSize: 'var(--_typography---heading--large)',
    fontWeight: 700,
    color: 'var(--_color---text--primary)',
  };

  const valueSubStyle: CSSProperties = {
    fontFamily: 'var(--_typography---font-family--body)',
    fontSize: 'var(--_typography---body--sm)',
    color: 'var(--_color---text--secondary)',
  };

  return (
    <div
      className={bdsClass('bds-meter', className)}
      style={containerStyle}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label ?? `${value} of ${max}`}
      {...rest}
    >
      <div style={trackStyle}>
        <div style={fillStyle} />
      </div>
      {label && <span style={labelStyle}>{label}</span>}
      {showValue && (
        <div>
          <span style={valueStyle}>{valueFormatter(value, max)}</span>
          <span style={valueSubStyle}> Score</span>
        </div>
      )}
    </div>
  );
}

export default Meter;
