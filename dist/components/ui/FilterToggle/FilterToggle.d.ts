import type { ButtonHTMLAttributes } from 'react';
import './FilterToggle.css';
/**
 * FilterToggle sizes (matches FilterButton/Button size scale)
 */
export type FilterToggleSize = 'sm' | 'md' | 'lg';
/**
 * FilterToggle component props
 */
export interface FilterToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    /** Button label */
    label: string;
    /** Whether the filter is active */
    active: boolean;
    /** Toggle callback */
    onToggle: () => void;
    /** Size variant (default: 'md') */
    size?: FilterToggleSize;
}
/**
 * FilterToggle — A binary on/off filter pill for filter bars
 *
 * Visually cohesive with FilterButton but without a dropdown.
 * Click toggles between active (brand) and inactive (secondary) states.
 *
 * @example
 * ```tsx
 * const [showArchived, setShowArchived] = useState(false);
 *
 * <FilterToggle
 *   label="Show Archived"
 *   active={showArchived}
 *   onToggle={() => setShowArchived((prev) => !prev)}
 * />
 * ```
 */
export declare function FilterToggle({ label, active, onToggle, size, className, ...props }: FilterToggleProps): import("react/jsx-runtime").JSX.Element;
export default FilterToggle;
