import { type InputHTMLAttributes, type ReactNode, type CSSProperties } from 'react';

/**
 * Radio component props
 */
export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label text for the radio button */
  label: ReactNode;
  /** Radio group name (required for grouping) */
  name: string;
  /** Value of this radio option */
  value: string;
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
 * - --_space---gap--md = 16px (spacing between radio and label)
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
 * Radio input styles using BDS tokens
 *
 * Token reference:
 * - --_color---border--input (input border color)
 * - --_color---background--input (input background)
 * - --_color---background--brand-primary (checked background)
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
 * - --_typography---body--md (medium body text size, per Figma)
 * - --_color---text--base (text color)
 */
const textStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--body)',
  fontSize: 'var(--_typography---body--md)',
  lineHeight: 1.5,
  color: 'var(--_color---text--base)',
};

/**
 * Radio - BDS themed radio button component
 *
 * Uses CSS variables for theming. Follows semantic HTML with label
 * wrapping input element. Radio buttons with the same `name` prop
 * form a mutually exclusive group. All spacing, colors, and typography
 * reference BDS tokens.
 *
 * @example
 * ```tsx
 * <Radio name="plan" value="basic" label="Basic Plan" />
 * <Radio name="plan" value="pro" label="Pro Plan" checked />
 * <Radio name="plan" value="enterprise" label="Enterprise" disabled />
 * ```
 */
export function Radio({
  label,
  name,
  value,
  checked,
  defaultChecked,
  disabled = false,
  onChange,
  id,
  className = '',
  style,
  ...props
}: RadioProps) {
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
      className={className || undefined}
      style={combinedLabelStyles}
    >
      <input
        type="radio"
        name={name}
        value={value}
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

export default Radio;
