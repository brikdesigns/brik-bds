import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { Icon } from '@iconify/react';
import { MapPin } from '../../icons';
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
 *
 * @summary Location input with autocomplete suggestions
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
    const generatedId = useId();
    const inputId = id || (label ? `address-${generatedId}` : undefined);

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

    return (
      <div
        ref={wrapperRef}
        className={bdsClass(
          'bds-address-input',
          `bds-address-input--${size}`,
          fullWidth && 'bds-address-input--full-width',
          className,
        )}
        style={style}
      >
        {label && (
          <label htmlFor={inputId} className="bds-address-input__label">
            {label}
          </label>
        )}
        <div className="bds-address-input__field">
          <span className="bds-address-input__icon">
            <Icon icon={MapPin} />
          </span>
          <input
            data-1p-ignore=""
            data-lpignore="true"
            ref={ref}
            id={inputId}
            type="text"
            className="bds-address-input__input"
            onFocus={handleFocus}
            {...props}
          />
          {showDropdown && (
            <div role="listbox" className="bds-address-input__dropdown">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(suggestion)}
                  className="bds-address-input__option"
                >
                  <span className="bds-address-input__icon">
                    {suggestion.icon || <Icon icon={MapPin} />}
                  </span>
                  <span className="bds-address-input__content">
                    <span>{suggestion.label}</span>
                    {suggestion.description && (
                      <span className="bds-address-input__description">
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
