import { type SelectHTMLAttributes, type ReactNode } from 'react';
import './Select.css';
export interface SelectOption {
    label: string;
    value: string;
    disabled?: boolean;
}
export interface SelectOptionGroup {
    label: string;
    options: SelectOption[];
}
export type SelectSize = 'sm' | 'md' | 'lg';
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    options: (SelectOption | SelectOptionGroup)[];
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    size?: SelectSize;
    label?: string;
    helperText?: string;
    error?: string;
    fullWidth?: boolean;
    icon?: ReactNode;
    onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}
/**
 * Select — themed select dropdown with label, helper text, and error state.
 */
export declare const Select: import("react").ForwardRefExoticComponent<SelectProps & import("react").RefAttributes<HTMLSelectElement>>;
export default Select;
