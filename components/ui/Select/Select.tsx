import { forwardRef, useState, type SelectHTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { bdsClass } from '../../utils';
import './Select.css';

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
 * Option group type
 */
export interface SelectOptionGroup {
  /** Group label */
  label: string;
  /** Options in this group */
  options: SelectOption[];
}

/**
 * Select size variants (matching Input component)
 */
export type SelectSize = 'sm' | 'md' | 'lg';

/**
 * Select component props
 */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Array of options or option groups */
  options: (SelectOption | SelectOptionGroup)[];
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
  /** Full width select (default: true — fills container) */
  fullWidth?: boolean;
  /** Optional icon displayed before the select text */
  icon?: ReactNode;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Size-specific styles (matching TextInput — no hardcoded heights)
 *
 * Token reference:
 * - --label-sm/md-base/lg (label font sizes)
 * - --body-sm/md-base/lg (select font sizes)
 * - --padding-tiny = 8px (input padding)
 */
const sizeStyles: Record<SelectSize, { label: CSSProperties; select: CSSProperties }> = {
  sm: {
    label: { fontSize: 'var(--label-sm)' },
    select: {
      fontSize: 'var(--body-sm)',
      padding: 'var(--padding-tiny)',
    },
  },
  md: {
    label: { fontSize: 'var(--label-md)' },
    select: {
      fontSize: 'var(--body-md)',
      padding: 'var(--padding-tiny)',
    },
  },
  lg: {
    label: { fontSize: 'var(--label-lg)' },
    select: {
      fontSize: 'var(--body-lg)',
      padding: 'calc(var(--padding-tiny) * 1.25)',
    },
  },
};

/**
 * Select input base styles using BDS tokens
 *
 * Token reference:
 * - --border-input (input border color)
 * - --background-input (input background)
 * - --text-primary (text color)
 * - --border-radius-md = 4px (input corners)
 * - --padding-tiny = 8px (input padding)
 * - --font-family-body (body font)
 * - --border-width-md = 1px (border thickness)
 * - --font-line-height-normal = 150%
 */
const selectBaseStyles: CSSProperties = {
  display: 'inline-block',
  width: '100%',
  fontFamily: 'var(--font-family-body)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-primary)',
  backgroundColor: 'var(--background-input)',
  border: 'var(--border-width-md) solid var(--border-input)',
  borderRadius: 'var(--border-radius-md)',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  cursor: 'pointer',
  appearance: 'none',
  boxSizing: 'border-box',
  paddingRight: 'calc(var(--padding-tiny) * 4)',
};

/**
 * Chevron icon positioning (right side)
 *
 * Token reference:
 * - --padding-tiny = 8px (icon inset from edge)
 * - --text-muted (icon color)
 */
const chevronStyles: CSSProperties = {
  position: 'absolute',
  right: 'var(--padding-tiny)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-muted)',
  pointerEvents: 'none',
  zIndex: 1,
  fontSize: '0.75em', // bds-lint-ignore — relative to input font size for proportional scaling
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
 * - --padding-tiny = 8px (icon inset from edge)
 * - --text-muted (icon color, matches placeholder)
 * - --gap-md = 8px (icon-text gap)
 */
const selectIconStyles: CSSProperties = {
  position: 'absolute',
  left: 'var(--padding-tiny)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-muted)',
  pointerEvents: 'none',
  zIndex: 1,
};

/**
 * Wrapper styles — vertical stack matching TextInput pattern
 *
 * Token reference:
 * - --gap-md = 8px (gap between label and field)
 */
const wrapperStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-md)',
  color: 'var(--text-primary)',
};

/**
 * Label base styles matching TextInput pattern
 *
 * Token reference:
 * - --font-family-label (label font)
 * - --font-weight-semi-bold = 600
 * - --font-line-height-tight = 100% (matches TextInput label)
 */
const labelBaseStyles: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
  textTransform: 'capitalize' as const,
};

/**
 * Helper/error text base styles
 *
 * Token reference:
 * - --font-family-body (helper font)
 * - --body-sm (small text size)
 * - --text-muted (helper text color)
 */
const helperBaseStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-muted)',
};

/**
 * Type guard for option groups
 */
function isOptionGroup(opt: SelectOption | SelectOptionGroup): opt is SelectOptionGroup {
  return 'options' in opt;
}

/**
 * Select - BDS themed select dropdown component
 *
 * Uses CSS variables for theming. Provides a styled select dropdown
 * with custom arrow indicator, optional label, helper text, and error state.
 * All spacing, colors, and typography reference BDS tokens.
 *
 * Width: Fills container by default (fullWidth=true). Set fullWidth=false
 * for inline/compact usage where the select should shrink to content width.
 *
 * Interactive states (hover, focus, error) are handled in Select.css using
 * the same token pattern as Button and TextInput.
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
 * />
 * ```
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      placeholder,
      value,
      defaultValue,
      disabled = false,
      size = 'md',
      label,
      helperText,
      error,
      fullWidth = true,
      icon,
      onChange,
      id,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `select-${Math.random().toString(36).substring(2, 11)}` : undefined);
    const hasError = Boolean(error);
    const sizeStyle = sizeStyles[size];

    // Track whether placeholder is showing (for muted text color via CSS)
    const [isPlaceholder, setIsPlaceholder] = useState(
      !value && !defaultValue && Boolean(placeholder)
    );

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setIsPlaceholder(e.target.value === '');
      onChange?.(e);
    };

    const selectClassName = bdsClass(
      'bds-select',
      hasError ? 'bds-select--error' : '',
      isPlaceholder ? 'bds-select--placeholder' : '',
      className
    );

    const combinedStyles: CSSProperties = {
      ...selectBaseStyles,
      ...sizeStyle.select,
      ...(icon ? { paddingLeft: 'calc(var(--padding-tiny) * 4)' } : {}),
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
              ...(hasError ? { color: 'var(--color-system-red)' } : {}),
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
            ref={ref}
            id={inputId}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            onChange={handleChange}
            className={selectClassName}
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
            {options.map((opt) =>
              isOptionGroup(opt) ? (
                <optgroup key={opt.label} label={opt.label}>
                  {opt.options.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ) : (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.label}
                </option>
              )
            )}
          </select>
          <span style={chevronStyles} aria-hidden="true">
            <FontAwesomeIcon icon={faChevronDown} />
          </span>
        </div>
        {error && (
          <span
            id={inputId ? `${inputId}-error` : undefined}
            style={{ ...helperBaseStyles, color: 'var(--color-system-red)' }}
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
);

Select.displayName = 'Select';

export default Select;
