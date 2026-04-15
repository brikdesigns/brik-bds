import { type HTMLAttributes, type ReactNode } from 'react';
import './FilterButton.css';
/**
 * Filter option shape
 */
export interface FilterButtonOption {
    /** Unique identifier */
    id: string;
    /** Display label */
    label: string;
    /** Optional icon before the label */
    icon?: ReactNode;
}
/**
 * FilterButton sizes (matches Button size scale)
 */
export type FilterButtonSize = 'sm' | 'md' | 'lg';
/**
 * FilterButton component props
 */
export interface FilterButtonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
    /** Default label when no option is selected */
    label: string;
    /** Options to display in the dropdown */
    options: FilterButtonOption[];
    /** Currently selected option ID */
    value?: string;
    /** Callback when selection changes (undefined = cleared) */
    onChange?: (value: string | undefined) => void;
    /** Size of the trigger button (default: 'md') */
    size?: FilterButtonSize;
}
/**
 * FilterButton - A dropdown filter trigger for filter bars
 *
 * Displays a pill-shaped button with a dropdown chevron. When clicked,
 * opens a single-select dropdown menu. The button shows the selected
 * option label and switches to an active (brand) style when a value
 * is selected. Clicking the selected item again clears the filter.
 *
 * @example
 * ```tsx
 * const [category, setCategory] = useState<string | undefined>();
 *
 * <FilterButton
 *   label="Category"
 *   value={category}
 *   onChange={setCategory}
 *   options={[
 *     { id: 'design', label: 'Brand design', icon: <Icon icon="ph:crown" /> },
 *     { id: 'marketing', label: 'Marketing', icon: <Icon icon="ph:megaphone" /> },
 *   ]}
 * />
 * ```
 */
export declare function FilterButton({ label, options, value, onChange, size, className, style, ...props }: FilterButtonProps): import("react/jsx-runtime").JSX.Element;
export default FilterButton;
