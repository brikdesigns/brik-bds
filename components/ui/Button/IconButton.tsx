import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './Button.css';

/** IconButton props — label is required for accessibility */
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Visual style variant */
  variant?: 'primary' | 'outline' | 'secondary' | 'ghost' | 'inverse' | 'danger' | 'danger-outline' | 'danger-ghost' | 'destructive' | 'positive' | 'selected';
  /** Size of the button */
  size?: 'tiny' | 'sm' | 'md' | 'lg' | 'xl';
  /** The icon to render (ReactNode — SVG, FontAwesome, Lucide, etc.) */
  icon: ReactNode;
  /** Accessible label — required, announced by screen readers */
  label: string;
  /** Loading state — shows spinner and disables interaction */
  loading?: boolean;
}

/**
 * IconButton — icon-only button with required accessible label
 *
 * Use this for actions represented by an icon alone (close, edit, delete, etc.).
 * The `label` prop is required and maps to `aria-label`.
 *
 * @example
 * ```tsx
 * <IconButton icon={<CloseIcon />} label="Close dialog" variant="ghost" />
 * <IconButton icon={<TrashIcon />} label="Delete item" variant="danger-ghost" />
 * <IconButton icon={<EditIcon />} label="Edit" variant="secondary" size="sm" />
 * ```
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = 'ghost',
      size = 'md',
      icon,
      label,
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
      'bds-icon-button',
      `bds-button--${variant}`,
      `bds-icon-button--${size}`,
      loading && 'bds-button--loading',
      className
    );

    return (
      <button
        ref={ref}
        className={classes}
        style={style}
        disabled={isDisabled}
        aria-label={label}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <span className="bds-button__spinner" role="status" aria-label="Loading">
            <span className="bds-button__spinner-icon" />
          </span>
        ) : (
          <span className="bds-icon-button__icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
