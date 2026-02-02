import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

/**
 * Input component props
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
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
 * Input - BDS themed text input component
 *
 * Uses Webflow CSS classes directly to ensure perfect theme integration.
 * Supports labels, helper text, error states, and icons.
 *
 * @example
 * ```tsx
 * <Input label="Email" placeholder="Enter your email" />
 * <Input label="Password" type="password" error="Password is required" />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
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
              fontSize: 'var(--_typography---label--sm)',
              fontWeight: 'var(--font-weight--semi-bold)',
              color: hasError ? 'var(--system--red, #eb5757)' : 'var(--_color---text--primary)',
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
