import { type InputHTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './Radio.css';

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
 *
 * @summary Themed radio button (single-select group member)
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
  return (
    <label
      className={bdsClass('bds-radio', disabled && 'bds-radio--disabled', className)}
      style={style}
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
        className="bds-radio__input"
        {...props}
      />
      <span className="bds-radio__indicator" aria-hidden />
      <span className="bds-radio__text">{label}</span>
    </label>
  );
}

export default Radio;
