import { type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './ProgressBar.css';

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
 * ProgressBar - BDS themed progress indicator
 *
 * A horizontal bar showing completion progress.
 * Uses BDS tokens for theming across all 8 theme variants.
 *
 * @example
 * ```tsx
 * <ProgressBar value={35} label="Upload progress" />
 * ```
 *
 * @summary Themed linear progress indicator
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
      style={style}
      {...props}
    >
      <div
        className="bds-progress-bar__fill"
        style={{
          width: `${clampedValue}%`,
          ...(fillColor ? { backgroundColor: fillColor } : {}),
        }}
      />
    </div>
  );
}

export default ProgressBar;
