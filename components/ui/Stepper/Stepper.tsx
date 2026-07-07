import { type HTMLAttributes } from 'react';
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
  const canDecrement = !disabled && value - step >= min;
  const canIncrement = !disabled && value + step <= max;

  const handleDecrement = () => {
    if (canDecrement) onChange(value - step);
  };

  const handleIncrement = () => {
    if (canIncrement) onChange(value + step);
  };

  return (
    <div
      className={bdsClass('bds-stepper', `bds-stepper--${size}`, className)}
      style={style}
      role="group"
      aria-label="Stepper"
      {...props}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        className={bdsClass('bds-stepper__button', !canDecrement && 'bds-stepper__button--disabled')}
        aria-label="Decrease"
      >
        <Icon icon={Minus} />
      </button>
      <span
        className={bdsClass('bds-stepper__value', disabled && 'bds-stepper__value--disabled')}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={!canIncrement}
        className={bdsClass('bds-stepper__button', !canIncrement && 'bds-stepper__button--disabled')}
        aria-label="Increase"
      >
        <Icon icon={Plus} />
      </button>
    </div>
  );
}

export default Stepper;
