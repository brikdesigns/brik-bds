import { type CSSProperties, type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';

/**
 * ProgressBar component props
 */
export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Progress value from 0 to 100 */
  value: number;
  /** Accessible label for screen readers */
  label?: string;
  /** Override fill bar color (defaults to brand-primary) */
  fillColor?: string;
}

/**
 * Track (outer container) styles
 *
 * Token reference:
 * - --background-input (track background — white)
 * - --border-muted (track border — lighter gray)
 */
const trackStyles: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '6px', // bds-lint-ignore — Figma-driven track height
  backgroundColor: 'var(--background-input)',
  border: 'var(--border-width-sm) solid var(--border-muted)',
  borderRadius: 'var(--border-radius-sm)', // bds-lint-ignore — half track height
  overflow: 'hidden',
};

/**
 * Fill bar styles
 *
 * Token reference:
 * - --background-brand-primary (fill color — blue)
 */
const barStyles: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  backgroundColor: 'var(--background-brand-primary)',
  borderRadius: 'var(--border-radius-sm)', // bds-lint-ignore — half track height
  transition: 'width 0.3s ease',
};

/**
 * ProgressBar - BDS themed progress indicator
 *
 * A horizontal bar showing completion progress.
 * Uses BDS tokens for theming across all 8 theme variants.
 *
 * @example
 * ```tsx
 * <ProgressBar value={35} label="Upload progress" />
 * ```
 */
export function ProgressBar({
  value,
  label,
  fillColor,
  className,
  style,
  ...props
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={bdsClass('bds-progress-bar', className)}
      style={{ ...trackStyles, ...style }}
      {...props}
    >
      <div
        style={{
          ...barStyles,
          width: `${clampedValue}%`,
          ...(fillColor ? { backgroundColor: fillColor } : {}),
        }}
      />
    </div>
  );
}

export default ProgressBar;
