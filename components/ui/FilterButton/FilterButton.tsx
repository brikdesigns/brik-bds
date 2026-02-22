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
}

/**
 * Trigger button base styles (inactive)
 *
 * Token reference:
 * - --_color---surface--secondary = #f2f2f2 (inactive background)
 * - --_border-radius---md = 4px (corners)
 * - --_space---lg = 16px (padding)
 * - --_typography---font-family--label (label font)
 * - --_typography---label--md-base = 16px (font size)
 * - --font-weight--semi-bold = 600
 * - --font-line-height--100 = 1 (tight leading)
 * - --_color---text--on-color-light = black (text on light bg)
 */
const triggerBaseStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--_space---gap--lg)',
  padding: 'var(--_space---lg)',
  backgroundColor: 'var(--_color---surface--secondary)',
  borderRadius: 'var(--_border-radius---md)',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--_typography---font-family--label)',
  fontSize: 'var(--_typography---label--md-base)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height--100)',
  color: 'var(--_color---text--on-color-light)',
  whiteSpace: 'nowrap',
  textTransform: 'capitalize' as const,
  minWidth: '120px',
  boxSizing: 'border-box',
};

/**
 * Trigger button active styles (value selected)
 *
 * Token reference:
 * - --_color---background--brand-primary (brand blue background)
 * - --_color---text--on-color-dark = white (text on dark bg)
 */
const triggerActiveStyles: CSSProperties = {
  ...triggerBaseStyles,
  backgroundColor: 'var(--_color---background--brand-primary)',
  color: 'var(--_color---text--on-color-dark)',
};

/**
 * Dropdown panel styles (matches Menu panel)
 *
 * Token reference:
 * - --_color---background--primary (white)
 * - --_border-radius---lg = 8px
 * - --_space---xl = 24px (padding)
 * - --_space---gap--md = 8px (item gap)
 */
const dropdownStyles: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + var(--_space---gap--md))',
  left: 0,
  zIndex: 100,
  backgroundColor: 'var(--_color---background--primary)',
  borderRadius: 'var(--_border-radius---lg)',
  padding: 'var(--_space---xl)',
  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--_space---gap--md)',
  minWidth: '200px',
};

/**
 * Dropdown item styles
 *
 * Token reference:
 * - --_typography---font-family--body
 * - --_typography---body--md-base = 16px
 * - --font-line-height--150
 * - --_color---text--primary
 * - --_space---gap--md = 8px (icon-text gap + item padding)
 * - --_border-radius---sm = 2px
 */
const itemStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--_space---gap--md)',
  padding: 'var(--_space---gap--md)',
  background: 'none',
  border: 'none',
  borderRadius: 'var(--_border-radius---sm)',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'left',
  fontFamily: 'var(--_typography---font-family--body)',
  fontSize: 'var(--_typography---body--md-base)',
  lineHeight: 'var(--font-line-height--150)',
  color: 'var(--_color---text--primary)',
};

/**
 * Selected item highlight
 *
 * Token reference:
 * - --_color---surface--secondary (selected bg)
 */
const selectedItemStyles: CSSProperties = {
  ...itemStyles,
  backgroundColor: 'var(--_color---surface--secondary)',
};

/**
 * Icon wrapper in dropdown items
 *
 * Token reference:
 * - --_typography---icon--large = 18px
 * - --_color---text--primary
 */
const iconWrapperStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  fontSize: 'var(--_typography---icon--large)',
  color: 'var(--_color---text--primary)',
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

  const buttonStyles = isActive ? triggerActiveStyles : triggerBaseStyles;

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
