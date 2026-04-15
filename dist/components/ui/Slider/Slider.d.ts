import { type InputHTMLAttributes } from 'react';
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
 */
export declare function Slider({ value, defaultValue, min, max, step, size, label, showValue, disabled, onChange, className, style, ...props }: SliderProps): import("react/jsx-runtime").JSX.Element;
export default Slider;
