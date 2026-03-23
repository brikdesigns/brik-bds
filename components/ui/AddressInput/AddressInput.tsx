import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type CSSProperties,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { bdsClass } from '../../utils';
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
export interface AddressInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
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
 * Wrapper styles — vertical stack with gap between label and field
 *
 * Token reference:
 * - --gap-md = 8px
 */
const wrapperStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-md)',
};

/**
 * Label styles
 *
 * Token reference:
 * - --font-family-label
 * - --font-weight-semi-bold = 600
 * - --font-line-height-tight
 * - --text-primary
 */
const labelStyles: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
  color: 'var(--text-primary)',
  textTransform: 'capitalize' as const,
};

/**
 * Label size variants
 */
const labelSizeStyles: Record<AddressInputSize, CSSProperties> = {
  sm: { fontSize: 'var(--label-sm)' },
  md: { fontSize: 'var(--label-md)' },
};

/**
 * Field wrapper — positions icon and dropdown relative to input
 */
const fieldWrapperStyles: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

/**
 * Address icon positioning
 *
 * Token reference:
 * - --text-muted (icon color)
 * - --padding-xs = 10px (inset)
 */
const iconStyles: CSSProperties = {
  position: 'absolute',
  left: 'var(--padding-sm)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-muted)',
  pointerEvents: 'none',
  zIndex: 1,
};

/**
 * Input base styles — matches TextInput and SearchInput
 *
 * Token reference:
 * - --background-input (white)
 * - --border-input (border)
 * - --border-width-md = 1px (border thickness)
 * - --border-radius-md = 4px (corners)
 * - --font-family-body
 * - --body-md = 16px
 * - --font-weight-regular = 400
 * - --font-line-height-normal
 */
const inputBaseStyles: CSSProperties = {
  width: '100%',
  fontFamily: 'var(--font-family-body)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-primary)',
  backgroundColor: 'var(--background-input)',
  border: 'var(--border-width-md) solid var(--border-input)',
  borderRadius: 'var(--border-radius-md)',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

/**
 * Size-specific padding and font-size
 */
const inputSizeStyles: Record<AddressInputSize, CSSProperties> = {
  md: {
    fontSize: 'var(--body-md)',
    padding: 'var(--padding-sm)',
    paddingLeft: 'calc(var(--padding-sm) + 24px)',
  },
  sm: {
    fontSize: 'var(--body-sm)',
    padding: 'var(--gap-md) var(--padding-xs)',
    paddingLeft: 'calc(var(--padding-xs) + 24px)',
  },
};

/**
 * Suggestions dropdown panel
 *
 * Token reference:
 * - --surface-primary (white)
 * - --border-radius-lg = 8px
 * - --padding-sm = 12px (padding)
 * - --gap-sm = 6px (item gap)
 */
const dropdownStyles: CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  zIndex: 100,
  marginTop: 'var(--gap-sm)',
  backgroundColor: 'var(--surface-primary)',
  borderRadius: 'var(--border-radius-lg)',
  border: 'var(--border-width-lg) solid var(--border-primary)',
  padding: 'var(--padding-sm)',
  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)', // bds-lint-ignore — shadow tokens resolve to zero
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-sm)',
  maxHeight: 240,
  overflowY: 'auto',
  boxSizing: 'border-box',
};

/**
 * Suggestion item button styles
 *
 * Token reference:
 * - --font-family-body
 * - --body-md = 16px
 * - --font-line-height-normal
 * - --text-primary
 * - --gap-md = 8px (icon gap)
 * - --border-radius-sm = 2px
 */
const suggestionItemStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--gap-md)',
  padding: 'var(--padding-xs)',
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
  boxSizing: 'border-box',
  minWidth: 0,
};

/**
 * Suggestion icon wrapper
 */
const suggestionIconStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20, // bds-lint-ignore — icon wrapper alignment
  height: 24, // bds-lint-ignore
  color: 'var(--text-muted)',
  flexShrink: 0,
};

/**
 * Suggestion text wrapper — allows label + description stacking
 */
const suggestionTextStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
};

/**
 * Description text under suggestion label
 *
 * Token reference:
 * - --body-sm = 14px
 * - --text-muted
 */
const suggestionDescriptionStyles: CSSProperties = {
  fontSize: 'var(--body-sm)',
  color: 'var(--text-muted)',
};

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
export const AddressInput = forwardRef<HTMLInputElement, AddressInputProps>(
  (
    {
      size = 'md',
      label,
      fullWidth = false,
      suggestions = [],
      onSuggestionSelect,
      className = '',
      id,
      style,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputId =
      id || (label ? `address-${Math.random().toString(36).substring(2, 11)}` : undefined);

    const showDropdown = isFocused && suggestions.length > 0;

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleClickOutside = useCallback((e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    }, []);

    const handleEscape = useCallback((e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFocused(false);
      }
    }, []);

    useEffect(() => {
      if (showDropdown) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [showDropdown, handleClickOutside, handleEscape]);

    const handleSelect = (suggestion: AddressSuggestion) => {
      onSuggestionSelect?.(suggestion);
      setIsFocused(false);
    };

    const inputStyles: CSSProperties = {
      ...inputBaseStyles,
      ...inputSizeStyles[size],
    };

    return (
      <div
        ref={wrapperRef}
        className={bdsClass('bds-address-input', className)}
        style={{
          ...wrapperStyles,
          width: fullWidth ? '100%' : 'auto',
          ...style,
        }}
      >
        {label && (
          <label
            htmlFor={inputId}
            style={{ ...labelStyles, ...labelSizeStyles[size] }}
          >
            {label}
          </label>
        )}
        <div style={fieldWrapperStyles}>
          <span style={iconStyles}>
            <FontAwesomeIcon icon={faLocationDot} />
          </span>
          <input
            ref={ref}
            id={inputId}
            type="text"
            className="bds-address-input-field"
            style={inputStyles}
            onFocus={handleFocus}
            {...props}
          />
          {showDropdown && (
            <div role="listbox" style={dropdownStyles}>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(suggestion)}
                  className="bds-address-input-suggestion"
                  style={suggestionItemStyles}
                >
                  <span style={suggestionIconStyles}>
                    {suggestion.icon || <FontAwesomeIcon icon={faLocationDot} />}
                  </span>
                  <span style={suggestionTextStyles}>
                    <span>{suggestion.label}</span>
                    {suggestion.description && (
                      <span style={suggestionDescriptionStyles}>
                        {suggestion.description}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
);

AddressInput.displayName = 'AddressInput';

export default AddressInput;
