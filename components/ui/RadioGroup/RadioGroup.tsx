import { type ReactNode, useId, useState } from 'react';
import { Radio } from '../Radio';
import { bdsClass } from '../../utils';
import './RadioGroup.css';

export interface RadioGroupOption {
  /** Visible label for the option. */
  label: ReactNode;
  /** Submitted value — unique within the group. */
  value: string;
  /** Disable this option only. */
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Options in render order. */
  options: RadioGroupOption[];
  /** Controlled selected value. Pair with `onChange`. */
  value?: string;
  /** Initial selected value for uncontrolled use. */
  defaultValue?: string;
  /** Called with the newly selected value. */
  onChange?: (value: string) => void;
  /**
   * Shared `name` for the native radios — the browser uses it to enforce
   * single-select exclusivity + roving arrow-key focus. Auto-generated when omitted.
   */
  name?: string;
  /** Accessible group label rendered as a `<legend>`. Omit to label via `aria-label`. */
  legend?: ReactNode;
  /** Stack direction. `vertical` (default) or `horizontal`. */
  orientation?: 'vertical' | 'horizontal';
  /** Disable every option in the group. */
  disabled?: boolean;
  /** Extra class on the `<fieldset>`. */
  className?: string;
  /** Accessible name when no `legend` is given. */
  'aria-label'?: string;
}

/**
 * RadioGroup — single-select group of `Radio` options in a native `<fieldset>`.
 *
 * The wrapper owns the group's shared `name`, controlled `value`, and
 * `orientation`; the browser owns exclusivity + roving arrow-key focus because
 * the children are native radios sharing that `name` (no JS keyboard handling
 * needed). `Radio` remains the standalone item. Orientation is a prop, not a
 * per-orientation story (ADR-010 Rule 5).
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   legend="Plan"
 *   value={plan}
 *   onChange={setPlan}
 *   options={[
 *     { label: 'Basic', value: 'basic' },
 *     { label: 'Pro', value: 'pro' },
 *   ]}
 * />
 * ```
 *
 * @summary Single-select radio group (native fieldset)
 */
export function RadioGroup({
  options,
  value,
  defaultValue,
  onChange,
  name,
  legend,
  orientation = 'vertical',
  disabled = false,
  className,
  'aria-label': ariaLabel,
}: RadioGroupProps) {
  const autoName = useId();
  const groupName = name ?? autoName;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selected = isControlled ? value : internalValue;

  const select = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  return (
    <fieldset
      className={bdsClass('bds-radio-group', disabled && 'bds-radio-group--disabled', className)}
      role="radiogroup"
      aria-label={legend ? undefined : ariaLabel}
      disabled={disabled}
    >
      {legend && <legend className="bds-radio-group__legend">{legend}</legend>}
      <div className={bdsClass('bds-radio-group__options', `bds-radio-group__options--orientation-${orientation}`)}>
        {options.map((option) => (
          <Radio
            key={option.value}
            name={groupName}
            value={option.value}
            label={option.label}
            checked={selected === option.value}
            disabled={disabled || option.disabled}
            onChange={() => select(option.value)}
          />
        ))}
      </div>
    </fieldset>
  );
}

export default RadioGroup;
