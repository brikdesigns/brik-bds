import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

/**
 * Tag size variants
 */
export type TagSize = 'sm' | 'md' | 'lg';

/**
 * Tag component props
 */
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
 * Size-based styles from Figma spec
 *
 * Figma specs (bds-tag):
 * - sm: padding 2px, gap 0px, font-size ~10px, border-radius 2px, icon 16px
 * - md: padding 4px, gap 2px, font-size 14px, border-radius 4px, icon 16px
 * - lg: padding 6px, gap 2px, font-size 18px, border-radius 4px, icon 20px
 *
 * Token reference:
 * - --space--50 = 2px (sm padding, md/lg gap)
 * - --_space---tiny = 8px (md padding)
 * - --_space---sm = 12px (lg padding)
 * - --_typography---body--tiny ~= 10.26px (sm font)
 * - --_typography---label--sm = 14px (md font)
 * - --_typography---label--lg = 18px (lg font, mapped to font-size--200)
 * - --_border-radius---sm = 2px (sm radius)
 * - --_border-radius---md = 4px (md/lg radius)
 */
const sizeStyles: Record<TagSize, CSSProperties> = {
  sm: {
    padding: 'var(--space--50)',
    gap: 0,
    fontSize: 'var(--_typography---body--tiny)',
    borderRadius: 'var(--_border-radius---sm)',
  },
  md: {
    padding: 'var(--_space---tiny)',
    gap: 'var(--space--50)',
    fontSize: 'var(--_typography---label--sm)',
    borderRadius: 'var(--_border-radius---md)',
  },
  lg: {
    padding: 'var(--_space---sm)',
    gap: 'var(--space--50)',
    fontSize: 'var(--_typography---label--lg)',
    borderRadius: 'var(--_border-radius---md)',
  },
};

/**
 * Icon wrapper sizes from Figma spec
 * - sm/md: 16px wrapper
 * - lg: 20px wrapper
 */
const iconSizeMap: Record<TagSize, CSSProperties> = {
  sm: { width: 16, height: 16, fontSize: 'var(--_typography---body--tiny)' },
  md: { width: 16, height: 16, fontSize: 'var(--_typography---body--xs)' },
  lg: { width: 20, height: 20, fontSize: 'var(--_typography---label--md-base)' },
};

/**
 * Base tag styles
 *
 * Token reference:
 * - --_color---background--secondary (subtle gray background)
 * - --_color---text--primary (theme-aware text — dark in light mode, light in dark mode)
 * - --_typography---font-family--label (label font)
 * - --font-weight--semi-bold = 600
 *
 * Text color follows Badge pattern:
 * - text-primary for light backgrounds (provides proper contrast)
 * - text-inverse for saturated backgrounds (used in Badge for colored backgrounds)
 */
const baseStyles: CSSProperties = {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: 'var(--_typography---font-family--label)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height--100)',
  color: 'var(--_color---text--primary)',
  backgroundColor: 'var(--_color---background--secondary)',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  cursor: 'default',
  userSelect: 'none',
  overflow: 'clip',
  transition: 'background-color 0.2s',
};

const disabledStyles: CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

const removeButtonStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  color: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
};

/**
 * Tag - BDS themed tag component
 *
 * Categorization label with optional left/right icons.
 * Supports three sizes (sm, md, lg) matching the Figma spec.
 * Uses CSS variables for theming. All spacing, colors, typography,
 * and border-radius reference BDS tokens.
 *
 * @example
 * ```tsx
 * <Tag>Category</Tag>
 * <Tag size="lg" icon={<Icon />}>With Icon</Tag>
 * <Tag trailingIcon={<Icon />}>With Right Icon</Tag>
 * <Tag icon={<Icon />} trailingIcon={<Icon />}>Both Icons</Tag>
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
  className = '',
  style,
  ...props
}: TagProps) {
  const combinedStyles: CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    ...(disabled ? disabledStyles : {}),
    ...style,
  };

  const iconStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...iconSizeMap[size],
  };

  return (
    <span
      className={className || undefined}
      style={combinedStyles}
      {...props}
    >
      {icon && <span style={iconStyles}>{icon}</span>}
      {children}
      {trailingIcon && <span style={iconStyles}>{trailingIcon}</span>}
      {onRemove && !disabled && (
        <button
          type="button"
          onClick={onRemove}
          style={{ ...removeButtonStyles, ...iconSizeMap[size] }}
          aria-label="Remove"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      )}
    </span>
  );
}

export default Tag;
