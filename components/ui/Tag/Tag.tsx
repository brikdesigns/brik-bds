import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';

/**
 * Tag component props
 */
export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Tag label content */
  children: ReactNode;
  /** Optional leading icon */
  icon?: ReactNode;
  /** Optional trailing icon */
  trailingIcon?: ReactNode;
  /** Show dismiss button and callback */
  onRemove?: () => void;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Base tag styles
 *
 * Token reference:
 * - --_color---background--secondary (subtle gray background)
 * - --_color---text--primary (dark text on light bg)
 * - --_border-radius---sm = 2px
 * - --_typography---font-family--label (label font)
 * - --_typography---label--sm = 14px
 * - --font-line-height--150 = 150%
 * - --font-weight--bold = 700
 * - --_space---sm = 6px (vertical padding)
 * - --_space---md = 8px (horizontal padding)
 * - --_space---gap--sm = 4px (icon gap)
 */
const baseStyles: CSSProperties = {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 'var(--_space---gap--sm)',
  padding: 'var(--_space---sm) var(--_space---md)',
  fontFamily: 'var(--_typography---font-family--label)',
  fontSize: 'var(--_typography---label--sm)',
  fontWeight: 'var(--font-weight--bold)' as unknown as number,
  lineHeight: 'var(--font-line-height--150)',
  color: 'var(--_color---text--primary)',
  backgroundColor: 'var(--_color---background--secondary)',
  borderRadius: 'var(--_border-radius---sm)',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  cursor: 'default',
  userSelect: 'none',
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
  color: 'var(--_color---text--muted)',
  fontSize: '12px',
  lineHeight: 1,
  width: '14px',
  height: '14px',
  borderRadius: '2px',
};

/**
 * Tag - BDS themed tag component
 *
 * Subtle gray tag with dark text for categorization and labeling.
 * Supports leading/trailing icons and an optional dismiss button.
 * Uses CSS variables for theming. All spacing, colors, typography,
 * and border-radius reference BDS tokens.
 *
 * @example
 * ```tsx
 * <Tag>Category</Tag>
 * <Tag icon={<Icon />}>With Icon</Tag>
 * <Tag onRemove={() => handleRemove()}>Removable</Tag>
 * <Tag disabled>Disabled</Tag>
 * ```
 */
export function Tag({
  children,
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
    ...(disabled ? disabledStyles : {}),
    ...style,
  };

  return (
    <span
      className={className || undefined}
      style={combinedStyles}
      {...props}
    >
      {icon}
      {children}
      {trailingIcon}
      {onRemove && !disabled && (
        <button
          type="button"
          onClick={onRemove}
          style={removeButtonStyles}
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
}

export default Tag;
