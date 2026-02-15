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
 * Base tag styles matching Webflow .tag class
 *
 * Token reference (from brik-bds.webflow.css .tag):
 * - --_color---background--brand-primary (brand-colored background)
 * - --_color---text--inverse (white text)
 * - --_border-radius---sm = 2px
 * - --_typography---font-family--label (label font)
 * - --_typography---label--sm = 14px
 * - --font-line-height--150 = 150%
 * - --font-weight--bold = 700
 * - --_space---md = 8px (top/right/bottom padding)
 * - --_space---lg = 16px (left padding)
 * - --_space---gap--md = 8px (icon gap)
 */
const baseStyles: CSSProperties = {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 'var(--_space---gap--md)',
  padding: 'var(--_space---md) var(--_space---md) var(--_space---md) var(--_space---lg)',
  fontFamily: 'var(--_typography---font-family--label)',
  fontSize: 'var(--_typography---label--sm)',
  fontWeight: 'var(--font-weight--bold)' as unknown as number,
  lineHeight: 'var(--font-line-height--150)',
  color: 'var(--_color---text--inverse)',
  backgroundColor: 'var(--_color---background--brand-primary)',
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
  color: 'var(--_color---text--inverse)',
  fontSize: '12px',
  lineHeight: 1,
  width: '14px',
  height: '14px',
  borderRadius: '2px',
};

/**
 * Tag - BDS themed tag component
 *
 * Brand-colored tag with white text, matching the Webflow .tag class.
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
