import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Button, type ButtonVariant, type ButtonSize } from './Button';

/**
 * IconButton props — label is required for accessibility.
 *
 * @deprecated Prefer `<Button icon={...} label="..." />` directly. IconButton
 * is retained as a thin wrapper around the unified Button API for backward
 * compatibility and will be removed in a future major version.
 */
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** The icon to render */
  icon: ReactNode;
  /** Accessible label — required, announced by screen readers */
  label: string;
  /** Loading state — shows spinner and disables interaction */
  loading?: boolean;
  /** Selected state — modifier on top of variant */
  selected?: boolean;
}

/**
 * IconButton — icon-only button with required accessible label.
 *
 * @deprecated Use `<Button icon={...} label="..." />` directly. The unified
 * Button API enforces the same `label`-required constraint via a discriminated
 * union and supports all the same variants/sizes. IconButton currently
 * delegates to `<Button>` and will be removed in a future major version.
 *
 * @summary Deprecated icon-only button wrapper — delegates to Button
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, variant, size, loading, selected, ...rest },
  ref,
) {
  return (
    <Button
      ref={ref}
      icon={icon}
      label={label}
      variant={variant}
      size={size}
      loading={loading}
      selected={selected}
      {...rest}
    />
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;
