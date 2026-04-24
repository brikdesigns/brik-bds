import { forwardRef, type InputHTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';
import './TextInput.css';

/**
 * TextInput size variants (per Figma bds-text-input)
 */
export type TextInputSize = 'sm' | 'md' | 'lg';

/**
 * TextInput component props
 */
export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Size variant (per Figma design specs) */
  size?: TextInputSize;
  /** Optional label text */
  label?: string;
  /** Helper text shown below input */
  helperText?: string;
  /** Error message (shows error state when provided) */
  error?: string;
  /** Full width input */
  fullWidth?: boolean;
  /** Optional icon before input */
  iconBefore?: ReactNode;
  /** Optional icon after input */
  iconAfter?: ReactNode;
}

/**
 * Wrapper styles — vertical stack with gap between label and field
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
 * Field wrapper styles — positions icons relative to input
 */
const fieldWrapperStyles: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

/**
 * Input field base styles using BDS semantic tokens
 *
 * Token reference:
 * - --background-input (field background — white per Figma)
 * - --border-input (field border — grayscale/light per Figma)
 * - --border-width-md = 1px (border thickness)
 * - --border-radius-md = 4px (field corners)
 * - --padding-xs = 10px (horizontal field padding)
 * - --font-family-body (field text font)
 * - --font-weight-regular = 400
 * - --font-line-height-normal = 150%
 */
const inputBaseStyles: CSSProperties = {
  width: '100%',
  padding: '0 var(--padding-xs)',
  fontFamily: 'var(--font-family-body)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-primary)',
  backgroundColor: 'var(--background-input)',
  border: 'var(--border-width-md) solid var(--border-input)',
  borderRadius: 'var(--border-radius-md)',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

/**
 * Icon positioning styles
 *
 * Token reference:
 * - --padding-xs = 10px (icon inset from edge)
 */
const iconStyles: CSSProperties = {
  position: 'absolute',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-muted)',
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
 * Size-specific styles (per Figma bds-text-input)
 *
 * Heights match Button scale (8px steps, 4px grid):
 *   sm=32  md=40  lg=48
 *
 * Typography:
 * - sm: label 14px, body 14px
 * - md: label 16px, body 16px
 * - lg: label 18px, body 18px
 */
const sizeStyles: Record<TextInputSize, { input: CSSProperties }> = {
  sm: {
    input: { fontSize: 'var(--body-sm)', height: '32px' },
  },
  md: {
    input: { fontSize: 'var(--body-md)', height: '40px' },
  },
  lg: {
    input: { fontSize: 'var(--body-lg)', height: '48px' },
  },
};

/**
 * TextInput - BDS themed text input component
 *
 * Fully token-based — all styles reference BDS semantic design tokens.
 * Matches Figma component: bds-text-input (sizes sm/md/lg)
 *
 * @example
 * ```tsx
 * <TextInput size="sm" label="Email" placeholder="Enter your email" />
 * <TextInput size="md" label="Password" type="password" helperText="Must be at least 8 characters" />
 * <TextInput size="lg" label="Search" error="Required field" />
 * ```
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      size = 'md',
      label,
      helperText,
      error,
      fullWidth = false,
      iconBefore,
      iconAfter,
      className = '',
      id,
      style,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;
    const hasError = Boolean(error);
    const sizeStyle = sizeStyles[size];

    const inputStyles: CSSProperties = {
      ...inputBaseStyles,
      ...sizeStyle.input,
      ...(iconBefore ? { paddingLeft: 'calc(var(--padding-xs) * 4)' } : {}),
      ...(iconAfter ? { paddingRight: 'calc(var(--padding-xs) * 4)' } : {}),
      ...(hasError ? { borderColor: 'var(--border-negative)' } : {}),
    };

    return (
      <div
        className={bdsClass('bds-text-input', className)}
        style={{
          ...wrapperStyles,
          width: fullWidth ? '100%' : 'auto',
          ...style,
        }}
      >
        {label && (
          <label
            htmlFor={inputId}
            className={bdsClass(
              'bds-text-input__label',
              `bds-text-input__label--${size}`,
              hasError && 'bds-text-input__label--error',
            )}
          >
            {label}
          </label>
        )}

        <div style={fieldWrapperStyles}>
          {iconBefore && (
            <span style={{ ...iconStyles, left: 'var(--padding-xs)' }}>
              {iconBefore}
            </span>
          )}

          <input
            data-1p-ignore=""
            data-lpignore="true"
            ref={ref}
            id={inputId}
            className="bds-text-input-field"
            style={inputStyles}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {iconAfter && (
            <span style={{ ...iconStyles, right: 'var(--padding-xs)' }}>
              {iconAfter}
            </span>
          )}
        </div>

        {error && (
          <span
            id={`${inputId}-error`}
            style={{ ...helperBaseStyles, color: 'var(--text-negative)' }}
            role="alert"
          >
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={`${inputId}-helper`} style={helperBaseStyles}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
