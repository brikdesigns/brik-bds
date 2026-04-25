import { type CSSProperties, type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './ProgressStepper.css';

export type ProgressStepperSize = 'sm' | 'md';
export type ProgressStepperVariant = 'steps' | 'dots';

export type StepStatus = 'complete' | 'active' | 'upcoming';

export interface ProgressStep {
  /** Step label text */
  label: string;
  /** Optional description shown below the label */
  description?: string;
}

interface CommonProgressStepperProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Zero-indexed active step */
  activeStep: number;
  /** Size variant */
  size?: ProgressStepperSize;
  /**
   * When true, users can only navigate to completed steps — not skip ahead.
   * Upcoming steps are visually muted and non-interactive.
   * When false (default), all non-upcoming steps are clickable.
   */
  linear?: boolean;
  /** Callback when a step is clicked */
  onStepClick?: (index: number) => void;
}

interface StepsProgressStepperProps extends CommonProgressStepperProps {
  /** Visual variant — 'steps' (default) renders a vertical labeled stepper */
  variant?: 'steps';
  /** Step definitions with labels and optional descriptions */
  steps: ProgressStep[];
}

interface DotsProgressStepperProps extends CommonProgressStepperProps {
  /** Visual variant — 'dots' renders a compact horizontal dot indicator */
  variant: 'dots';
  /** Total number of dots */
  count: number;
}

export type ProgressStepperProps = StepsProgressStepperProps | DotsProgressStepperProps;

// bds-lint-ignore — Figma-driven circle sizes, used for label padding calc
const CIRCLE_SIZE: Record<ProgressStepperSize, number> = {
  sm: 24,
  md: 32,
};

// bds-lint-ignore — Figma-driven dot sizes for the 'dots' variant
const DOTS_CONFIG: Record<ProgressStepperSize, { dotSize: number; activeDotWidth: number; gap: string }> = {
  sm: { dotSize: 6, activeDotWidth: 18, gap: 'var(--gap-sm)' },
  md: { dotSize: 8, activeDotWidth: 24, gap: 'var(--gap-md)' },
};

function getStepStatus(index: number, activeStep: number): StepStatus {
  if (index < activeStep) return 'complete';
  if (index === activeStep) return 'active';
  return 'upcoming';
}

/**
 * ProgressStepper — multi-step progress indicator.
 *
 * Two visual variants share the same `activeStep` / `linear` / `onStepClick`
 * model. Pick the one that fits the layout:
 *
 * - **`variant="steps"`** (default) — vertical labeled list with numbered
 *   circles, checkmarks on complete, and optional descriptions per step.
 *   Use for setup wizards, checkout flows, and multi-page forms.
 *
 * - **`variant="dots"`** — compact horizontal dot row with the active dot
 *   stretching wider. No labels. Use on mobile, in carousels, or as a
 *   minimal alternative when label text is redundant with the page heading.
 *
 * `linear` mode applies to both: only completed steps are clickable, and
 * the user must advance via a primary CTA.
 *
 * @example Steps variant
 * ```tsx
 * <ProgressStepper
 *   steps={[
 *     { label: 'Account', description: 'Set a password' },
 *     { label: 'Profile' },
 *     { label: 'Review' },
 *   ]}
 *   activeStep={1}
 *   onStepClick={setStep}
 * />
 * ```
 *
 * @example Dots variant
 * ```tsx
 * <ProgressStepper
 *   variant="dots"
 *   count={5}
 *   activeStep={2}
 *   onStepClick={setStep}
 * />
 * ```
 */
export function ProgressStepper(props: ProgressStepperProps) {
  if (props.variant === 'dots') {
    return <DotsRender {...props} />;
  }
  return <StepsRender {...props} />;
}

function StepsRender({
  steps,
  activeStep,
  size = 'md',
  linear = false,
  onStepClick,
  className = '',
  style,
  variant: _variant,
  ...props
}: StepsProgressStepperProps) {
  const circleSize = CIRCLE_SIZE[size];

  return (
    <nav
      className={bdsClass(
        'bds-progress-stepper',
        'bds-progress-stepper--variant-steps',
        className,
      )}
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

function DotsRender({
  count,
  activeStep,
  size = 'md',
  linear = false,
  onStepClick,
  className = '',
  style,
  variant: _variant,
  ...props
}: DotsProgressStepperProps) {
  const config = DOTS_CONFIG[size];

  return (
    <nav
      className={bdsClass(
        'bds-progress-stepper',
        'bds-progress-stepper--variant-dots',
        className,
      )}
      style={{ gap: config.gap, ...style }}
      role="tablist"
      aria-label="Progress"
      {...props}
    >
      {Array.from({ length: count }, (_, index) => {
        const isActive = index === activeStep;
        const isComplete = index < activeStep;
        const isClickable = onStepClick && (linear ? isComplete : true);

        // Runtime-calculated dimensions per dot state — must stay inline
        const dotStyle: CSSProperties = {
          width: isActive ? config.activeDotWidth : config.dotSize,
          height: config.dotSize,
        };

        return (
          <button
            key={index}
            type="button"
            role="tab"
            className={bdsClass(
              'bds-progress-stepper__dot',
              isActive && 'bds-progress-stepper__dot--active',
              isComplete && 'bds-progress-stepper__dot--complete',
              !isActive && !isComplete && 'bds-progress-stepper__dot--inactive',
              isClickable
                ? 'bds-progress-stepper__dot--clickable'
                : 'bds-progress-stepper__dot--non-clickable',
            )}
            style={dotStyle}
            onClick={isClickable ? () => onStepClick(index) : undefined}
            aria-selected={isActive}
            aria-label={`Step ${index + 1} of ${count}`}
            aria-disabled={!isClickable && onStepClick ? true : undefined}
            tabIndex={isClickable ? 0 : -1}
          />
        );
      })}
    </nav>
  );
}

export default ProgressStepper;
