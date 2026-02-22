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
 * - --_space---gap--md = 8px (gap between label and field)
 */
const wrapperStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--_space---gap--md)',
};

/**
 * Label styles
 *
 * Token reference:
 * - --_typography---font-family--label
 * - --font-weight--semi-bold = 600
 * - --font-line-height--100
 * - --_color---text--primary
 */
const labelStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--label)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height--100)',
  color: 'var(--_color---text--primary)',
  textTransform: 'capitalize' as const,
};

/**
 * Label size variants
 */
const labelSizeStyles: Record<AddressInputSize, CSSProperties> = {
  sm: { fontSize: 'var(--_typography---label--sm)' },
  md: { fontSize: 'var(--_typography---label--md-base)' },
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
 * - --_color---text--muted (icon color)
 * - --_typography---icon--medium-base = 16px
 */
const iconStyles: CSSProperties = {
  position: 'absolute',
  left: 'var(--_space---md)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--_color---text--muted)',
  fontSize: 'var(--_typography---icon--medium-base)',
  pointerEvents: 'none',
  zIndex: 1,
};

/**
 * Input base styles
 *
 * Token reference:
 * - --_color---background--input (white)
 * - --_color---border--input (border)
 * - --_border-width---lg = 1px (visible border)
 * - --_border-radius---input = 2px (corners)
 * - --_typography---font-family--body
 * - --_typography---body--md-base = 16px
 * - --font-weight--regular = 400
 * - --font-line-height--150
 */
const inputBaseStyles: CSSProperties = {
  width: '100%',
  fontFamily: 'var(--_typography---font-family--body)',
  fontSize: 'var(--_typography---body--md-base)',
  fontWeight: 'var(--font-weight--regular)' as unknown as number,
  lineHeight: 'var(--font-line-height--150)',
  color: 'var(--_color---text--primary)',
  backgroundColor: 'var(--_color---background--input)',
  border: 'var(--_border-width---lg) solid var(--_color---border--input)',
  borderRadius: 'var(--_border-radius---input)',
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
    padding: 'var(--_space---md)',
    paddingLeft: 'calc(var(--_space---md) + 24px)',
  },
  sm: {
    padding: 'var(--_space---tiny) var(--_space---xs)',
    paddingLeft: 'calc(var(--_space---xs) + 24px)',
  },
};

/**
 * Suggestions dropdown panel (follows Menu panel design)
 *
 * Token reference:
 * - --_color---background--primary (white)
 * - --_border-radius---lg = 8px
 * - --_space---md = 16px (padding)
 * - --_space---gap--sm = 6px (item gap)
 */
const dropdownStyles: CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  zIndex: 100,
  marginTop: 'var(--_space---gap--sm)',
  backgroundColor: 'var(--_color---background--primary)',
  borderRadius: 'var(--_border-radius---lg)',
  padding: 'var(--_space---md)',
  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--_space---gap--sm)',
  maxHeight: '240px',
  overflowY: 'auto',
  boxSizing: 'border-box',
};

/**
 * Suggestion item button styles (follows Menu item pattern)
 *
 * Token reference:
 * - --_typography---font-family--body
 * - --_typography---body--md-base = 16px
 * - --font-line-height--150
 * - --_color---text--primary
 * - --_space---gap--md = 8px (icon gap + padding)
 * - --_border-radius---sm = 2px
 */
const suggestionItemStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
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
  boxSizing: 'border-box',
  minWidth: 0,
};

/**
 * Suggestion icon wrapper
 *
 * Token reference:
 * - --_typography---icon--medium-base = 16px
 * - --_color---text--muted
 */
const suggestionIconStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '24px',
  fontSize: 'var(--_typography---icon--medium-base)',
  color: 'var(--_color---text--muted)',
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
 * - --_typography---body--sm = 14px
 * - --_color---text--muted
 */
const suggestionDescriptionStyles: CSSProperties = {
  fontSize: 'var(--_typography---body--sm)',
  color: 'var(--_color---text--muted)',
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
