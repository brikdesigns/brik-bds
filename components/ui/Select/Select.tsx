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
 * Select component props
 */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Array of options */
  options: SelectOption[];
  /** Placeholder text (shown as first disabled option) */
  placeholder?: string;
  /** Selected value (controlled) */
  value?: string;
  /** Default selected value (uncontrolled) */
  defaultValue?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

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
const selectStyles: CSSProperties = {
  display: 'inline-block',
  width: '100%',
  minWidth: '200px',
  padding: 'var(--_space---input)',
  fontFamily: 'var(--_typography---font-family--body)',
  fontWeight: 'var(--font-weight--regular)' as unknown as number,
  fontSize: 'var(--_typography---body--sm)',
  lineHeight: 'var(--font-line-height--150)',
  color: 'var(--_color---text--primary)',
  backgroundColor: 'var(--_color---background--input)',
  border: 'var(--_border-width---sm) solid var(--_color---border--input)',
  borderRadius: 'var(--_border-radius---input)',
  outline: 'none',
  transition: 'border-color 0.2s',
  cursor: 'pointer',
  appearance: 'none',
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
 * with custom arrow indicator. All spacing, colors, and typography
 * reference BDS tokens.
 *
 * @example
 * ```tsx
 * <Select
 *   placeholder="Select an option..."
 *   options={[
 *     { label: 'First choice', value: 'first' },
 *     { label: 'Second choice', value: 'second' },
 *     { label: 'Third choice', value: 'third' },
 *   ]}
 * />
 * ```
 */
export function Select({
  options,
  placeholder,
  value,
  defaultValue,
  disabled = false,
  onChange,
  id,
  className = '',
  style,
  ...props
}: SelectProps) {
  const combinedStyles: CSSProperties = {
    ...selectStyles,
    ...(disabled ? selectDisabledStyles : {}),
    ...style,
  };

  return (
    <select
      id={id}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      onChange={onChange}
      className={className || undefined}
      style={combinedStyles}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
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
  );
}

export default Select;
