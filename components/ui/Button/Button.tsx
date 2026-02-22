import { forwardRef, type ButtonHTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';
import './Button.css';

/**
 * Button variants
 */
export type ButtonVariant = 'primary' | 'outline' | 'secondary' | 'ghost';

/**
 * Button sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button component props
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Full width button */
  fullWidth?: boolean;
  /** Children content */
  children: ReactNode;
  /** Optional icon before text */
  iconBefore?: ReactNode;
  /** Optional icon after text */
  iconAfter?: ReactNode;
  /** Loading state — shows spinner and disables interaction */
  loading?: boolean;
  /** Render as anchor tag (for links) */
  asLink?: boolean;
  /** Link href (when asLink is true) */
  href?: string;
}

/**
 * Size-based styles using BDS spacing tokens
 *
 * Token reference:
 * - --_space---sm = 12px
 * - --_space---md = 16px
 * - --_space---lg = 24px
 * - --_space---xl = 32px
 * - --_typography---label--sm (small label)
 * - --_typography---label--md-base (base label)
 */
const sizeStyles: Record<ButtonSize, CSSProperties> = {
  sm: {
    padding: 'var(--_space---sm) var(--_space---md)',
    fontSize: 'var(--_typography---label--sm)',
  },
  md: {
    padding: 'var(--_space---md) var(--_space---lg)',
    fontSize: 'var(--_typography---label--md-base)',
  },
  lg: {
    padding: 'var(--_space---lg) var(--_space---xl)',
    fontSize: 'var(--_typography---label--md-base)',
  },
};

/**
 * Variant-based styles using BDS color and border tokens
 *
 * Token reference:
 * - --_color---background--brand-primary (brand background)
 * - --_color---text--on-color-dark (text on dark/colored backgrounds — always white)
 * - --_color---text--primary (text on light backgrounds — theme-adaptive)
 * - --_color---text--brand (brand text)
 * - --_color---border--brand (brand border)
 * - --_border-width---sm (thin border)
 * - --_border-width---md (medium border)
 */
const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: 'var(--_color---background--brand-primary)',
    color: 'var(--_color---text--on-color-dark)',
    border: 'none',
  },
  outline: {
    backgroundColor: 'transparent',
    color: 'var(--_color---text--brand)',
    border: 'var(--_border-width---md) solid var(--_color---border--brand)',
  },
  secondary: {
    backgroundColor: 'var(--_color---surface--secondary)',
    color: 'var(--_color---text--primary)',
    border: 'var(--_border-width---sm) solid var(--_color---border--secondary)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--_color---text--primary)',
    border: 'none',
  },
};

/**
 * Base button styles using BDS tokens
 *
 * Token reference:
 * - --_space---gap--sm = 6px (icon gap)
 * - --_typography---font-family--label (button font)
 * - --_border-radius---button = 2px (button corners)
 */
const baseStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--_space---gap--sm)',
  fontFamily: 'var(--_typography---font-family--label)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height--150)',
  borderRadius: 'var(--_border-radius---button)',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'background-color 0.2s, border-color 0.2s, opacity 0.2s',
  whiteSpace: 'nowrap',
  textTransform: 'capitalize' as const,
};

/**
 * Button - BDS themed button component
 *
 * Uses CSS variables for theming to ensure perfect integration with the BDS theme system.
 * All spacing, colors, typography, and border-radius reference BDS tokens.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg">Get Started</Button>
 * <Button variant="outline" size="md">Learn More</Button>
 * <Button variant="secondary" size="sm" fullWidth>Submit</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      children,
      iconBefore,
      iconAfter,
      loading = false,
      asLink = false,
      href,
      className = '',
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const combinedStyles: CSSProperties = {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth ? { width: '100%' } : {}),
      ...(isDisabled ? { opacity: disabled ? 0.5 : 1, cursor: 'not-allowed' } : {}),
      ...(loading ? { position: 'relative' as const } : {}),
      ...style,
    };

    const buttonClasses = bdsClass(
      'bds-button',
      `bds-button-${variant}`,
      loading && 'bds-button-loading',
      className
    );

    const content = (
      <>
        <span style={loading ? { visibility: 'hidden' as const } : undefined}>
          {iconBefore}
          {children}
          {iconAfter}
        </span>
        {loading && (
          <span
            className="bds-button-spinner"
            role="status"
            aria-label="Loading"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: size === 'sm' ? '14px' : '16px',
                height: size === 'sm' ? '14px' : '16px',
                borderRadius: '50%',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: 'currentColor',
                borderTopColor: 'transparent',
                animation: 'bds-button-spin 0.8s linear infinite',
                opacity: 0.9,
              }}
            />
          </span>
        )}
      </>
    );

    // Render as anchor if asLink is true
    if (asLink && href) {
      return (
        <a
          href={href}
          className={buttonClasses}
          style={combinedStyles}
          aria-disabled={isDisabled}
          aria-busy={loading || undefined}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        style={combinedStyles}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
