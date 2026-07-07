import { useId, type TextareaHTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './TextArea.css';

/**
 * TextArea size variants — matches TextInput sizes
 */
export type TextAreaSize = 'sm' | 'md' | 'lg';

/**
 * TextArea component props
 */
export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Size variant (controls font-size, matching TextInput) */
  size?: TextAreaSize;
  /** Placeholder text */
  placeholder?: string;
  /** Number of visible text rows */
  rows?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Value (controlled) */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Allow resize */
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  /** Optional label text */
  label?: string;
  /** Helper text shown below textarea */
  helperText?: string;
  /** Error message (shows error state when provided) */
  error?: string;
  /** Full width textarea */
  fullWidth?: boolean;
}

/**
 * TextArea - BDS themed multi-line text input component
 *
 * Uses identical border, radius, background, and typography tokens as
 * TextInput, SearchInput, and AddressInput for consistent form styling.
 * All styling lives in TextArea.css; size, resize, error, and full-width are
 * driven by BEM modifier classes.
 *
 * @example
 * ```tsx
 * <TextArea label="Notes" placeholder="Enter your message..." rows={4} fullWidth />
 * <TextArea label="Description" error="Required" rows={3} fullWidth />
 * <TextArea placeholder="Comments" rows={6} resize="none" />
 * ```
 *
 * @summary Themed multi-line text input with label/helper/error
 */
export function TextArea({
  size = 'md',
  placeholder,
  rows = 4,
  disabled = false,
  value,
  defaultValue,
  onChange,
  resize = 'vertical',
  label,
  helperText,
  error,
  fullWidth = false,
  id,
  className = '',
  style,
  ...props
}: TextAreaProps) {
  const generatedId = useId();
  const inputId = id || (label ? `textarea-${generatedId}` : undefined);
  const hasError = Boolean(error);

  return (
    <div
      className={bdsClass('bds-text-area', fullWidth && 'bds-text-area--full-width')}
    >
      {label && (
        <label
          htmlFor={inputId}
          className={bdsClass(
            'bds-text-area__label',
            `bds-text-area__label--${size}`,
            hasError && 'bds-text-area__label--error',
          )}
        >
          {label}
        </label>
      )}
      <textarea
        data-1p-ignore=""
        data-lpignore="true"
        id={inputId}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        className={bdsClass(
          'bds-text-area-field',
          `bds-text-area-field--${size}`,
          `bds-text-area-field--resize-${resize}`,
          hasError && 'bds-text-area-field--error',
          className,
        )}
        style={style}
        aria-invalid={hasError}
        aria-describedby={
          error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
        }
        {...props}
      />
      {error && (
        <span
          id={inputId ? `${inputId}-error` : undefined}
          className="bds-text-area__error"
          role="alert"
        >
          {error}
        </span>
      )}
      {helperText && !error && (
        <span
          id={inputId ? `${inputId}-helper` : undefined}
          className="bds-text-area__helper"
        >
          {helperText}
        </span>
      )}
    </div>
  );
}

export default TextArea;
