import { forwardRef, type InputHTMLAttributes, type ReactNode, type CSSProperties } from 'react';

/**
 * Input size variants (per Figma bds-text-input)
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
 * Wrapper styles — vertical stack with gap between label and field
 *
 * Token reference:
 * - --_space---gap--sm = 4px (gap between label and field — matches Figma gap/sm)
 */
const wrapperStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--_space---gap--md)',
};

/**
 * Label base styles using BDS tokens
 *
 * Token reference:
 * - --_typography---font-family--label (label font)
 * - --font-weight--semi-bold = 600 (SemiBold per Figma)
 * - --_color---text--primary (label text color)
 */
const labelBaseStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--label)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height--100)',
  color: 'var(--_color---text--primary)',
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
 * Input field base styles using BDS tokens
 *
 * Token reference:
 * - --_color---background--input (field background — white per Figma background/input)
 * - --_color---border--input (field border — grayscale/light per Figma)
 * - --_border-width---sm (border thickness)
 * - --_border-radius---input = 2px (field corners — matches Figma border-radius/small)
 * - --_space---input = 8px (field padding)
 * - --_typography---font-family--body (field text font — Regular per Figma)
 * - --font-weight--regular = 400
 * - --font-line-height--150 = 150%
 * - --_color---text--primary (typed text color)
 */
const inputBaseStyles: CSSProperties = {
  width: '100%',
  padding: 'var(--_space---input)',
  fontFamily: 'var(--_typography---font-family--body)',
  fontWeight: 'var(--font-weight--regular)' as unknown as number,
  lineHeight: 'var(--font-line-height--150)',
  color: 'var(--_color---text--primary)',
  backgroundColor: 'var(--_color---background--input)',
  border: 'var(--_border-width---sm) solid var(--_color---border--input)',
  borderRadius: 'var(--_border-radius---input)',
  outline: 'none',
  transition: 'border-color 0.2s',
};

/**
 * Icon positioning styles
 *
 * Token reference:
 * - --_space---input = 8px (icon inset from edge)
 */
const iconStyles: CSSProperties = {
  position: 'absolute',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--_color---text--muted)',
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
 * Size-specific typography tokens (per Figma bds-text-input)
 *
 * Figma specs:
 * - sm: label font-size/75 (14px), body font-size/75 (14px)
 * - md: label font-size/100 (16px), body font-size/100 (16px)
 * - lg: label font-size/200 (18px), body font-size/200 (18px)
 */
const sizeStyles: Record<InputSize, { label: CSSProperties; input: CSSProperties }> = {
  sm: {
    label: { fontSize: 'var(--_typography---label--sm)' },
    input: { fontSize: 'var(--_typography---body--sm)' },
  },
  md: {
    label: { fontSize: 'var(--_typography---label--md-base)' },
    input: { fontSize: 'var(--_typography---body--md-base)' },
  },
  lg: {
    label: { fontSize: 'var(--_typography---label--le)' },
    input: { fontSize: 'var(--_typography---body--lg)' },
  },
};

/**
 * Input - BDS themed text input component
 *
 * Fully token-based — does NOT depend on Webflow CSS classes.
 * All styles reference BDS design tokens for consistent theming
 * across all 8 theme variants.
 *
 * Matches Figma component: bds-text-input (sizes sm/md/lg)
 *
 * @example
 * ```tsx
 * <Input size="sm" label="Email" placeholder="Enter your email" />
 * <Input size="md" label="Password" type="password" helperText="Must be at least 8 characters" />
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
      ...(iconBefore ? { paddingLeft: 'calc(var(--_space---input) * 4)' } : {}),
      ...(iconAfter ? { paddingRight: 'calc(var(--_space---input) * 4)' } : {}),
      ...(hasError ? { borderColor: 'var(--system--red)' } : {}),
    };

    return (
      <div
        className={className || undefined}
        style={{
          ...wrapperStyles,
          width: fullWidth ? '100%' : 'auto',
          ...style,
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
          {iconBefore && (
            <span style={{ ...iconStyles, left: 'var(--_space---input)' }}>
              {iconBefore}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            style={inputStyles}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {iconAfter && (
            <span style={{ ...iconStyles, right: 'var(--_space---input)' }}>
              {iconAfter}
            </span>
          )}
        </div>

        {error && (
          <span
            id={`${inputId}-error`}
            style={{ ...helperBaseStyles, color: 'var(--system--red)' }}
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

Input.displayName = 'Input';

export default Input;
