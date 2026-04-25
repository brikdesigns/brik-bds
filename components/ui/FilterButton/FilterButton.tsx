import {
  type HTMLAttributes,
  type ReactNode,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { Icon } from '@iconify/react';
import { CaretDown } from '../../icons';
import { bdsClass } from '../../utils';
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
 *
 * @summary Dropdown filter trigger for filter bars
 */
export function FilterButton({
  label,
  options,
  value,
  onChange,
  size = 'md',
  className = '',
  style,
  ...props
}: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.id === value);
  const isActive = Boolean(value);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    },
    [],
  );

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClickOutside, handleEscape]);

  // Reposition dropdown if it overflows the viewport horizontally (runtime-calculated)
  // Vertical flip is intentionally omitted — dropdowns open below by default.
  useEffect(() => {
    if (!isOpen || !dropdownRef.current) return;
    const dropdown = dropdownRef.current;
    const rect = dropdown.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    if (rect.right > viewportWidth) {
      dropdown.style.left = 'auto';
      dropdown.style.right = '0';
    }
  }, [isOpen]);

  const handleSelect = (optionId: string) => {
    onChange?.(optionId === value ? undefined : optionId);
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className={bdsClass('bds-filter-button', className)}
      style={style}
      {...props}
    >
      <button
        type="button"
        className={bdsClass(
          'bds-filter-button__trigger',
          `bds-filter-button__trigger--${size}`,
          isActive && 'bds-filter-button__trigger--active',
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{selectedOption?.label ?? label}</span>
        <Icon icon={CaretDown} className="bds-filter-button__caret" />
      </button>

      {isOpen && (
        <div ref={dropdownRef} className="bds-filter-button__dropdown" role="listbox">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={bdsClass(
                'bds-filter-button__option',
                option.id === value && 'bds-filter-button__option--selected',
              )}
              role="option"
              aria-selected={option.id === value}
              onClick={() => handleSelect(option.id)}
            >
              {option.icon && <span className="bds-filter-button__icon">{option.icon}</span>}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterButton;
