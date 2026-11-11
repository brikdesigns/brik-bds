import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { Icon } from '../Icon';
import { MagnifyingGlass, X } from '../../icons';
import { TextInput, type TextInputBaseProps } from '../TextInput/TextInput';
import type { AccessibleNameProps } from '../../utils';
import './SearchInput.css';

/**
 * SearchInput component props.
 *
 * `type`, `iconBefore`, and `iconAfter` are reserved — the component
 * sets `type="search"`, the magnifying glass icon, and the clear button
 * internally.
 */
export interface SearchInputBaseProps
  extends Omit<TextInputBaseProps, 'type' | 'iconBefore' | 'iconAfter'> {
  /**
   * Called when the clear button is clicked or Esc clears the field.
   * In controlled mode (`value` provided) use this to reset `value`.
   * In uncontrolled mode the field clears itself and this fires as a notification.
   */
  onClear?: () => void;
  /**
   * Delay in ms before `onChange` fires after the last keystroke. The field
   * text itself always updates immediately. Default `0` fires on every
   * keystroke. Global search passes `250` (ADR-049 § 4).
   * @default 0
   */
  debounceMs?: number;
  /**
   * Called with the current value when Enter is pressed. Bypasses `debounceMs`.
   */
  onSearch?: (value: string) => void;
}

/**
 * SearchInput props. Inherits TextInput's accessible-name requirement: supply
 * `label` (visible), `aria-label`, or `aria-labelledby`. Omitting all three is
 * a type error.
 */
export type SearchInputProps = SearchInputBaseProps & AccessibleNameProps;


/**
 * SearchInput — TextInput with a built-in magnifying glass icon and a
 * clear button that appears when the field has a value.
 *
 * Composes TextInput and inherits all its props (label, size, error,
 * helperText, fullWidth, etc.). `type`, `iconBefore`, and `iconAfter`
 * are reserved.
 *
 * Esc (ADR-049 § 3): while `aria-expanded` is `true` a popup is open and Esc
 * is left to it; otherwise Esc clears a non-empty field and fires `onClear`.
 * The field is not a search landmark — wrap it in `role="search"` with an
 * `aria-label` when it is the page's search (ADR-049 § 5).
 *
 * @example
 * ```tsx
 * // Uncontrolled
 * <SearchInput label="Search" placeholder="Search products..." />
 *
 * // Controlled
 * <SearchInput value={query} onChange={e => setQuery(e.target.value)} onClear={() => setQuery('')} />
 *
 * // Debounced onChange, Enter to search
 * <SearchInput label="Search" debounceMs={250} onChange={fetchResults} onSearch={goToResults} />
 * ```
 *
 * @summary Search field with magnifying glass icon and clear button
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    { value, defaultValue, onChange, onClear, onSearch, onKeyDown, debounceMs = 0, id, ...props },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? `search-input-${generatedId}`;
    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current!);

    const isControlled = value !== undefined;

    // Uncontrolled: track whether the field has a value to toggle the clear button.
    const [uncontrolledHasValue, setUncontrolledHasValue] = useState(() =>
      Boolean(defaultValue)
    );

    // Controlled + debounced: the parent only hears about a keystroke after the
    // delay, so its `value` lags the field. The field shows `draft` meanwhile and
    // takes `value` back whenever the parent sets something we did not emit.
    const shadowed = isControlled && debounceMs > 0;
    const [draft, setDraft] = useState(() => String(value ?? ''));
    const lastSeenValue = useRef(value);
    useEffect(() => {
      if (shadowed && value !== lastSeenValue.current) setDraft(String(value));
      lastSeenValue.current = value;
    }, [shadowed, value]);

    const hasValue = isControlled ? Boolean(shadowed ? draft : value) : uncontrolledHasValue;

    const timer = useRef<ReturnType<typeof setTimeout>>();
    const cancelPendingChange = () => clearTimeout(timer.current);
    useEffect(() => cancelPendingChange, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setUncontrolledHasValue(e.target.value !== '');
      if (shadowed) setDraft(e.target.value);
      cancelPendingChange();
      if (debounceMs > 0) {
        timer.current = setTimeout(() => {
          lastSeenValue.current = e.target.value;
          onChange?.(e);
        }, debounceMs);
      } else {
        onChange?.(e);
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (e.key === 'Enter') {
        onSearch?.(e.currentTarget.value);
      } else if (e.key === 'Escape') {
        // A popup the field controls is open: leave Esc to it, keep the text.
        if (props['aria-expanded'] === true || props['aria-expanded'] === 'true') return;
        // Empty field: do nothing and do not consume Esc, so a parent still gets it.
        if (e.currentTarget.value === '') return;
        e.preventDefault();
        handleClear();
      }
    };

    const handleClear = () => {
      cancelPendingChange();
      if (shadowed) setDraft('');
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
        value={shadowed ? draft : value}
        defaultValue={defaultValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
