import { type InputHTMLAttributes, type ReactNode } from 'react';
import './Switch.css';
export type SwitchSize = 'lg' | 'md' | 'sm';
export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
    label?: ReactNode;
    size?: SwitchSize;
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
/**
 * Switch — toggle control for binary on/off states.
 *
 * Track/knob dimensions are size-dependent (runtime-calculated inline styles).
 * Colors and typography are in Switch.css.
 */
export declare function Switch({ label, size, checked, defaultChecked, disabled, onChange, className, style, ...props }: SwitchProps): import("react/jsx-runtime").JSX.Element;
export default Switch;
