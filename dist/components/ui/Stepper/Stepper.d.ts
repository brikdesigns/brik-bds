import { type HTMLAttributes } from 'react';
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
 */
export declare function Stepper({ value, onChange, min, max, step, size, disabled, className, style, ...props }: StepperProps): import("react/jsx-runtime").JSX.Element;
export default Stepper;
