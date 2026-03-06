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
import { faMapPin } from '@fortawesome/free-solid-svg-icons';
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
 * - --gap-md = 8px (gap between label and field)
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
 * Map pin icon positioning
 *
 * Token reference:
 * - --text-muted (icon color)
 * - --icon-md = 16px
 */
const iconStyles: CSSProperties = {
  position: 'absolute',
  left: 'var(--padding-md)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-muted)',
  fontSize: 'var(--icon-md)',
  pointerEvents: 'none',
  zIndex: 1,
};

/**
 * Input base styles
 *
 * Token reference:
 * - --background-input (white)
 * - --border-input (border)
 * - --border-width-lg = 1px (visible border)
 * - --border-radius-50 = 2px (corners)
 * - --font-family-body
 * - --body-md = 16px
 * - --font-weight-regular = 400
 * - --font-line-height-normal
 */
const inputBaseStyles: CSSProperties = {
  width: '100%',
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-md)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-primary)',
  backgroundColor: 'var(--background-input)',
  border: 'var(--border-width-lg) solid var(--border-input)',
  borderRadius: 'var(--border-radius-50)',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

/**
 * Size-specific padding
 *
 * Figma specs:
 * - md: padding/md (16px) all around, left increased for icon
 * - sm: padding/xs (10px) horizontal, padding/tiny (8px) vertical
 */
const inputSizeStyles: Record<AddressInputSize, CSSProperties> = {
  md: {
    padding: 'var(--padding-md)',
    paddingLeft: 'calc(var(--padding-md) + 24px)',
  },
  sm: {
    padding: 'var(--padding-tiny) var(--padding-xs)',
    paddingLeft: 'calc(var(--padding-xs) + 24px)',
  },
};

/**
 * Suggestions dropdown panel (follows Menu panel design)
 *
 * Token reference:
 * - --background-primary (white)
 * - --border-radius-lg = 8px
 * - --padding-md = 16px (padding)
 * - --gap-sm = 6px (item gap)
 */
const dropdownStyles: CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  zIndex: 100,
  marginTop: 'var(--gap-sm)',
  backgroundColor: 'var(--background-primary)',
  borderRadius: 'var(--border-radius-lg)',
  padding: 'var(--padding-md)',
  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)', // bds-lint-ignore — shadow tokens resolve to zero
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-sm)',
  maxHeight: '240px',
  overflowY: 'auto',
  boxSizing: 'border-box',
};

/**
 * Suggestion item button styles (follows Menu item pattern)
 *
 * Token reference:
 * - --font-family-body
 * - --body-md = 16px
 * - --font-line-height-normal
 * - --text-primary
 * - --gap-md = 8px (icon gap + padding)
 * - --border-radius-sm = 2px
 */
const suggestionItemStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
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
  boxSizing: 'border-box',
  minWidth: 0,
};

/**
 * Suggestion icon wrapper
 *
 * Token reference:
 * - --icon-md = 16px
 * - --text-muted
 */
const suggestionIconStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '24px',
  fontSize: 'var(--icon-md)',
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
 * suggestions. Follows the SearchInput field pattern with Menu-style
 * dropdown for results. Supports sm and md sizes.
 *
 * @example
 * ```tsx
 * <AddressInput
 *   placeholder="Enter location"
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
            <FontAwesomeIcon icon={faMapPin} />
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
                    {suggestion.icon || <FontAwesomeIcon icon={faMapPin} />}
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
