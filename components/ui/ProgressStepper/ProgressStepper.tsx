import { type CSSProperties, type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';

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

const sizeConfig: Record<ProgressStepperSize, {
  circleSize: number;
  fontSize: string;
  labelSize: string;
  descSize: string;
  gap: string;
  connectorWidth: string;
}> = {
  sm: {
    circleSize: 24,
    fontSize: 'var(--body-tiny)',
    labelSize: 'var(--body-sm)',
    descSize: 'var(--body-tiny)',
    gap: 'var(--gap-xs)',
    connectorWidth: '2px',
  },
  md: {
    circleSize: 32,
    fontSize: 'var(--body-sm)',
    labelSize: 'var(--body-md)',
    descSize: 'var(--body-sm)',
    gap: 'var(--gap-sm)',
    connectorWidth: '2px',
  },
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
  const config = sizeConfig[size];

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    ...style,
  };

  return (
    <nav
      className={bdsClass('bds-progress-stepper', className)}
      style={containerStyle}
      role="list"
      aria-label="Progress"
      {...props}
    >
      {steps.map((step, index) => {
        const status = getStepStatus(index, activeStep);
        const isLast = index === steps.length - 1;

        // In linear mode: only complete steps are clickable (go back).
        // In non-linear mode: complete + active steps are clickable.
        const isClickable = onStepClick && (
          linear
            ? status === 'complete'
            : status !== 'upcoming'
        );

        const circleStyle: CSSProperties = {
          width: config.circleSize,
          height: config.circleSize,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: config.fontSize,
          fontFamily: 'var(--font-family-label)',
          fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
          flexShrink: 0,
          transition: 'all 0.15s ease',
          ...(status === 'active' ? {
            backgroundColor: 'var(--background-brand-primary)',
            color: '#ffffff',
          } : status === 'complete' ? {
            backgroundColor: 'var(--background-brand-primary)',
            color: '#ffffff',
          } : {
            backgroundColor: 'var(--surface-secondary)',
            color: 'var(--text-muted)',
            border: 'var(--border-width-sm) solid var(--border-secondary)',
          }),
        };

        const labelStyle: CSSProperties = {
          fontFamily: 'var(--font-family-body)',
          fontSize: config.labelSize,
          fontWeight: status === 'active'
            ? 'var(--font-weight-semi-bold)' as unknown as number
            : 'var(--font-weight-regular)' as unknown as number,
          lineHeight: 'var(--font-line-height-snug)',
          color: status === 'upcoming' ? 'var(--text-muted)' : 'var(--text-primary)',
          transition: 'color 0.15s ease',
        };

        const descStyle: CSSProperties = {
          fontFamily: 'var(--font-family-body)',
          fontSize: config.descSize,
          fontWeight: 'var(--font-weight-regular)' as unknown as number,
          lineHeight: 'var(--font-line-height-normal)',
          color: 'var(--text-muted)',
          marginTop: 'var(--space-50)',
        };

        const connectorStyle: CSSProperties = {
          width: config.connectorWidth,
          flexGrow: 1,
          minHeight: '16px',
          backgroundColor: status === 'complete'
            ? 'var(--background-brand-primary)'
            : 'var(--border-secondary)',
          marginLeft: `${(config.circleSize - parseInt(config.connectorWidth)) / 2}px`,
          transition: 'background-color 0.15s ease',
        };

        const stepRowStyle: CSSProperties = {
          display: 'flex',
          alignItems: 'flex-start',
          gap: config.gap,
          cursor: isClickable ? 'pointer' : 'default',
        };

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
              style={stepRowStyle}
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              aria-label={isClickable ? `Go to step ${index + 1}: ${step.label}` : undefined}
              aria-disabled={!isClickable && onStepClick ? true : undefined}
            >
              <div style={circleStyle}>
                {status === 'complete' ? (
                  <svg width={config.circleSize * 0.45} height={config.circleSize * 0.45} viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div style={{ paddingTop: `${(config.circleSize - 20) / 2}px` }}>
                <div style={labelStyle}>{step.label}</div>
                {step.description && <div style={descStyle}>{step.description}</div>}
              </div>
            </div>
            {!isLast && <div style={connectorStyle} aria-hidden="true" />}
          </div>
        );
      })}
    </nav>
  );
}

export default ProgressStepper;
