import { type InputHTMLAttributes, type ReactNode } from 'react';
import './Radio.css';
/**
 * Radio component props
 */
export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    /** Label text for the radio button */
    label: ReactNode;
    /** Radio group name (required for grouping) */
    name: string;
    /** Value of this radio option */
    value: string;
    /** Checked state (controlled) */
    checked?: boolean;
    /** Default checked state (uncontrolled) */
    defaultChecked?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Change handler */
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
/**
 * Radio - BDS themed radio button component
 *
 * Uses CSS variables for theming. Follows semantic HTML with label
 * wrapping input element. Radio buttons with the same `name` prop
 * form a mutually exclusive group. All spacing, colors, and typography
 * reference BDS tokens.
 *
 * @example
 * ```tsx
 * <Radio name="plan" value="basic" label="Basic Plan" />
 * <Radio name="plan" value="pro" label="Pro Plan" checked />
 * <Radio name="plan" value="enterprise" label="Enterprise" disabled />
 * ```
 */
export declare function Radio({ label, name, value, checked, defaultChecked, disabled, onChange, id, className, style, ...props }: RadioProps): import("react/jsx-runtime").JSX.Element;
export default Radio;
