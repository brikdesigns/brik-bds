import { type SelectHTMLAttributes, type ReactNode, type CSSProperties } from 'react';
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
 * - md: px 12px, py 16px, font-size 16px, chevron FA caret-down 16px
 * - sm: px 12px, py 8px, font-size 14px, chevron FA caret-down 14px
 */
export type SelectSize = 'sm' | 'md';

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
  /** Optional icon displayed before the select text */
  icon?: ReactNode;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Size-specific styles matching Figma spec
 *
 * Token reference:
 * - --_space---sm = 12px (horizontal padding)
 * - --_space---md = 16px (md vertical padding)
 * - --_space---tiny = 8px (sm vertical padding)
 * - --_typography---body--md-base = 16px (md font)
 * - --_typography---body--sm = 14px (sm font)
 * - --_typography---label--md-base (md label)
 * - --_typography---label--sm (sm label)
 */
const sizeStyles: Record<SelectSize, { label: CSSProperties; select: CSSProperties; chevronSize: string }> = {
  sm: {
    label: { fontSize: 'var(--_typography---label--sm)' },
    select: {
      fontSize: 'var(--_typography---body--sm)',
      padding: 'var(--_space---tiny) var(--_space---sm)',
    },
    chevronSize: 'var(--_typography---body--sm)',
  },
  md: {
    label: { fontSize: 'var(--_typography---label--md-base)' },
    select: {
      fontSize: 'var(--_typography---body--md-base)',
      padding: 'var(--_space---md) var(--_space---sm)',
    },
    chevronSize: 'var(--_typography---body--md-base)',
  },
};

/**
 * Select input styles using BDS tokens
 *
 * Token reference:
 * - --_color---border--primary (border color per Figma: #e0e0e0)
 * - --_color---background--input (input background)
 * - --_color---text--primary (text color)
 * - --_border-radius---md = 4px (border radius per Figma)
 * - --_typography---font-family--body (body font)
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
  border: 'var(--_border-width---sm) solid var(--_color---border--primary)',
  borderRadius: 'var(--_border-radius---md)',
  outline: 'none',
  transition: 'border-color 0.2s',
  cursor: 'pointer',
  appearance: 'none',
  boxSizing: 'border-box',
  backgroundImage: 'none',
  paddingRight: '36px',
};

const selectDisabledStyles: CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

/**
 * Field wrapper — positions icon and chevron relative to select
 */
const fieldWrapperStyles: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

/**
 * Chevron icon styles (absolutely positioned right)
 *
 * Token reference:
 * - --_space---sm = 12px (right inset matching horizontal padding)
 * - --_color---text--primary (chevron color per Figma)
 */
const chevronStyles: CSSProperties = {
  position: 'absolute',
  right: 'var(--_space---sm)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--_color---text--primary)',
  pointerEvents: 'none',
  zIndex: 1,
};

/**
 * Leading icon styles
 *
 * Token reference:
 * - --_space---sm = 12px (icon inset from edge)
 * - --_color---text--muted (icon color per Figma)
 */
const selectIconStyles: CSSProperties = {
  position: 'absolute',
  left: 'var(--_space---sm)',
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
 * - --font-line-height--100 = 100%
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
 * Uses Font Awesome caret-down icon as the dropdown indicator.
 * Two sizes (md, sm) matching Figma spec with proper BDS tokens.
 * Supports optional label, leading icon, helper text, and error state.
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
    ...(icon ? { paddingLeft: 'calc(var(--_space---sm) * 3)' } : {}),
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
        <span style={{ ...chevronStyles, fontSize: sizeStyle.chevronSize }}>
          <FontAwesomeIcon icon={faCaretDown} />
        </span>
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
