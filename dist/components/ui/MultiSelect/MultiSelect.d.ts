import { type CSSProperties, type ReactNode } from 'react';
import { type SelectSize } from '../Select/Select';
import './MultiSelect.css';
/**
 * MultiSelect option type
 */
export interface MultiSelectOption {
    /** Display label */
    label: string;
    /** Option value (unique identifier) */
    value: string;
    /** Optional leading icon for selected tag */
    icon?: ReactNode;
}
/**
 * MultiSelect size variants (matching Select/TextInput)
 */
export type MultiSelectSize = SelectSize;
/**
 * MultiSelect component props
 */
export interface MultiSelectProps {
    /** Available options to choose from */
    options: MultiSelectOption[];
    /** Currently selected values (controlled) */
    value?: string[];
    /** Default selected values (uncontrolled) */
    defaultValue?: string[];
    /** Change handler — called with full array of selected values */
    onChange?: (values: string[]) => void;
    /** Placeholder text for the select dropdown */
    placeholder?: string;
    /** Size variant (matching Select/TextInput) */
    size?: MultiSelectSize;
    /** Optional label text */
    label?: string;
    /** Helper text shown below the component */
    helperText?: string;
    /** Error message (shows error state when provided) */
    error?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Full width (default: true — fills container) */
    fullWidth?: boolean;
    /** Tag size for selected items (default: matches size prop) */
    tagSize?: 'sm' | 'md' | 'lg';
    /** Optional className */
    className?: string;
    /** Optional style override */
    style?: CSSProperties;
}
/**
 * MultiSelect - BDS themed multi-select component
 *
 * Composes Select (for the dropdown) + Tag (for selected items).
 * Selecting an option from the dropdown adds it as a Tag below.
 * Each Tag has a remove button to deselect.
 *
 * Uses CSS variables for theming. All spacing, colors, typography,
 * and border-radius reference BDS tokens.
 *
 * @example
 * ```tsx
 * const [selected, setSelected] = useState<string[]>([]);
 *
 * <MultiSelect
 *   label="Services"
 *   placeholder="Select services..."
 *   options={[
 *     { label: 'Brand Design', value: 'brand' },
 *     { label: 'Marketing', value: 'marketing' },
 *     { label: 'Product Design', value: 'product' },
 *   ]}
 *   value={selected}
 *   onChange={setSelected}
 * />
 * ```
 */
export declare function MultiSelect({ options, value: controlledValue, defaultValue, onChange, placeholder, size, label, helperText, error, disabled, fullWidth, tagSize, className, style, }: MultiSelectProps): import("react/jsx-runtime").JSX.Element;
export default MultiSelect;
