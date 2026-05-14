import type { ButtonHTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './FilterToggle.css';

/**
 * FilterToggle sizes (matches FilterButton/Button size scale)
 */
export type FilterToggleSize = 'sm' | 'md' | 'lg';

/**
 * FilterToggle component props
 */
export interface FilterToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Button label */
  label: string;
  /** Whether the filter is active */
  active: boolean;
  /** Toggle callback */
  onToggle: () => void;
  /** Size variant (default: 'md') */
  size?: FilterToggleSize;
  /** Disabled — locks the pill and applies muted styling. */
  disabled?: boolean;
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
 *
 * @summary Binary on/off filter pill for filter bars
 */
export function FilterToggle({
  label,
  active,
  onToggle,
  size = 'md',
  disabled = false,
  className = '',
  ...props
}: FilterToggleProps) {
  return (
    <button
      type="button"
      className={bdsClass(
        'bds-filter-toggle',
        `bds-filter-toggle--${size}`,
        active && 'bds-filter-toggle--active',
        disabled && 'bds-filter-toggle--disabled',
        className,
      )}
      aria-pressed={active}
      disabled={disabled}
      onClick={onToggle}
      {...props}
    >
      {label}
    </button>
  );
}

export default FilterToggle;
