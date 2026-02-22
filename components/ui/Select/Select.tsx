import { type SelectHTMLAttributes, type ReactNode, type CSSProperties } from 'react';
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
  /** Optional icon displayed before the select text */
  icon?: ReactNode;
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
    label: { fontSize: 'var(--_typography---label--lg)' },
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
  // bds-lint-ignore — data URI SVGs cannot reference CSS variables; #333 = text--primary default
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23333' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right var(--_space---input) center',
  paddingRight: 'calc(var(--_space---input) * 3)',
};

const selectDisabledStyles: CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

/**
 * Field wrapper — positions icon relative to select
 */
const fieldWrapperStyles: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

/**
 * Icon positioning styles
 *
 * Token reference:
 * - --_space---input = 8px (icon inset from edge)
 * - --_color---text--muted (icon color, matches placeholder)
 * - --_space---gap--md = 8px (icon-text gap)
 */
const selectIconStyles: CSSProperties = {
  position: 'absolute',
  left: 'var(--_space---input)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--_color---text--muted)',
  pointerEvents: 'none',
  zIndex: 1,
};

/**
 * Wrapper styles — vertical stack matching TextInput pattern
 *
 * Token reference:
 * - --_space---gap--md = 8px (gap between label and field)
 */
const wrapperStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--_space---gap--md)',
  color: 'var(--_color---text--primary)',
};

/**
 * Label base styles matching TextInput pattern
 *
 * Token reference:
 * - --_typography---font-family--label (label font)
 * - --font-weight--semi-bold = 600
 * - --font-line-height--100 = 100% (matches TextInput label)
 */
const labelBaseStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--label)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height--100)',
  textTransform: 'capitalize' as const,
};

/**
 * Helper/error text base styles
 *
 * Token reference:
 * - --_typography---font-family--body (helper font)
 * - --_typography---body--sm (small text size)
 * - --_color---text--muted (helper text color)
 */
const helperBaseStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--body)',
  fontSize: 'var(--_typography---body--sm)',
  lineHeight: 'var(--font-line-height--150)',
  color: 'var(--_color---text--muted)',
};

/**
 * Select - BDS themed select dropdown component
 *
 * Uses CSS variables for theming. Provides a styled select dropdown
 * with custom arrow indicator, optional label, helper text, and error state.
 * All spacing, colors, and typography reference BDS tokens.
 *
 * Wrapper pattern matches TextInput for consistent alignment when placed
 * side-by-side in form layouts.
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
  icon,
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
    ...(hasError ? { borderColor: 'var(--system--red)' } : {}),
    ...(icon ? { paddingLeft: 'calc(var(--_space---input) * 4)' } : {}),
    ...style,
  };

  return (
    <div
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
        </label>
      )}
      <div style={fieldWrapperStyles}>
        {icon && (
          <span style={selectIconStyles}>
            {icon}
          </span>
        )}
        <select
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          onChange={onChange}
          className={bdsClass('bds-select', className)}
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
