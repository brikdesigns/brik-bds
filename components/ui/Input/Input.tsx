import { forwardRef, type InputHTMLAttributes, type ReactNode, type CSSProperties } from 'react';

/**
 * Input size variants (per Figma)
 */
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * Input component props
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Size variant (per Figma design specs) */
  size?: InputSize;
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
 * Size-specific typography tokens (per Figma)
 *
 * Figma specs:
 * - sm: label 14px, body 14px
 * - md: label 16px, body 16px
 * - lg: label 18px, body 18px
 */
const sizeStyles: Record<InputSize, { label: CSSProperties; input: CSSProperties }> = {
  sm: {
    label: {
      fontSize: 'var(--_typography---label--sm)',
    },
    input: {
      fontSize: 'var(--_typography---body--sm)',
    },
  },
  md: {
    label: {
      fontSize: 'var(--_typography---label--md)',
    },
    input: {
      fontSize: 'var(--_typography---body--md)',
    },
  },
  lg: {
    label: {
      fontSize: 'var(--_typography---label--lg)',
    },
    input: {
      fontSize: 'var(--_typography---body--lg)',
    },
  },
};

/**
 * Input - BDS themed text input component
 *
 * Now includes size variants matching Figma design specs (sm/md/lg).
 * Uses Webflow CSS classes with size-specific typography overrides.
 * Supports labels, helper text, error states, and icons.
 *
 * @example
 * ```tsx
 * <Input size="sm" label="Email" placeholder="Enter your email" />
 * <Input size="md" label="Password" type="password" />
 * <Input size="lg" label="Search" error="Required field" />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
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
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);
    const sizeStyle = sizeStyles[size];

    return (
      <div
        className={`form-input ${fullWidth ? 'full-width' : ''}`}
        style={{ width: fullWidth ? '100%' : 'auto' }}
      >
        {label && (
          <label
            htmlFor={inputId}
            className="text_label-sm"
            style={{
              display: 'block',
              marginBottom: 'var(--_space---sm, 8px)',
              fontFamily: 'var(--_typography---font-family--label)',
              fontWeight: 'var(--font-weight--semi-bold)',
              color: hasError ? 'var(--system--red, #eb5757)' : 'var(--_color---text--primary)',
              ...sizeStyle.label,
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {iconBefore && (
            <span
              style={{
                position: 'absolute',
                left: '12px',
                color: 'var(--_color---text--muted)',
              }}
            >
              {iconBefore}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`form-field-text ${hasError ? 'error' : ''} ${className}`}
            style={{
              width: '100%',
              paddingLeft: iconBefore ? '40px' : undefined,
              paddingRight: iconAfter ? '40px' : undefined,
              borderColor: hasError ? 'var(--system--red, #eb5757)' : undefined,
              ...sizeStyle.input,
            }}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          {iconAfter && (
            <span
              style={{
                position: 'absolute',
                right: '12px',
                color: 'var(--_color---text--muted)',
              }}
            >
              {iconAfter}
            </span>
          )}
        </div>
        {error && (
          <span
            id={`${inputId}-error`}
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
            id={`${inputId}-helper`}
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
);

Input.displayName = 'Input';

export default Input;
