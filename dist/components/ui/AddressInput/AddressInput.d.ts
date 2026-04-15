import { type InputHTMLAttributes, type ReactNode } from 'react';
import './AddressInput.css';
/**
 * AddressInput size variants
 */
export type AddressInputSize = 'sm' | 'md';
/**
 * Suggestion item shape
 */
export interface AddressSuggestion {
    /** Unique identifier */
    id: string;
    /** Primary display label (street address / place name) */
    label: string;
    /** Optional secondary text (city, state, zip) */
    description?: string;
    /** Optional leading icon */
    icon?: ReactNode;
}
/**
 * AddressInput component props
 */
export interface AddressInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
    /** Size variant */
    size?: AddressInputSize;
    /** Optional label text */
    label?: string;
    /** Full width input */
    fullWidth?: boolean;
    /** Location suggestions to show in the dropdown */
    suggestions?: AddressSuggestion[];
    /** Callback when a suggestion is selected */
    onSuggestionSelect?: (suggestion: AddressSuggestion) => void;
}
/**
 * AddressInput - Location input with autocomplete suggestions
 *
 * A text input with a map pin icon and a dropdown panel for location
 * suggestions. Uses identical border, radius, and background tokens as
 * TextInput and SearchInput.
 *
 * @example
 * ```tsx
 * <AddressInput
 *   placeholder="Enter address"
 *   suggestions={[
 *     { id: '1', label: '123 Main St', description: 'Nashville, TN 37201' },
 *   ]}
 *   onSuggestionSelect={(s) => console.log(s)}
 * />
 * ```
 */
export declare const AddressInput: import("react").ForwardRefExoticComponent<AddressInputProps & import("react").RefAttributes<HTMLInputElement>>;
export default AddressInput;
