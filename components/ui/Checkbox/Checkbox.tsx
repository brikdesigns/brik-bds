import { type InputHTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './Checkbox.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Checkbox — themed checkbox with label text.
 */
export function Checkbox({
  label,
  checked,
  defaultChecked,
  disabled = false,
  onChange,
  id,
  className,
  style,
  ...props
}: CheckboxProps) {
  return (
    <label
      className={bdsClass('bds-checkbox', disabled && 'bds-checkbox--disabled', className)}
      style={style}
    >
      <input
        type="checkbox"
        className="bds-checkbox__input"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
        id={id}
        {...props}
      />
      <span className="bds-checkbox__text">{label}</span>
    </label>
  );
}

export default Checkbox;
