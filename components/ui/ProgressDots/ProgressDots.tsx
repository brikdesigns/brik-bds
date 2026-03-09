import { type CSSProperties, type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';

export type ProgressDotsSize = 'sm' | 'md';

export interface ProgressDotsProps extends HTMLAttributes<HTMLElement> {
  /** Total number of steps */
  count: number;
  /** Zero-indexed active step */
  activeStep: number;
  /** Size variant */
  size?: ProgressDotsSize;
  /**
   * When true, only completed dots (before active) are clickable.
   * When false (default), all dots are clickable.
   */
  linear?: boolean;
  /** Callback when a dot is clicked */
  onDotClick?: (index: number) => void;
}

const sizeConfig: Record<ProgressDotsSize, {
  dotSize: number;
  activeDotWidth: number;
  gap: string;
}> = {
  sm: {
    dotSize: 6,
    activeDotWidth: 18,
    gap: 'var(--gap-sm)',
  },
  md: {
    dotSize: 8,
    activeDotWidth: 24,
    gap: 'var(--gap-md)',
  },
};

/**
 * ProgressDots — horizontal dot indicator for multi-step flows.
 *
 * Lightweight companion to ProgressStepper. Shows the current position
 * in a flow with animated width transitions. Use on mobile or as a
 * compact alternative to the full vertical stepper.
 *
 * Respects the same `linear` prop as ProgressStepper — when true,
 * users can only tap back to completed dots.
 */
export function ProgressDots({
  count,
  activeStep,
  size = 'md',
  linear = false,
  onDotClick,
  className = '',
  style,
  ...props
}: ProgressDotsProps) {
  const config = sizeConfig[size];

  const containerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: config.gap,
    ...style,
  };

  return (
    <nav
      className={bdsClass('bds-progress-dots', className)}
      style={containerStyle}
      role="tablist"
      aria-label="Progress"
      {...props}
    >
      {Array.from({ length: count }, (_, index) => {
        const isActive = index === activeStep;
        const isComplete = index < activeStep;
        const isClickable = onDotClick && (
          linear ? isComplete : true
        );

        const dotStyle: CSSProperties = {
          width: isActive ? config.activeDotWidth : config.dotSize,
          height: config.dotSize,
          borderRadius: 'var(--border-radius-sm)',
          backgroundColor: isActive
            ? 'var(--background-brand-primary)'
            : isComplete
              ? 'var(--background-brand-primary)'
              : 'var(--border-secondary)',
          opacity: isComplete ? 0.5 : 1,
          border: 'none',
          cursor: isClickable ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          padding: 0,
          flexShrink: 0,
        };

        return (
          <button
            key={index}
            type="button"
            role="tab"
            style={dotStyle}
            onClick={isClickable ? () => onDotClick(index) : undefined}
            aria-selected={isActive}
            aria-label={`Step ${index + 1} of ${count}`}
            aria-disabled={!isClickable && onDotClick ? true : undefined}
            tabIndex={isClickable ? 0 : -1}
          />
        );
      })}
    </nav>
  );
}

export default ProgressDots;
