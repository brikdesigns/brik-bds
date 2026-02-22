import { type InputHTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

/**
 * Checkbox component props
 */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label text for the checkbox */
  label: ReactNode;
  /** Checked state (controlled) */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Label wrapper styles using BDS tokens
 *
 * Token reference:
 * - --_space---gap--md = 8px (spacing between checkbox and label)
 */
const labelStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--_space---gap--md)',
  cursor: 'pointer',
  userSelect: 'none',
};

const labelDisabledStyles: CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

/**
 * Checkbox input styles using BDS tokens
 *
 * Token reference:
 * - --_color---border--input (input border color)
 * - --_color---background--input (input background)
 * - --_color---background--brand-primary (checked background)
 * - --_border-radius---sm = 2px (checkbox corners)
 * - --_border-width---sm (border thickness)
 */
const inputStyles: CSSProperties = {
  width: '16px',
  height: '16px',
  margin: 0,
  cursor: 'pointer',
  flexShrink: 0,
  accentColor: 'var(--_color---background--brand-primary)',
};

const inputDisabledStyles: CSSProperties = {
  cursor: 'not-allowed',
};

/**
 * Label text styles using BDS tokens
 *
 * Token reference:
 * - --_typography---font-family--body (body font)
 * - --_typography---body--md-base (medium body text size)
 * - --_color---text--primary (text color)
 */
const textStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--body)',
  fontSize: 'var(--_typography---body--md-base)',
  lineHeight: 'var(--font-line-height--150)',
  color: 'var(--_color---text--primary)',
  textTransform: 'capitalize' as const,
};

/**
 * Checkbox - BDS themed checkbox component
 *
 * Uses CSS variables for theming. Follows semantic HTML with label
 * wrapping input element. All spacing, colors, and typography reference BDS tokens.
 *
 * @example
 * ```tsx
 * <Checkbox label="Accept terms" />
 * <Checkbox label="Subscribe to newsletter" checked={isChecked} onChange={handleChange} />
 * <Checkbox label="Disabled option" disabled />
 * ```
 */
export function Checkbox({
  label,
  checked,
  defaultChecked,
  disabled = false,
  onChange,
  id,
  className = '',
  style,
  ...props
}: CheckboxProps) {
  const combinedLabelStyles: CSSProperties = {
    ...labelStyles,
    ...(disabled ? labelDisabledStyles : {}),
    ...style,
  };

  const combinedInputStyles: CSSProperties = {
    ...inputStyles,
    ...(disabled ? inputDisabledStyles : {}),
  };

  return (
    <label
      className={bdsClass('bds-checkbox', className)}
      style={combinedLabelStyles}
    >
      <input
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
        id={id}
        style={combinedInputStyles}
        {...props}
      />
      <span style={textStyles}>{label}</span>
    </label>
  );
}

export default Checkbox;
