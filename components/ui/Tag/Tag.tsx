import { type HTMLAttributes, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { bdsClass } from '../../utils';
import './Tag.css';

/** Tag size variants */
export type TagSize = 'sm' | 'md' | 'lg';

/** Tag component props */
export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Tag label content */
  children: ReactNode;
  /** Size variant */
  size?: TagSize;
  /** Optional leading icon (left) */
  icon?: ReactNode;
  /** Optional trailing icon (right) */
  trailingIcon?: ReactNode;
  /** Show dismiss button and callback */
  onRemove?: () => void;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Tag — categorization label with optional icons and dismiss
 *
 * @example
 * ```tsx
 * <Tag>Category</Tag>
 * <Tag size="lg" icon={<Icon />}>With Icon</Tag>
 * <Tag onRemove={() => handleRemove()}>Removable</Tag>
 * ```
 */
export function Tag({
  children,
  size = 'md',
  icon,
  trailingIcon,
  onRemove,
  disabled = false,
  className,
  style,
  ...props
}: TagProps) {
  const classes = bdsClass(
    'bds-tag',
    `bds-tag--${size}`,
    disabled && 'bds-tag--disabled',
    className
  );

  return (
    <span className={classes} style={style} {...props}>
      {icon && <span className="bds-tag__icon">{icon}</span>}
      {children}
      {trailingIcon && <span className="bds-tag__icon">{trailingIcon}</span>}
      {onRemove && !disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="bds-tag__remove bds-tag__icon"
          aria-label="Remove"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      )}
    </span>
  );
}

export default Tag;
