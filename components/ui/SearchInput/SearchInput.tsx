import {
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { Icon } from '@iconify/react';
import { MagnifyingGlass, X } from '../../icons';
import { TextInput, type TextInputProps } from '../TextInput/TextInput';
import './SearchInput.css';

/**
 * SearchInput component props.
 *
 * `type`, `iconBefore`, and `iconAfter` are reserved — the component
 * sets `type="search"`, the magnifying glass icon, and the clear button
 * internally.
 */
export interface SearchInputProps
  extends Omit<TextInputProps, 'type' | 'iconBefore' | 'iconAfter'> {
  /**
   * Called when the clear button is clicked.
   * In controlled mode (`value` provided) use this to reset `value`.
   * In uncontrolled mode the field clears itself and this fires as a notification.
   */
  onClear?: () => void;
}


/**
 * SearchInput — TextInput with a built-in magnifying glass icon and a
 * clear button that appears when the field has a value.
 *
 * Composes TextInput and inherits all its props (label, size, error,
 * helperText, fullWidth, etc.). `type`, `iconBefore`, and `iconAfter`
 * are reserved.
 *
 * @example
 * ```tsx
 * // Uncontrolled
 * <SearchInput label="Search" placeholder="Search products..." />
 *
 * // Controlled
 * <SearchInput value={query} onChange={e => setQuery(e.target.value)} onClear={() => setQuery('')} />
 * ```
 *
 * @summary Search field with magnifying glass icon and clear button
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, defaultValue, onChange, onClear, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? `search-input-${generatedId}`;
    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current!);

    const isControlled = value !== undefined;

    // Uncontrolled: track whether the field has a value to toggle the clear button.
    const [uncontrolledHasValue, setUncontrolledHasValue] = useState(() =>
      Boolean(defaultValue)
    );

    const hasValue = isControlled ? Boolean(value) : uncontrolledHasValue;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setUncontrolledHasValue(e.target.value !== '');
      onChange?.(e);
    };

    const handleClear = () => {
      if (!isControlled) {
        // Clear the DOM input value and fire a synthetic input event so
        // React's onChange fires for any uncontrolled listeners.
        const input = innerRef.current;
        if (input) {
          const setter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
          )?.set;
          setter?.call(input, '');
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        setUncontrolledHasValue(false);
      }
      onClear?.();
    };

    const clearButton = hasValue ? (
      <button
        type="button"
        className="bds-search-input__clear"
        aria-label="Clear search"
        onClick={handleClear}
        tabIndex={0}
      >
        <Icon icon={X} />
      </button>
    ) : null;

    return (
      <TextInput
        ref={innerRef}
        id={inputId}
        type="search"
        iconBefore={<Icon icon={MagnifyingGlass} />}
        iconAfter={clearButton}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
