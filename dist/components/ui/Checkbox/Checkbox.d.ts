import { type InputHTMLAttributes, type ReactNode } from 'react';
import './Checkbox.css';
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: ReactNode;
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
/**
 * Checkbox — themed checkbox with label text.
 */
export declare function Checkbox({ label, checked, defaultChecked, disabled, onChange, id, className, style, ...props }: CheckboxProps): import("react/jsx-runtime").JSX.Element;
export default Checkbox;
