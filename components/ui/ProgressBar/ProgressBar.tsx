import { type CSSProperties, type HTMLAttributes } from 'react';

/**
 * ProgressBar component props
 */
export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Progress value from 0 to 100 */
  value: number;
  /** Accessible label for screen readers */
  label?: string;
}

/**
 * Track (outer container) styles
 *
 * Token reference:
 * - --_color---background--input (track background — white)
 * - --_color---border--muted (track border — lighter gray)
 */
const trackStyles: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '6px',
  backgroundColor: 'var(--_color---background--input)',
  border: 'var(--_border-width---sm) solid var(--_color---border--muted)',
  borderRadius: '3px',
  overflow: 'hidden',
};

/**
 * Fill bar styles
 *
 * Token reference:
 * - --_color---background--brand-primary (fill color — blue)
 */
const barStyles: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  backgroundColor: 'var(--_color---background--brand-primary)',
  borderRadius: '3px',
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
      style={{ ...trackStyles, ...style }}
      {...props}
    >
      <div
        style={{
          ...barStyles,
          width: `${clampedValue}%`,
        }}
      />
    </div>
  );
}

export default ProgressBar;
