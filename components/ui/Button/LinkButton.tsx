import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { composeButtonClasses, type ButtonVariant, type ButtonSize } from './Button';
import './Button.css';

/** LinkButton props — href is required */
export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Full width */
  fullWidth?: boolean;
  /** Link destination (required) */
  href: string;
  /** Button content */
  children: ReactNode;
  /** Optional icon before text */
  iconBefore?: ReactNode;
  /** Optional icon after text */
  iconAfter?: ReactNode;
}

/**
 * LinkButton — a link (`<a>`) styled as a button
 *
 * Use this instead of Button when the action navigates to a URL.
 * The `href` prop is required — TypeScript enforces this.
 *
 * @example
 * ```tsx
 * <LinkButton href="/docs" variant="outline">Read docs</LinkButton>
 * <LinkButton href="/signup" variant="primary" size="lg">Get started</LinkButton>
 * ```
 */
export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      href,
      children,
      iconBefore,
      iconAfter,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const classes = composeButtonClasses({ variant, size, fullWidth, className });

    return (
      <a
        ref={ref}
        href={href}
        className={classes}
        style={style}
        {...props}
      >
        <span className="bds-button__content">
          {iconBefore}
          {children}
          {iconAfter}
        </span>
      </a>
    );
  }
);

LinkButton.displayName = 'LinkButton';

export default LinkButton;
