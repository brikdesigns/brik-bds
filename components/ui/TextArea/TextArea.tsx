import { type TextareaHTMLAttributes, type CSSProperties } from 'react';
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
 * Wrapper styles — vertical stack matching TextInput pattern
 *
 * Token reference:
 * - --gap-md = 8px
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
 * - --font-family-label
 * - --font-weight-semi-bold = 600
 * - --font-line-height-tight
 */
const labelBaseStyles: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
  textTransform: 'capitalize' as const,
};

/**
 * Size-variant styles — matches TextInput exactly
 *
 * Figma specs:
 * - sm: label 14px, body 14px
 * - md: label 16px, body 16px
 * - lg: label 18px, body 18px
 */
const sizeStyles: Record<TextAreaSize, { label: CSSProperties; textarea: CSSProperties }> = {
  sm: {
    label: { fontSize: 'var(--label-sm)' },
    textarea: { fontSize: 'var(--body-sm)' },
  },
  md: {
    label: { fontSize: 'var(--label-md)' },
    textarea: { fontSize: 'var(--body-md)' },
  },
  lg: {
    label: { fontSize: 'var(--label-lg)' },
    textarea: { fontSize: 'var(--body-lg)' },
  },
};

/**
 * Helper/error text base styles
 *
 * Token reference:
 * - --font-family-body
 * - --body-sm (14px)
 * - --text-muted
 */
const helperBaseStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-muted)',
};

/**
 * TextArea styles — matches TextInput, SearchInput, AddressInput
 *
 * Token reference:
 * - --background-input (field background)
 * - --border-input (field border)
 * - --border-width-md = 1px (border thickness)
 * - --border-radius-md = 4px (corners)
 * - --padding-xs = 10px (padding)
 * - --font-family-body
 * - --body-md = 16px
 * - --font-weight-regular = 400
 * - --font-line-height-normal
 */
const textareaStyles: CSSProperties = {
  display: 'block',
  width: '100%',
  minWidth: 200,
  padding: 'var(--padding-xs)',
  fontFamily: 'var(--font-family-body)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-primary)',
  backgroundColor: 'var(--background-input)',
  border: 'var(--border-width-md) solid var(--border-input)',
  borderRadius: 'var(--border-radius-md)',
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
 * Uses identical border, radius, background, and typography tokens as
 * TextInput, SearchInput, and AddressInput for consistent form styling.
 *
 * @example
 * ```tsx
 * <TextArea label="Notes" placeholder="Enter your message..." rows={4} fullWidth />
 * <TextArea label="Description" error="Required" rows={3} fullWidth />
 * <TextArea placeholder="Comments" rows={6} resize="none" />
 * ```
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
  const inputId = id || (label ? `textarea-${Math.random().toString(36).substring(2, 11)}` : undefined);
  const hasError = Boolean(error);
  const sizeStyle = sizeStyles[size];

  const combinedStyles: CSSProperties = {
    ...textareaStyles,
    ...sizeStyle.textarea,
    resize,
    ...(disabled ? textareaDisabledStyles : {}),
    ...(hasError ? { borderColor: 'var(--color-system-red)' } : {}),
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
            ...sizeStyle.label,
            ...(hasError ? { color: 'var(--color-system-red)' } : {}),
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

export default TextArea;
