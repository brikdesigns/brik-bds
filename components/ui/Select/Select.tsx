import { type SelectHTMLAttributes, type CSSProperties } from 'react';

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
 * Select size variants (matching Input component)
 */
export type SelectSize = 'sm' | 'md' | 'lg';

/**
 * Select component props
 */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Array of options */
  options: SelectOption[];
  /** Placeholder text (shown as first option with empty value) */
  placeholder?: string;
  /** Selected value (controlled) */
  value?: string;
  /** Default selected value (uncontrolled) */
  defaultValue?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant (matching Input sizes) */
  size?: SelectSize;
  /** Optional label text */
  label?: string;
  /** Helper text shown below select */
  helperText?: string;
  /** Error message (shows error state when provided) */
  error?: string;
  /** Full width select */
  fullWidth?: boolean;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Size-specific styles (matching Input component)
 */
const sizeStyles: Record<SelectSize, { label: CSSProperties; select: CSSProperties }> = {
  sm: {
    label: { fontSize: 'var(--_typography---label--sm)' },
    select: {
      fontSize: 'var(--_typography---body--sm)',
      padding: 'var(--_space---input)',
      height: '36px',
    },
  },
  md: {
    label: { fontSize: 'var(--_typography---label--md-base)' },
    select: {
      fontSize: 'var(--_typography---body--md-base)',
      padding: 'var(--_space---input)',
      height: '40px',
    },
  },
  lg: {
    label: { fontSize: 'var(--_typography---label--le)' },
    select: {
      fontSize: 'var(--_typography---body--lg)',
      padding: 'calc(var(--_space---input) * 1.25)',
      height: '48px',
    },
  },
};

/**
 * Select input styles using BDS tokens
 *
 * Token reference:
 * - --_color---border--input (input border color)
 * - --_color---background--input (input background)
 * - --_color---text--primary (text color)
 * - --_border-radius---input = 2px (input corners)
 * - --_space---input = 8px (input padding)
 * - --_typography---font-family--body (body font)
 * - --_typography---body--sm (small body text size)
 * - --_border-width---sm (border thickness)
 */
const selectBaseStyles: CSSProperties = {
  display: 'inline-block',
  width: '100%',
  fontFamily: 'var(--_typography---font-family--body)',
  fontWeight: 'var(--font-weight--regular)' as unknown as number,
  lineHeight: 'var(--font-line-height--150)',
  color: 'var(--_color---text--primary)',
  backgroundColor: 'var(--_color---background--input)',
  border: 'var(--_border-width---sm) solid var(--_color---border--input)',
  borderRadius: 'var(--_border-radius---input)',
  outline: 'none',
  transition: 'border-color 0.2s',
  cursor: 'pointer',
  appearance: 'none',
  boxSizing: 'border-box',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right var(--_space---input) center',
  paddingRight: 'calc(var(--_space---input) * 3)',
};

const selectDisabledStyles: CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

/**
 * Select - BDS themed select dropdown component
 *
 * Uses CSS variables for theming. Provides a styled select dropdown
 * with custom arrow indicator, optional label, helper text, and error state.
 * All spacing, colors, and typography reference BDS tokens.
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
 *   fullWidth
 * />
 * ```
 */
export function Select({
  options,
  placeholder,
  value,
  defaultValue,
  disabled = false,
  size = 'md',
  label,
  helperText,
  error,
  fullWidth = false,
  onChange,
  id,
  className = '',
  style,
  ...props
}: SelectProps) {
  const inputId = id || (label ? `select-${Math.random().toString(36).substring(2, 11)}` : undefined);
  const hasError = Boolean(error);
  const sizeStyle = sizeStyles[size];

  const combinedStyles: CSSProperties = {
    ...selectBaseStyles,
    ...sizeStyle.select,
    ...(disabled ? selectDisabledStyles : {}),
    ...(hasError ? { borderColor: 'var(--system--red, #eb5757)' } : {}),
    ...style,
  };

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            marginBottom: 'var(--_space---sm, 8px)',
            fontFamily: 'var(--_typography---font-family--label)',
            fontWeight: 'var(--font-weight--semi-bold)' as string,
            color: hasError ? 'var(--system--red, #eb5757)' : 'var(--_color---text--primary)',
            ...sizeStyle.label,
          }}
        >
          {label}
        </label>
      )}
      <select
        id={inputId}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={onChange}
        className={className || undefined}
        style={combinedStyles}
        aria-invalid={hasError}
        aria-describedby={
          error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
        }
        {...props}
      >
        {placeholder && (
          <option value="">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span
          id={inputId ? `${inputId}-error` : undefined}
          style={{
            display: 'block',
            marginTop: 'var(--_space---sm, 4px)',
            fontFamily: 'var(--_typography---font-family--body)',
            fontSize: 'var(--_typography---body--sm)',
            color: 'var(--system--red, #eb5757)',
          }}
        >
          {error}
        </span>
      )}
      {helperText && !error && (
        <span
          id={inputId ? `${inputId}-helper` : undefined}
          style={{
            display: 'block',
            marginTop: 'var(--_space---sm, 4px)',
            fontFamily: 'var(--_typography---font-family--body)',
            fontSize: 'var(--_typography---body--sm)',
            color: 'var(--_color---text--muted)',
          }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
}

export default Select;
