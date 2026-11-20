import { type HTMLAttributes, type KeyboardEvent } from 'react';
import { Icon } from '../Icon';
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
 * - The value is a focusable `role="spinbutton"` (WAI-ARIA spinbutton pattern):
 *   ArrowUp/ArrowDown step, PageUp/PageDown step by 10, Home/End jump to
 *   `min` / `max` (End only when `max` is finite)
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

  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (disabled) return;
    let next: number | null = null;
    switch (event.key) {
      case 'ArrowUp': next = clamp(value + step); break;
      case 'ArrowDown': next = clamp(value - step); break;
      case 'PageUp': next = clamp(value + step * 10); break;
      case 'PageDown': next = clamp(value - step * 10); break;
      case 'Home': next = min; break;
      case 'End': if (Number.isFinite(max)) next = max; break;
    }
    if (next === null) return;
    event.preventDefault();
    if (next !== value) onChange(next);
  };

  return (
    <div
      className={bdsClass('bds-stepper', `bds-stepper--size-${size}`, className)}
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
        role="spinbutton"
        aria-label="Value"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={Number.isFinite(max) ? max : undefined}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
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
