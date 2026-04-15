import './DatePicker.css';
export type DatePickerSize = 'sm' | 'md' | 'lg';
export interface DatePickerProps {
    /** Selected date value */
    value?: Date | null;
    /** Called when a date is selected */
    onChange?: (date: Date | null) => void;
    /** Size variant matching BDS form components */
    size?: DatePickerSize;
    /** Optional label */
    label?: string;
    /** Helper text below input */
    helperText?: string;
    /** Error message (triggers error state) */
    error?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Full width */
    fullWidth?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Minimum selectable date */
    minDate?: Date;
    /** Maximum selectable date */
    maxDate?: Date;
    /** Input id */
    id?: string;
    /** Additional className */
    className?: string;
}
/**
 * DatePicker - BDS themed date picker component
 *
 * Fully token-based — all styles reference BDS semantic design tokens.
 * Uses Radix UI Popover for accessible popover behavior.
 * Matches form component conventions: label, helperText, error, size variants.
 *
 * @example
 * ```tsx
 * <DatePicker size="sm" label="Start date" placeholder="Select a date" />
 * <DatePicker size="md" label="Due date" helperText="Task must be completed by this date" />
 * <DatePicker size="lg" label="Appointment" error="Date is required" />
 * ```
 */
export declare const DatePicker: import("react").ForwardRefExoticComponent<DatePickerProps & import("react").RefAttributes<HTMLButtonElement>>;
export default DatePicker;
