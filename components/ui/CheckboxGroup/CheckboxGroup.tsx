import { type ReactNode, useMemo, useState } from 'react';
import { Checkbox } from '../Checkbox';
import { bdsClass } from '../../utils';
import './CheckboxGroup.css';

export interface CheckboxGroupOption {
  /** Visible label for the option. */
  label: ReactNode;
  /** Submitted value — unique within the group. */
  value: string;
  /** Disable this option only. */
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  /** Options in render order. */
  options: CheckboxGroupOption[];
  /** Controlled selected values. Pair with `onChange`. */
  value?: string[];
  /** Initial selected values for uncontrolled use. */
  defaultValue?: string[];
  /** Called with the full next selection array whenever a box toggles. */
  onChange?: (value: string[]) => void;
  /** Accessible group label rendered as a `<legend>`. */
  legend?: ReactNode;
  /**
   * When set, renders a select-all parent checkbox above the options. It shows
   * `indeterminate` when some-but-not-all selectable options are checked.
   */
  selectAllLabel?: ReactNode;
  /** Stack direction. `vertical` (default) or `horizontal`. */
  orientation?: 'vertical' | 'horizontal';
  /** Disable every option in the group. */
  disabled?: boolean;
  /** Extra class on the `<fieldset>`. */
  className?: string;
}

/**
 * CheckboxGroup — multi-select group of `Checkbox` options in a native
 * `<fieldset>` + `<legend>`. Optionally renders a select-all parent that
 * reflects `indeterminate` when the selection is partial. `Checkbox` stays the
 * standalone item; orientation is a prop, not a per-orientation story (ADR-010
 * Rule 5).
 *
 * @example
 * ```tsx
 * <CheckboxGroup
 *   legend="Notifications"
 *   selectAllLabel="All notifications"
 *   value={channels}
 *   onChange={setChannels}
 *   options={[
 *     { label: 'Email', value: 'email' },
 *     { label: 'Push', value: 'push' },
 *   ]}
 * />
 * ```
 *
 * @summary Multi-select checkbox group with select-all
 */
export function CheckboxGroup({
  options,
  value,
  defaultValue,
  onChange,
  legend,
  selectAllLabel,
  orientation = 'vertical',
  disabled = false,
  className,
}: CheckboxGroupProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
  const selected = isControlled ? value : internalValue;

  const setSelected = (next: string[]) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  const toggle = (optionValue: string) => {
    setSelected(
      selected.includes(optionValue)
        ? selected.filter((v) => v !== optionValue)
        : [...selected, optionValue],
    );
  };

  const selectableValues = useMemo(
    () => options.filter((o) => !o.disabled).map((o) => o.value),
    [options],
  );
  const allSelected =
    selectableValues.length > 0 && selectableValues.every((v) => selected.includes(v));
  const someSelected = selectableValues.some((v) => selected.includes(v));
  const indeterminate = someSelected && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      const selectable = new Set(selectableValues);
      setSelected(selected.filter((v) => !selectable.has(v)));
    } else {
      setSelected(Array.from(new Set([...selected, ...selectableValues])));
    }
  };

  return (
    <fieldset
      className={bdsClass('bds-checkbox-group', disabled && 'bds-checkbox-group--disabled', className)}
      disabled={disabled}
    >
      {legend && <legend className="bds-checkbox-group__legend">{legend}</legend>}
      {selectAllLabel && (
        <div className="bds-checkbox-group__select-all">
          <Checkbox
            label={selectAllLabel}
            checked={allSelected}
            indeterminate={indeterminate}
            onChange={toggleAll}
          />
        </div>
      )}
      <div
        className={bdsClass(
          'bds-checkbox-group__options',
          `bds-checkbox-group__options--orientation-${orientation}`,
        )}
      >
        {options.map((option) => (
          <Checkbox
            key={option.value}
            value={option.value}
            label={option.label}
            checked={selected.includes(option.value)}
            disabled={disabled || option.disabled}
            onChange={() => toggle(option.value)}
          />
        ))}
      </div>
    </fieldset>
  );
}

export default CheckboxGroup;
