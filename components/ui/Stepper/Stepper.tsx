import { type CSSProperties, type HTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { Minus, Plus } from '../../icons';
import { bdsClass } from '../../utils';
import './Stepper.css';

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
  gap: string;
  borderRadius: string;
}> = {
  sm: {
    buttonSize: 28,
    iconSize: 10,
    fontSize: 'var(--label-sm)',
    gap: 'var(--gap-sm)',
    borderRadius: 'var(--border-radius-sm)',
  },
  md: {
    buttonSize: 36,
    iconSize: 12,
    fontSize: 'var(--label-md)',
    gap: 'var(--gap-md)',
    borderRadius: 'var(--border-radius-md)',
  },
  lg: {
    buttonSize: 44,
    iconSize: 14,
    fontSize: 'var(--label-lg)',
    gap: 'var(--gap-md)',
    borderRadius: 'var(--border-radius-md)',
  },
};

/**
 * Stepper — numeric input with increment/decrement buttons.
 *
 * Figma: bds-stepper (node 26432:14777)
 * - Two icon buttons (- / +) flanking a numeric display
 * - Respects min/max bounds
 *
 * @summary Numeric input with increment/decrement buttons
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

  // Runtime-calculated dimensions per size — must stay inline
  const buttonStyle = (): CSSProperties => ({
    width: config.buttonSize,
    height: config.buttonSize,
    borderRadius: config.borderRadius,
    fontSize: config.iconSize,
  });

  const valueStyle: CSSProperties = {
    fontSize: config.fontSize,
    minWidth: config.buttonSize,
  };

  return (
    <div
      className={bdsClass('bds-stepper', className)}
      style={{ gap: config.gap, ...style }}
      role="group"
      aria-label="Stepper"
      {...props}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        className={bdsClass('bds-stepper__button', !canDecrement && 'bds-stepper__button--disabled')}
        style={buttonStyle()}
        aria-label="Decrease"
      >
        <Icon icon={Minus} />
      </button>
      <span
        className={bdsClass('bds-stepper__value', disabled && 'bds-stepper__value--disabled')}
        style={valueStyle}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={!canIncrement}
        className={bdsClass('bds-stepper__button', !canIncrement && 'bds-stepper__button--disabled')}
        style={buttonStyle()}
        aria-label="Increase"
      >
        <Icon icon={Plus} />
      </button>
    </div>
  );
}

export default Stepper;
