import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './Button.css';

/**
 * Button variants — visual hierarchy for actions
 *
 * Brand variants (UI hierarchy):
 * - primary: Main CTA (brand fill)
 * - outline: Secondary emphasis (brand border)
 * - secondary: Tertiary/subtle (surface fill)
 * - ghost: Minimal emphasis (no background)
 * - inverse: For dark backgrounds (white fill)
 *
 * System variants (semantic actions):
 * - destructive: Destructive action (system red)
 * - positive: Confirming action (system green)
 * - selected: Active/selected state (brand primary)
 *
 * Legacy (still supported, prefer system variants):
 * - danger: Alias for destructive
 * - danger-outline: Destructive with less emphasis
 * - danger-ghost: Destructive, minimal emphasis
 */
export type ButtonVariant =
  | 'primary'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'inverse'
  | 'danger'
  | 'danger-outline'
  | 'danger-ghost'
  | 'destructive'
  | 'positive'
  | 'selected';

/** Button sizes */
export type ButtonSize = 'tiny' | 'sm' | 'md' | 'lg' | 'xl';

/** Button component props */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Full width button */
  fullWidth?: boolean;
  /** Button content */
  children: ReactNode;
  /** Optional icon before text */
  iconBefore?: ReactNode;
  /** Optional icon after text */
  iconAfter?: ReactNode;
  /** Loading state — shows spinner and disables interaction */
  loading?: boolean;
}

/**
 * Button — primary action component
 *
 * For links styled as buttons, use LinkButton.
 * For icon-only buttons, use IconButton.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg">Get started</Button>
 * <Button variant="danger" size="md">Delete account</Button>
 * <Button variant="outline" iconAfter={<ArrowRight />}>Continue</Button>
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
      className,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const classes = bdsClass(
      'bds-button',
      `bds-button--${variant}`,
      `bds-button--${size}`,
      fullWidth && 'bds-button--full-width',
      loading && 'bds-button--loading',
      className
    );

    return (
      <button
        ref={ref}
        className={classes}
        style={style}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        <span className={bdsClass('bds-button__content', loading && 'bds-button__content--hidden')}>
          {iconBefore}
          {children}
          {iconAfter}
        </span>
        {loading && (
          <span className="bds-button__spinner" role="status" aria-label="Loading">
            <span className="bds-button__spinner-icon" />
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
