import { type CSSProperties, type HTMLAttributes } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { bdsClass } from '../../utils';

export type StepperSize = 'sm' | 'md' | 'lg';

export interface StepperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current value */
  value: number;
  /** Change handler */
  onChange: (value: number) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Size variant */
  size?: StepperSize;
  /** Disabled state */
  disabled?: boolean;
}

const sizeConfig: Record<StepperSize, {
  buttonSize: number;
  iconSize: number;
  fontSize: string;
  padding: string;
  gap: string;
  borderRadius: string;
}> = {
  sm: {
    buttonSize: 28,
    iconSize: 10,
    fontSize: 'var(--label-sm)',
    padding: 'var(--padding-tiny)',
    gap: 'var(--gap-sm)',
    borderRadius: 'var(--border-radius-sm)',
  },
  md: {
    buttonSize: 36,
    iconSize: 12,
    fontSize: 'var(--label-md)',
    padding: 'var(--padding-sm)',
    gap: 'var(--gap-md)',
    borderRadius: 'var(--border-radius-md)',
  },
  lg: {
    buttonSize: 44,
    iconSize: 14,
    fontSize: 'var(--label-lg)',
    padding: 'var(--padding-md)',
    gap: 'var(--gap-md)',
    borderRadius: 'var(--border-radius-md)',
  },
};

const baseStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  boxSizing: 'border-box',
};

/**
 * Stepper — numeric input with increment/decrement buttons.
 *
 * Figma: bds-stepper (node 26432:14777)
 * - Two icon buttons (- / +) flanking a numeric display
 * - Respects min/max bounds
 */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  size = 'md',
  disabled = false,
  className = '',
  style,
  ...props
}: StepperProps) {
  const config = sizeConfig[size];

  const canDecrement = !disabled && value - step >= min;
  const canIncrement = !disabled && value + step <= max;

  const handleDecrement = () => {
    if (canDecrement) onChange(value - step);
  };

  const handleIncrement = () => {
    if (canIncrement) onChange(value + step);
  };

  const buttonStyles = (enabled: boolean): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: config.buttonSize,
    height: config.buttonSize,
    borderRadius: config.borderRadius,
    border: 'var(--border-width-sm) solid var(--border-secondary)',
    backgroundColor: 'var(--surface-secondary)',
    color: enabled ? 'var(--text-primary)' : 'var(--text-muted)',
    cursor: enabled ? 'pointer' : 'not-allowed',
    opacity: enabled ? 1 : 0.4,
    padding: 0,
    fontSize: config.iconSize,
    transition: 'filter 0.15s ease',
    flexShrink: 0,
  });

  const valueStyles: CSSProperties = {
    fontFamily: 'var(--font-family-label)',
    fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
    fontSize: config.fontSize,
    lineHeight: 'var(--font-line-height-tight)',
    color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
    textAlign: 'center',
    minWidth: config.buttonSize,
    userSelect: 'none',
  };

  return (
    <div
      className={bdsClass('bds-stepper', className)}
      style={{ ...baseStyles, gap: config.gap, ...style }}
      role="group"
      aria-label="Stepper"
      {...props}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        style={buttonStyles(canDecrement)}
        aria-label="Decrease"
      >
        <FontAwesomeIcon icon={faMinus} />
      </button>
      <span style={valueStyles} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={!canIncrement}
        style={buttonStyles(canIncrement)}
        aria-label="Increase"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </div>
  );
}

export default Stepper;
