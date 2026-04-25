import { forwardRef, useState, type SelectHTMLAttributes, type ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { CaretDown } from '../../icons';
import { bdsClass } from '../../utils';
import './Select.css';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Flat options or grouped option groups. Mix freely — entries with an `options` key render as `<optgroup>`, others as `<option>`. */
  options: (SelectOption | SelectOptionGroup)[];
  /** Empty-value option text shown when no selection has been made. Renders as a placeholder-styled first option. */
  placeholder?: string;
  /** Controlled selection. Pair with `onChange` — uncontrolled callers use `defaultValue`. */
  value?: string;
  /** Initial selection for uncontrolled use. */
  defaultValue?: string;
  /** Disable the select and apply muted styling. */
  disabled?: boolean;
  /** Size variant. Default `md`; `sm` and `lg` adjust padding and font size. */
  size?: SelectSize;
  /** Visible label rendered above the select. Auto-wires `htmlFor`/`id` for accessibility. */
  label?: string;
  /** Small text shown below the select. Hidden when `error` is present. */
  helperText?: string;
  /** Error message. Sets `aria-invalid` and replaces `helperText`. */
  error?: string;
  /** Stretch the wrapper to its container width. Default `true`. */
  fullWidth?: boolean;
  /** Optional leading icon rendered inside the select field (left of the value). */
  icon?: ReactNode;
  /** Native change handler — receives the change event. */
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

function isOptionGroup(opt: SelectOption | SelectOptionGroup): opt is SelectOptionGroup {
  return 'options' in opt;
}

/**
 * Select — themed select dropdown with label, helper text, and error state.
 *
 * @summary Themed native select with label, helper, error
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
      className,
      style,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `select-${Math.random().toString(36).substring(2, 11)}` : undefined);
    const hasError = Boolean(error);

    const [isPlaceholder, setIsPlaceholder] = useState(
      !value && !defaultValue && Boolean(placeholder)
    );

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setIsPlaceholder(e.target.value === '');
      onChange?.(e);
    };

    const selectClassName = bdsClass(
      'bds-select',
      `bds-select--${size}`,
      hasError && 'bds-select--error',
      isPlaceholder && 'bds-select--placeholder',
      icon ? 'bds-select--has-icon' : undefined,
      className,
    );

    return (
      <div
        className={bdsClass('bds-select-wrapper', fullWidth && 'bds-select-wrapper--full-width')}
      >
        {label && (
          <label
            htmlFor={inputId}
            className={bdsClass(
              'bds-select-label',
              `bds-select-label--${size}`,
              hasError && 'bds-select-label--error',
            )}
          >
            {label}
          </label>
        )}
        <div className="bds-select-field">
          {icon && <span className="bds-select-icon">{icon}</span>}
          <select
            ref={ref}
            id={inputId}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            onChange={handleChange}
            className={selectClassName}
            style={style}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) =>
              isOptionGroup(opt) ? (
                <optgroup key={opt.label} label={opt.label}>
                  {opt.options.map((option) => (
                    <option key={option.value} value={option.value} disabled={option.disabled}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ) : (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              )
            )}
          </select>
          <span className="bds-select-chevron" aria-hidden="true">
            <Icon icon={CaretDown} />
          </span>
        </div>
        {error && (
          <span
            id={inputId ? `${inputId}-error` : undefined}
            className="bds-select-helper bds-select-helper--error"
            role="alert"
          >
            {error}
          </span>
        )}
        {helperText && !error && (
          <span id={inputId ? `${inputId}-helper` : undefined} className="bds-select-helper">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
