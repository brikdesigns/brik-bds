import {
  type InputHTMLAttributes,
  type CSSProperties,
  useState,
  useCallback,
} from 'react';
import { bdsClass } from '../../utils';
import './Slider.css';

/**
 * Slider size variants
 */
export type SliderSize = 'sm' | 'md' | 'lg';

/**
 * Slider component props
 */
export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'onChange'> {
  /** Current value (controlled) */
  value?: number;
  /** Default value (uncontrolled) */
  defaultValue?: number;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Size variant */
  size?: SliderSize;
  /** Optional label */
  label?: string;
  /** Show current value */
  showValue?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Change handler */
  onChange?: (value: number) => void;
}

/**
 * Track height by size
 */
const trackHeights: Record<SliderSize, number> = {
  sm: 4,
  md: 6,
  lg: 8,
};

/**
 * Thumb size by slider size
 */
const thumbSizes: Record<SliderSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

/**
 * Slider - BDS range input control
 *
 * A styled range slider with configurable min/max/step, size variants,
 * and optional label/value display. Uses CSS custom properties for
 * theming the track and thumb.
 *
 * @example
 * ```tsx
 * <Slider
 *   label="Volume"
 *   value={volume}
 *   onChange={setVolume}
 *   min={0}
 *   max={100}
 *   showValue
 * />
 * ```
 *
 * @summary Themed range input with track and thumb
 */
export function Slider({
  value,
  defaultValue = 50,
  min = 0,
  max = 100,
  step = 1,
  size = 'md',
  label,
  showValue = false,
  disabled = false,
  onChange,
  className = '',
  style,
  ...props
}: SliderProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? value : internalValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange],
  );

  const percent = max !== min ? ((currentValue - min) / (max - min)) * 100 : 0;

  // Runtime bindings the CSS consumes (percent from value; track/thumb from size).
  // Defining --bds-* custom properties inline is the sanctioned runtime escape
  // hatch; all static token consumption lives in Slider.css.
  const inputStyles = {
    '--bds-slider-percent': `${percent}%`,
    '--bds-slider-track-height': `${trackHeights[size]}px`,
    '--bds-slider-thumb-size': `${thumbSizes[size]}px`,
  } as CSSProperties;

  return (
    <div className={bdsClass('bds-slider', className)} style={style}>
      {(label || showValue) && (
        <div className="bds-slider__label-row">
          {label && <span className="bds-slider__label">{label}</span>}
          {showValue && <span className="bds-slider__value">{currentValue}</span>}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={isControlled ? value : undefined}
        defaultValue={isControlled ? undefined : defaultValue}
        onChange={handleChange}
        disabled={disabled}
        className="bds-slider-input"
        style={inputStyles}
        {...props}
      />
    </div>
  );
}

export default Slider;
