import './TimePicker.css';
export type TimePickerSize = 'sm' | 'md' | 'lg';
export interface TimePickerProps {
    /** Selected time value in HH:mm (24h) format */
    value?: string;
    /** Called when a time is selected — value in HH:mm (24h) format */
    onChange?: (value: string) => void;
    /** Size variant matching BDS form components */
    size?: TimePickerSize;
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
    /** Minute step interval (default 1) */
    minuteStep?: number;
    /** Use 24-hour display (default false — shows AM/PM) */
    use24Hour?: boolean;
    /** Input id */
    id?: string;
    /** Additional className */
    className?: string;
}
/**
 * TimePicker - BDS themed time picker component
 *
 * Fully token-based — all styles reference BDS semantic design tokens.
 * Uses Radix UI Popover for accessible popover behavior.
 * Matches form component conventions: label, helperText, error, size variants.
 *
 * @example
 * ```tsx
 * <TimePicker size="sm" label="Start Time" placeholder="Select time" />
 * <TimePicker size="md" label="End Time" value="14:30" minuteStep={5} />
 * <TimePicker size="lg" label="Appointment" use24Hour error="Time is required" />
 * ```
 */
export declare const TimePicker: import("react").ForwardRefExoticComponent<TimePickerProps & import("react").RefAttributes<HTMLButtonElement>>;
export default TimePicker;
