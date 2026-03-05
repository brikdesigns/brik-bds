'use client';

import {
  type ReactNode,
  type CSSProperties,
  type KeyboardEvent,
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { bdsClass } from '../../utils';

/**
 * Select option type
 */
export interface SelectOption {
  /** Display label */
  label: string;
  /** Option value */
  value: string;
  /** Disabled state for this option */
  disabled?: boolean;
}

/**
 * Select size variants
 *
 * Figma specs (bds-select):
 * - md: px 12px, py 16px, font-size 16px, chevron FA caret-down
 * - sm: px 12px, py 8px, font-size 14px, chevron FA caret-down
 */
export type SelectSize = 'sm' | 'md';

/**
 * Select component props
 *
 * Custom select built on BDS Menu visual language.
 * Backwards-compatible onChange provides synthetic event with e.target.value.
 */
export interface SelectProps {
  /** Array of options */
  options: SelectOption[];
  /** Placeholder text when no value selected */
  placeholder?: string;
  /** Selected value (controlled) */
  value?: string;
  /** Default selected value (uncontrolled) */
  defaultValue?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: SelectSize;
  /** Optional label text */
  label?: string;
  /** Helper text shown below select */
  helperText?: string;
  /** Error message (shows error state when provided) */
  error?: string;
  /** Full width select */
  fullWidth?: boolean;
  /** Optional icon displayed before the trigger text */
  icon?: ReactNode;
  /** Form field name */
  name?: string;
  /** Required field */
  required?: boolean;
  /** Element id */
  id?: string;
  /** Additional class name */
  className?: string;
  /** Additional inline styles on the trigger */
  style?: CSSProperties;
  /**
   * Change handler — provides synthetic event with e.target.value
   * for backwards compatibility with native <select> consumers.
   */
  onChange?: (event: { target: { value: string; name: string } }) => void;
  /**
   * Clean value change handler (preferred for new code)
   */
  onValueChange?: (value: string) => void;
}

/* ──────────────────────── Size tokens ──────────────────────── */

const sizeStyles: Record<SelectSize, { label: CSSProperties; trigger: CSSProperties; chevronSize: string; dropdownItem: CSSProperties }> = {
  sm: {
    label: { fontSize: 'var(--_typography---label--sm)' },
    trigger: {
      fontSize: 'var(--_typography---body--sm)',
      padding: 'var(--_space---tiny) var(--_space---sm)',
    },
    chevronSize: 'var(--_typography---body--sm)',
    dropdownItem: {
      fontSize: 'var(--_typography---body--sm)',
      padding: 'var(--_space---tiny) var(--_space---sm)',
    },
  },
  md: {
    label: { fontSize: 'var(--_typography---label--md-base)' },
    trigger: {
      fontSize: 'var(--_typography---body--md-base)',
      padding: 'var(--_space---md) var(--_space---sm)',
    },
    chevronSize: 'var(--_typography---body--md-base)',
    dropdownItem: {
      fontSize: 'var(--_typography---body--md-base)',
      padding: 'var(--_space---sm) var(--_space---sm)',
    },
  },
};

/* ──────────────────────── Trigger styles ──────────────────────── */

const triggerBaseStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  fontFamily: 'var(--_typography---font-family--body)',
  fontWeight: 'var(--font-weight--regular)' as unknown as number,
  lineHeight: 'var(--font-line-height--150)',
  color: 'var(--_color---text--primary)',
  backgroundColor: 'var(--_color---background--input)',
  border: 'var(--_border-width---sm) solid var(--_color---border--primary)',
  borderRadius: 'var(--_border-radius---md)',
  outline: 'none',
  transition: 'border-color 0.2s',
  cursor: 'pointer',
  boxSizing: 'border-box',
  textAlign: 'left',
};

const triggerDisabledStyles: CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

/* ──────────────────────── Dropdown panel styles ──────────────────────── */

/**
 * Dropdown panel — matches BDS Menu visual language
 *
 * Token reference:
 * - --_color---background--primary (panel background)
 * - --_border-radius---md = 4px (matching trigger)
 * - --_space---gap--sm = 4px (tight item gap)
 */
const dropdownPanelStyles: CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  zIndex: 100,
  marginTop: '4px',
  backgroundColor: 'var(--_color---background--primary)',
  borderRadius: 'var(--_border-radius---md)',
  border: 'var(--_border-width---sm) solid var(--_color---border--primary)',
  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
  display: 'flex',
  flexDirection: 'column',
  padding: 'var(--_space---tiny) 0',
  maxHeight: '240px',
  overflowY: 'auto',
  boxSizing: 'border-box',
};

/**
 * Dropdown item — matches BDS Menu item visual language
 *
 * Token reference:
 * - --_color---text--primary (text)
 * - --_typography---font-family--body (font)
 * - --_border-radius---sm = 2px (hover highlight)
 */
const dropdownItemBaseStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--_space---gap--md)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'left',
  fontFamily: 'var(--_typography---font-family--body)',
  lineHeight: 'var(--font-line-height--150)',
  color: 'var(--_color---text--primary)',
  boxSizing: 'border-box',
  transition: 'background-color 0.15s',
};

/* ──────────────────────── Shared chrome styles ──────────────────────── */

const wrapperStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--_space---gap--md)',
  color: 'var(--_color---text--primary)',
};

const labelBaseStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--label)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height--100)',
  textTransform: 'capitalize' as const,
};

const helperBaseStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--body)',
  fontSize: 'var(--_typography---body--sm)',
  lineHeight: 'var(--font-line-height--150)',
  color: 'var(--_color---text--muted)',
};

const iconStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--_color---text--muted)',
  flexShrink: 0,
};

const chevronStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 'auto',
  flexShrink: 0,
  transition: 'transform 0.2s',
};

const placeholderColor: CSSProperties = {
  color: 'var(--_color---text--muted)',
};

/* ──────────────────────── Component ──────────────────────── */

/**
 * Select - BDS custom select dropdown
 *
 * Replaces native `<select>` with a styled trigger button + BDS Menu-style
 * dropdown panel. Full keyboard navigation, dark mode support, and
 * backwards-compatible onChange (provides e.target.value).
 *
 * @example
 * ```tsx
 * <Select
 *   label="Status"
 *   placeholder="Select a status..."
 *   options={[
 *     { label: 'Active', value: 'active' },
 *     { label: 'Inactive', value: 'inactive' },
 *   ]}
 *   onChange={(e) => setStatus(e.target.value)}
 *   fullWidth
 * />
 * ```
 */
export function Select({
  options,
  placeholder,
  value: controlledValue,
  defaultValue,
  disabled = false,
  size = 'md',
  label,
  helperText,
  error,
  fullWidth = false,
  icon,
  name = '',
  required,
  id,
  className = '',
  style,
  onChange,
  onValueChange,
}: SelectProps) {
  const generatedId = useId();
  const inputId = id || (label ? `select-${generatedId}` : undefined);
  const listboxId = `${inputId || generatedId}-listbox`;
  const hasError = Boolean(error);
  const sizeStyle = sizeStyles[size];

  // Controlled vs uncontrolled
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const currentValue = isControlled ? controlledValue : internalValue;

  // Dropdown state
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const typeAheadRef = useRef('');
  const typeAheadTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Selected label
  const selectedOption = options.find(o => o.value === currentValue);
  const displayLabel = selectedOption?.label;

  // Enabled options for keyboard navigation
  const enabledIndices = options.reduce<number[]>((acc, opt, i) => {
    if (!opt.disabled) acc.push(i);
    return acc;
  }, []);

  const selectValue = useCallback((newValue: string) => {
    if (!isControlled) setInternalValue(newValue);
    onChange?.({ target: { value: newValue, name } });
    onValueChange?.(newValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  }, [isControlled, name, onChange, onValueChange]);

  const openDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    // Focus the currently selected item, or first enabled
    const selectedIdx = options.findIndex(o => o.value === currentValue);
    if (selectedIdx >= 0 && !options[selectedIdx].disabled) {
      setFocusedIndex(selectedIdx);
    } else {
      setFocusedIndex(enabledIndices[0] ?? -1);
    }
  }, [disabled, options, currentValue, enabledIndices]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Scroll focused item into view
  useEffect(() => {
    if (!isOpen || focusedIndex < 0) return;
    const listbox = listboxRef.current;
    if (!listbox) return;
    const focusedEl = listbox.children[focusedIndex] as HTMLElement | undefined;
    focusedEl?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, focusedIndex]);

  // Type-ahead search
  const handleTypeAhead = useCallback((char: string) => {
    if (typeAheadTimerRef.current) clearTimeout(typeAheadTimerRef.current);
    typeAheadRef.current += char.toLowerCase();
    typeAheadTimerRef.current = setTimeout(() => { typeAheadRef.current = ''; }, 500);

    const match = options.findIndex(
      (o, i) => !o.disabled && o.label.toLowerCase().startsWith(typeAheadRef.current) && i !== focusedIndex
    );
    if (match >= 0) setFocusedIndex(match);
    // If no match from current search string, try just this character
    else if (typeAheadRef.current.length > 1) {
      typeAheadRef.current = char.toLowerCase();
      const singleMatch = options.findIndex(
        (o) => !o.disabled && o.label.toLowerCase().startsWith(typeAheadRef.current)
      );
      if (singleMatch >= 0) setFocusedIndex(singleMatch);
    }
  }, [options, focusedIndex]);

  // Keyboard handling
  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        e.preventDefault();
        openDropdown();
        break;
    }
  };

  const handleListboxKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const currentPos = enabledIndices.indexOf(focusedIndex);
        const next = enabledIndices[currentPos + 1];
        if (next !== undefined) setFocusedIndex(next);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const currentPos = enabledIndices.indexOf(focusedIndex);
        const prev = enabledIndices[currentPos - 1];
        if (prev !== undefined) setFocusedIndex(prev);
        break;
      }
      case 'Home':
        e.preventDefault();
        if (enabledIndices.length > 0) setFocusedIndex(enabledIndices[0]);
        break;
      case 'End':
        e.preventDefault();
        if (enabledIndices.length > 0) setFocusedIndex(enabledIndices[enabledIndices.length - 1]);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && !options[focusedIndex]?.disabled) {
          selectValue(options[focusedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        break;
      case 'Tab':
        closeDropdown();
        break;
      default:
        // Type-ahead: printable single characters
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          handleTypeAhead(e.key);
        }
        break;
    }
  };

  const triggerCombinedStyles: CSSProperties = {
    ...triggerBaseStyles,
    ...sizeStyle.trigger,
    ...(disabled ? triggerDisabledStyles : {}),
    ...(hasError ? { borderColor: 'var(--system--red)' } : {}),
    ...(isOpen ? { borderColor: 'var(--_color---border--focus, var(--_color---system--link))' } : {}),
    ...(icon ? { gap: 'var(--_space---gap--md)' } : {}),
    ...style,
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        ...wrapperStyles,
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      {label && (
        <label
          htmlFor={inputId}
          style={{
            ...labelBaseStyles,
            ...sizeStyle.label,
            ...(hasError ? { color: 'var(--system--red)' } : {}),
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--system--red)', marginLeft: '2px' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        {/* Hidden input for form submission */}
        <input type="hidden" name={name} value={currentValue} />

        {/* Trigger button */}
        <button
          ref={triggerRef}
          type="button"
          id={inputId}
          disabled={disabled}
          className={bdsClass('bds-select', className)}
          style={triggerCombinedStyles}
          onClick={() => isOpen ? closeDropdown() : openDropdown()}
          onKeyDown={handleTriggerKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? `${inputId}-label` : undefined}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
        >
          {icon && <span style={iconStyles}>{icon}</span>}
          <span style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            ...(!displayLabel ? placeholderColor : {}),
          }}>
            {displayLabel || placeholder || '\u00A0'}
          </span>
          <span style={{
            ...chevronStyles,
            fontSize: sizeStyle.chevronSize,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>
            <FontAwesomeIcon icon={faCaretDown} />
          </span>
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div
            role="listbox"
            aria-activedescendant={focusedIndex >= 0 ? `${listboxId}-option-${focusedIndex}` : undefined}
            tabIndex={0}
            style={dropdownPanelStyles}
            onKeyDown={handleListboxKeyDown}
            ref={(el) => {
              (listboxRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
              el?.focus();
            }}
          >
            {options.map((option, index) => {
              const isSelected = option.value === currentValue;
              const isFocused = index === focusedIndex;
              const isDisabled = Boolean(option.disabled);

              return (
                <button
                  key={option.value}
                  id={`${listboxId}-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={isDisabled}
                  disabled={isDisabled}
                  style={{
                    ...dropdownItemBaseStyles,
                    ...sizeStyle.dropdownItem,
                    ...(isDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
                    ...(isFocused ? { backgroundColor: 'var(--_color---surface--secondary)' } : {}),
                    ...(isSelected && !isFocused ? { fontWeight: 'var(--font-weight--semi-bold)' as unknown as number } : {}),
                  }}
                  onClick={() => {
                    if (!isDisabled) selectValue(option.value);
                  }}
                  onMouseEnter={() => {
                    if (!isDisabled) setFocusedIndex(index);
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <span
          id={inputId ? `${inputId}-error` : undefined}
          style={{ ...helperBaseStyles, color: 'var(--system--red)' }}
          role="alert"
        >
          {error}
        </span>
      )}
      {helperText && !error && (
        <span id={inputId ? `${inputId}-helper` : undefined} style={helperBaseStyles}>
          {helperText}
        </span>
      )}
    </div>
  );
}

export default Select;
