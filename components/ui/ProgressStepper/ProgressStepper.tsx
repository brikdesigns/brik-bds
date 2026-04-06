import { type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './ProgressStepper.css';

export type ProgressStepperSize = 'sm' | 'md';

export type StepStatus = 'complete' | 'active' | 'upcoming';

export interface ProgressStep {
  /** Step label text */
  label: string;
  /** Optional description shown below the label */
  description?: string;
}

export interface ProgressStepperProps extends HTMLAttributes<HTMLElement> {
  /** Array of step definitions */
  steps: ProgressStep[];
  /** Zero-indexed active step */
  activeStep: number;
  /** Size variant */
  size?: ProgressStepperSize;
  /**
   * When true, users can only navigate to completed steps — not skip ahead.
   * Upcoming steps are visually muted and non-interactive.
   * When false (default), all steps are clickable.
   */
  linear?: boolean;
  /** Callback when a step is clicked */
  onStepClick?: (index: number) => void;
}

// bds-lint-ignore — Figma-driven circle sizes, used for label padding calc
const CIRCLE_SIZE: Record<ProgressStepperSize, number> = {
  sm: 24,
  md: 32,
};

function getStepStatus(index: number, activeStep: number): StepStatus {
  if (index < activeStep) return 'complete';
  if (index === activeStep) return 'active';
  return 'upcoming';
}

/**
 * ProgressStepper — vertical step progression indicator.
 *
 * Shows numbered steps with complete/active/upcoming states.
 * Complete steps show a checkmark, active step is highlighted,
 * upcoming steps are muted.
 *
 * Use `linear` to prevent skipping ahead — only completed and active
 * steps are clickable. The user must advance via a primary CTA.
 */
export function ProgressStepper({
  steps,
  activeStep,
  size = 'md',
  linear = false,
  onStepClick,
  className = '',
  style,
  ...props
}: ProgressStepperProps) {
  const circleSize = CIRCLE_SIZE[size];

  return (
    <nav
      className={bdsClass('bds-progress-stepper', className)}
      style={style}
      role="list"
      aria-label="Progress"
      {...props}
    >
      {steps.map((step, index) => {
        const status = getStepStatus(index, activeStep);
        const isLast = index === steps.length - 1;

        const isClickable = onStepClick && (
          linear
            ? status === 'complete'
            : status !== 'upcoming'
        );

        const handleClick = () => {
          if (isClickable) onStepClick(index);
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onStepClick!(index);
          }
        };

        return (
          <div key={index} role="listitem" aria-current={status === 'active' ? 'step' : undefined}>
            <div
              className={bdsClass(
                'bds-progress-stepper__step-row',
                `bds-progress-stepper__step-row--${size}`,
                isClickable && 'bds-progress-stepper__step-row--clickable',
              )}
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              aria-label={isClickable ? `Go to step ${index + 1}: ${step.label}` : undefined}
              aria-disabled={!isClickable && onStepClick ? true : undefined}
            >
              <div
                className={bdsClass(
                  'bds-progress-stepper__circle',
                  `bds-progress-stepper__circle--${size}`,
                  `bds-progress-stepper__circle--${status}`,
                )}
              >
                {status === 'complete' ? (
                  <svg width={circleSize * 0.45} height={circleSize * 0.45} viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {/* bds-lint-ignore — padding aligns label vertically with circle center */}
              <div style={{ paddingTop: `${(circleSize - 20) / 2}px` }}>
                <div
                  className={bdsClass(
                    'bds-progress-stepper__label',
                    `bds-progress-stepper__label--${size}`,
                    `bds-progress-stepper__label--${status}`,
                  )}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div
                    className={bdsClass(
                      'bds-progress-stepper__desc',
                      `bds-progress-stepper__desc--${size}`,
                    )}
                  >
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            {!isLast && (
              <div
                className={bdsClass(
                  'bds-progress-stepper__connector',
                  `bds-progress-stepper__connector--${size}`,
                  status === 'complete'
                    ? 'bds-progress-stepper__connector--complete'
                    : 'bds-progress-stepper__connector--incomplete',
                )}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default ProgressStepper;
