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
 * Base tag styles using BDS tokens
 *
 * Token reference:
 * - --_color---background--subtle (neutral gray background)
 * - --_color---text--base (text color)
 * - --_color---border--base (subtle border)
 * - --_border-radius---sm = 2px (NOT pill — per Figma)
 * - --_typography---font-family--label (label font)
 * - --_typography---label--tiny (tiny label size)
 * - --_space---tiny = 4px (vertical padding)
 * - --_space---sm = 6px (horizontal padding)
 * - --_space---gap--sm = 4px (icon gap)
 */
const baseStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--_space---gap--sm)',
  padding: 'var(--_space---tiny) var(--_space---sm)',
  fontFamily: 'var(--_typography---font-family--label)',
  fontSize: 'var(--_typography---label--tiny)',
  fontWeight: 500,
  lineHeight: 1.5,
  color: 'var(--_color---text--base)',
  backgroundColor: 'var(--_color---background--subtle)',
  border: '1px solid var(--_color---border--base)',
  borderRadius: 'var(--_border-radius---sm)',
  whiteSpace: 'nowrap',
  cursor: 'default',
  userSelect: 'none',
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
 * Tag - BDS themed tag/chip component
 *
 * Neutral gray appearance for categorization and labeling.
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
