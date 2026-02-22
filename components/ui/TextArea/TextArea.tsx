import { type TextareaHTMLAttributes, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';
import './TextArea.css';

/**
 * TextArea component props
 */
export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
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
 * - --_typography---label--md-base (default label size)
 */
const labelBaseStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--label)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height--100)',
  fontSize: 'var(--_typography---label--md-base)',
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
 * TextArea styles using BDS tokens
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
const textareaStyles: CSSProperties = {
  display: 'block',
  width: '100%',
  minWidth: '200px',
  padding: 'var(--_space---input)',
  fontFamily: 'var(--_typography---font-family--body)',
  fontWeight: 'var(--font-weight--regular)' as unknown as number,
  fontSize: 'var(--_typography---body--md-base)',
  lineHeight: 'var(--font-line-height--150)',
  color: 'var(--_color---text--primary)',
  backgroundColor: 'var(--_color---background--input)',
  border: 'var(--_border-width---sm) solid var(--_color---border--input)',
  borderRadius: 'var(--_border-radius---input)',
  outline: 'none',
  transition: 'border-color 0.2s',
  resize: 'vertical',
  boxSizing: 'border-box',
};

const textareaDisabledStyles: CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
  resize: 'none',
};

/**
 * TextArea - BDS themed multi-line text input component
 *
 * Uses CSS variables for theming. Provides a styled textarea with
 * configurable rows, resize behavior, optional label, helper text,
 * and error state. All spacing, colors, and typography reference BDS tokens.
 *
 * Wrapper pattern matches TextInput and Select for consistent alignment
 * when placed in form layouts.
 *
 * @example
 * ```tsx
 * <TextArea label="Notes" placeholder="Enter your message..." rows={4} fullWidth />
 * <TextArea label="Description" error="Required" rows={3} fullWidth />
 * <TextArea placeholder="Comments" rows={6} resize="none" />
 * ```
 */
export function TextArea({
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
  const inputId = id || (label ? `textarea-${Math.random().toString(36).substring(2, 11)}` : undefined);
  const hasError = Boolean(error);

  const combinedStyles: CSSProperties = {
    ...textareaStyles,
    resize,
    ...(disabled ? textareaDisabledStyles : {}),
    ...(hasError ? { borderColor: 'var(--system--red)' } : {}),
    ...style,
  };

  return (
    <div
      className="bds-text-area"
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
            ...(hasError ? { color: 'var(--system--red)' } : {}),
          }}
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        className={bdsClass('bds-text-area-field', className)}
        style={combinedStyles}
        aria-invalid={hasError}
        aria-describedby={
          error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
        }
        {...props}
      />
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

export default TextArea;
