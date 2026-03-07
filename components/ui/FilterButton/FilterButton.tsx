import {
  type HTMLAttributes,
  type ReactNode,
  type CSSProperties,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { bdsClass } from '../../utils';

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
 * Size-based styles matching Button's size scale
 *
 * Token reference:
 * - --padding-sm = 12px
 * - --padding-md = 16px
 * - --padding-lg = 24px
 * - --padding-xl = 32px
 * - --label-sm (small label)
 * - --label-md (base label)
 */
const sizeStyles: Record<FilterButtonSize, CSSProperties> = {
  sm: {
    padding: 'var(--padding-sm) var(--padding-md)',
    fontSize: 'var(--label-sm)',
    gap: 'var(--gap-sm)',
  },
  md: {
    padding: 'var(--padding-md) var(--padding-lg)',
    fontSize: 'var(--label-md)',
    gap: 'var(--gap-md)',
  },
  lg: {
    padding: 'var(--padding-lg) var(--padding-xl)',
    fontSize: 'var(--label-md)',
    gap: 'var(--gap-lg)',
  },
};

/**
 * Trigger button base styles (inactive)
 *
 * Token reference:
 * - --surface-secondary = #f2f2f2 (inactive background)
 * - --border-radius-md = 4px (corners)
 * - --font-family-label (label font)
 * - --font-weight-semi-bold = 600
 * - --font-line-height-tight = 1 (tight leading)
 * - --text-primary (theme-adaptive text)
 */
const triggerBaseStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'var(--surface-secondary)',
  borderRadius: 'var(--border-radius-md)',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--font-family-label)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
  color: 'var(--text-primary)',
  whiteSpace: 'nowrap',
  textTransform: 'capitalize' as const,
  minWidth: '120px',
  boxSizing: 'border-box',
};

/**
 * Trigger button active styles (value selected)
 *
 * Token reference:
 * - --background-brand-primary (brand blue background)
 * - --text-on-color-dark = white (text on dark bg)
 */
const triggerActiveStyles: CSSProperties = {
  ...triggerBaseStyles,
  backgroundColor: 'var(--background-brand-primary)',
  color: 'var(--text-on-color-dark)',
};

/**
 * Dropdown panel styles (matches Menu panel)
 *
 * Token reference:
 * - --background-primary (white)
 * - --border-radius-lg = 8px
 * - --padding-xl = 24px (padding)
 * - --gap-md = 8px (item gap)
 */
const dropdownStyles: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + var(--gap-md))',
  left: 0,
  zIndex: 100,
  backgroundColor: 'var(--background-primary)',
  borderRadius: 'var(--border-radius-lg)',
  padding: 'var(--padding-xl)',
  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)', // bds-lint-ignore — shadow tokens resolve to zero
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-md)',
  minWidth: '200px',
};

/**
 * Dropdown item styles
 *
 * Token reference:
 * - --font-family-body
 * - --body-md = 16px
 * - --font-line-height-normal
 * - --text-primary
 * - --gap-md = 8px (icon-text gap + item padding)
 * - --border-radius-sm = 2px
 */
const itemStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--gap-md)',
  padding: 'var(--padding-tiny)',
  background: 'none',
  border: 'none',
  borderRadius: 'var(--border-radius-sm)',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'left',
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-md)',
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-primary)',
};

/**
 * Selected item highlight
 *
 * Token reference:
 * - --surface-secondary (selected bg)
 */
const selectedItemStyles: CSSProperties = {
  ...itemStyles,
  backgroundColor: 'var(--surface-secondary)',
};

/**
 * Icon wrapper in dropdown items
 *
 * Token reference:
 * - --icon-lg = 18px
 * - --text-primary
 */
const iconWrapperStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  fontSize: 'var(--icon-lg)',
  color: 'var(--text-primary)',
  flexShrink: 0,
};

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
 *     { id: 'design', label: 'Brand design', icon: <FontAwesomeIcon icon={faCrown} /> },
 *     { id: 'marketing', label: 'Marketing', icon: <FontAwesomeIcon icon={faBullhorn} /> },
 *   ]}
 * />
 * ```
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

  const handleSelect = (optionId: string) => {
    onChange?.(optionId === value ? undefined : optionId);
    setIsOpen(false);
  };

  const buttonStyles = {
      ...(isActive ? triggerActiveStyles : triggerBaseStyles),
      ...sizeStyles[size],
    };

  return (
    <div
      ref={wrapperRef}
      className={bdsClass('bds-filter-button', className)}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      {...props}
    >
      <button
        type="button"
        className="bds-filter-button-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        style={buttonStyles}
      >
        <span>{selectedOption?.label ?? label}</span>
        <FontAwesomeIcon icon={faCaretDown} />
      </button>

      {isOpen && (
        <div className="bds-filter-button-dropdown" role="listbox" style={dropdownStyles}>
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="bds-filter-button-option"
              role="option"
              aria-selected={option.id === value}
              onClick={() => handleSelect(option.id)}
              style={option.id === value ? selectedItemStyles : itemStyles}
            >
              {option.icon && <span style={iconWrapperStyles}>{option.icon}</span>}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterButton;
