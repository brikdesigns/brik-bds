import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { Button, type ButtonVariant, type ButtonSize } from './Button';

/**
 * LinkButton props — href is required.
 *
 * @deprecated Prefer `<Button href="..." />` directly. LinkButton is retained
 * as a thin wrapper around the unified Button API for backward compatibility
 * and will be removed in a future major version.
 */
export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Stretch to fill container width */
  fullWidth?: boolean;
  /** Link destination (required) */
  href: string;
  /** Button content */
  children: ReactNode;
  /** Optional leading icon */
  iconBefore?: ReactNode;
  /** Optional trailing icon */
  iconAfter?: ReactNode;
  /** Selected state — modifier on top of variant */
  selected?: boolean;
}

/**
 * LinkButton — a link (`<a>`) styled as a button.
 *
 * @deprecated Use `<Button href="..." />` directly. The unified Button API
 * renders as `<a>` when `href` is set, and `<button>` otherwise — same DOM
 * output, single import. LinkButton currently delegates to `<Button>` and
 * will be removed in a future major version.
 *
 * @summary Deprecated anchor-styled button wrapper — delegates to Button
 */
export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(function LinkButton(
  { href, children, variant, size, fullWidth, iconBefore, iconAfter, selected, ...rest },
  ref,
) {
  return (
    <Button
      ref={ref}
      href={href}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      iconBefore={iconBefore}
      iconAfter={iconAfter}
      selected={selected}
      {...rest}
    >
      {children}
    </Button>
  );
});

LinkButton.displayName = 'LinkButton';

export default LinkButton;
