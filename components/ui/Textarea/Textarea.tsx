import { type TextareaHTMLAttributes, type CSSProperties } from 'react';

/**
 * Textarea component props
 */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Placeholder text */
  placeholder?: string;
  /** Number of visible text rows */
  rows?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Value (controlled) */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Allow resize */
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

/**
 * Textarea styles using BDS tokens
 *
 * Token reference:
 * - --_color---border--input (input border color)
 * - --_color---background--input (input background)
 * - --_color---text--primary (text color)
 * - --_border-radius---input = 2px (input corners)
 * - --_space---input = 8px (input padding)
 * - --_typography---font-family--body (body font)
 * - --_typography---body--sm (small body text size)
 * - --_border-width---sm (border thickness)
 */
const textareaStyles: CSSProperties = {
  display: 'block',
  width: '100%',
  minWidth: '200px',
  padding: 'var(--_space---input)',
  fontFamily: 'var(--_typography---font-family--body)',
  fontSize: 'var(--_typography---body--sm)',
  lineHeight: 'var(--font-line-height--150)',
  color: 'var(--_color---text--primary)',
  backgroundColor: 'var(--_color---background--input)',
  border: 'var(--_border-width---sm) solid var(--_color---border--input)',
  borderRadius: 'var(--_border-radius---input)',
  resize: 'vertical',
};

const textareaDisabledStyles: CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
  resize: 'none',
};

const textareaFocusStyles: CSSProperties = {
  outline: '2px solid var(--_color---background--brand-primary)',
  outlineOffset: '2px',
};

/**
 * Textarea - BDS themed multi-line text input component
 *
 * Uses CSS variables for theming. Provides a styled textarea with
 * configurable rows and resize behavior. All spacing, colors, and
 * typography reference BDS tokens.
 *
 * @example
 * ```tsx
 * <Textarea placeholder="Enter your message..." rows={4} />
 * <Textarea placeholder="Comments" rows={6} resize="none" />
 * <Textarea placeholder="Description" disabled />
 * ```
 */
export function Textarea({
  placeholder,
  rows = 4,
  disabled = false,
  value,
  defaultValue,
  onChange,
  resize = 'vertical',
  id,
  className = '',
  style,
  ...props
}: TextareaProps) {
  const combinedStyles: CSSProperties = {
    ...textareaStyles,
    resize,
    ...(disabled ? textareaDisabledStyles : {}),
    ...style,
  };

  return (
    <textarea
      id={id}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      className={className || undefined}
      style={combinedStyles}
      {...props}
    />
  );
}

export default Textarea;
