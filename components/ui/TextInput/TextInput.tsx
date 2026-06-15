import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
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
  /** Hide the input border. Use on dark/inverse surfaces where the fill provides sufficient contrast. */
  hideBorder?: boolean;
}

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
 *
 * @summary Themed single-line text input with label/helper/error
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
      hideBorder = false,
      className = '',
      id,
      style,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;
    const hasError = Boolean(error);

    // Suppress 1Password / LastPass prompts on non-credential text fields.
    // A field is treated as credential-adjacent when its `type` signals
    // username/password intent OR the consumer set any `autoComplete` value
    // (an explicit signal of intent — including `off`).
    const { type, autoComplete } = props;
    const isCredentialField =
      type === 'email' || type === 'password' || autoComplete !== undefined;

    return (
      <div
        className={bdsClass(
          'bds-text-input',
          `bds-text-input--${size}`,
          fullWidth && 'bds-text-input--full-width',
          className,
        )}
        style={style}
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

        <div className="bds-text-input__field">
          {iconBefore && (
            <span className="bds-text-input__icon bds-text-input__icon--before">
              {iconBefore}
            </span>
          )}

          <input
            data-1p-ignore={isCredentialField ? undefined : ''}
            data-lpignore={isCredentialField ? undefined : 'true'}
            ref={ref}
            id={inputId}
            className={bdsClass(
              'bds-text-input-field',
              Boolean(iconBefore) && 'bds-text-input-field--has-icon-before',
              Boolean(iconAfter) && 'bds-text-input-field--has-icon-after',
              hideBorder && 'bds-text-input-field--no-border',
              hasError && 'bds-text-input-field--error',
            )}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {iconAfter && (
            <span className="bds-text-input__icon bds-text-input__icon--after">
              {iconAfter}
            </span>
          )}
        </div>

        {error && (
          <span id={`${inputId}-error`} className="bds-text-input__error" role="alert">
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={`${inputId}-helper`} className="bds-text-input__helper">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
