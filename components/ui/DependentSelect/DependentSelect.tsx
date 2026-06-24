'use client';

import { useMemo, type CSSProperties } from 'react';
import {
  Select,
  type SelectOption,
  type SelectOptionGroup,
  type SelectSize,
} from '../Select/Select';
import { MultiSelect, type MultiSelectOption } from '../MultiSelect/MultiSelect';
import { bdsClass } from '../../utils';
import './DependentSelect.css';

/**
 * A child option. Beyond the usual `label`/`value`/`icon`, each option carries
 * the value of the parent it belongs to under the field named by
 * `child.parentKey` (e.g. `service_line_id`).
 */
export type DependentChildOption = MultiSelectOption & Record<string, unknown>;

/**
 * Parent (driving) select config. The parent should be **controlled**
 * (`value` + `onChange`) — DependentSelect filters the child's options by the
 * current parent `value`, so it needs to observe it.
 */
export interface DependentSelectParentConfig {
  /** Visible label above the parent select. */
  label?: string;
  /** Parent options — flat or grouped (`SelectOptionGroup`). */
  options: (SelectOption | SelectOptionGroup)[];
  /** Controlled parent value. */
  value?: string;
  /** Uncontrolled initial value. Note: filtering tracks `value`, so pair with `onChange` for the cascade to react. */
  defaultValue?: string;
  /** Placeholder shown when no parent is selected. */
  placeholder?: string;
  /** Called with the new parent value on change. */
  onChange?: (value: string) => void;
}

interface DependentSelectChildBase {
  /** Visible label above the child select. */
  label?: string;
  /** Full child option set (all parents). DependentSelect filters the *visible* options by the parent value. */
  options: DependentChildOption[];
  /** Field name on each child option holding the parent value it belongs to (e.g. `service_line_id`). */
  parentKey: string;
  /** Placeholder shown in the child select. */
  placeholder?: string;
  /** Helper text below the child select. */
  helperText?: string;
}

interface DependentSelectChildSingleConfig extends DependentSelectChildBase {
  /** Single-select child (default). */
  multiple?: false;
  /** Controlled child value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Called with the new child value on change. */
  onChange?: (value: string) => void;
}

interface DependentSelectChildMultiConfig extends DependentSelectChildBase {
  /** Multi-select child. */
  multiple: true;
  /** Controlled child values. */
  value?: string[];
  /** Uncontrolled initial values. */
  defaultValue?: string[];
  /** Called with the full updated array of child values on change. */
  onChange?: (values: string[]) => void;
}

/** Child (dependent) select config — single or multi. */
export type DependentSelectChildConfig =
  | DependentSelectChildSingleConfig
  | DependentSelectChildMultiConfig;

export interface DependentSelectProps {
  /** Parent (driving) select. */
  parent: DependentSelectParentConfig;
  /** Child (dependent) select, filtered by the parent's value. */
  child: DependentSelectChildConfig;
  /** Size applied to both selects. Default `md`. */
  size?: SelectSize;
  /** Disable both selects. */
  disabled?: boolean;
  /** Optional className on the wrapper. */
  className?: string;
  /** Optional style override on the wrapper. */
  style?: CSSProperties;
}

function selectedValuesOf(child: DependentSelectChildConfig): string[] {
  if (child.multiple) return child.value ?? child.defaultValue ?? [];
  const single = child.value ?? child.defaultValue;
  return single ? [single] : [];
}

/**
 * DependentSelect — a parent select whose value filters a child select's
 * visible options, with the child's committed selection kept cumulative across
 * parent changes (the parent never clears the child).
 *
 * The child receives its full option set; DependentSelect shows only options
 * matching the current parent in the dropdown, but folds already-selected
 * options (from any parent) back in so their chips/labels still resolve.
 *
 * @example
 * ```tsx
 * <DependentSelect
 *   parent={{ label: 'Service line', options: lines, value: lineId, onChange: setLineId }}
 *   child={{
 *     label: 'Services',
 *     options: allServices,         // every service, each tagged with service_line_id
 *     parentKey: 'service_line_id',
 *     value: serviceIds,
 *     onChange: setServiceIds,
 *     multiple: true,
 *   }}
 * />
 * ```
 *
 * @summary Cascading parent/child selects, cumulative child selection
 */
export function DependentSelect({
  parent,
  child,
  size = 'md',
  disabled = false,
  className,
  style,
}: DependentSelectProps) {
  const parentValue = parent.value;
  const { options: childOptions, parentKey } = child;

  // Options visible for the current parent — all options when no parent is set.
  const visibleChildOptions = useMemo(() => {
    if (!parentValue) return childOptions;
    return childOptions.filter((opt) => String(opt[parentKey] ?? '') === String(parentValue));
  }, [childOptions, parentKey, parentValue]);

  // Fold already-selected options (from any parent) back in so their chip/label
  // still resolves — the committed selection is cumulative, never filtered.
  // Selected options are excluded from the child's dropdown by Select/MultiSelect,
  // so this only affects label resolution, not the available list.
  const controlOptions = useMemo(() => {
    const selected = new Set(selectedValuesOf(child));
    const visibleValues = new Set(visibleChildOptions.map((opt) => opt.value));
    const extras = childOptions.filter(
      (opt) => selected.has(opt.value) && !visibleValues.has(opt.value),
    );
    return [...visibleChildOptions, ...extras];
  }, [child, childOptions, visibleChildOptions]);

  return (
    <div className={bdsClass('bds-dependent-select', className)} style={style}>
      <Select
        label={parent.label}
        options={parent.options}
        value={parent.value}
        defaultValue={parent.defaultValue}
        placeholder={parent.placeholder}
        onChange={(e) => parent.onChange?.(e.target.value)}
        size={size}
        disabled={disabled}
      />
      {child.multiple ? (
        <MultiSelect
          label={child.label}
          options={controlOptions}
          value={child.value}
          defaultValue={child.defaultValue}
          onChange={child.onChange}
          placeholder={child.placeholder}
          helperText={child.helperText}
          size={size}
          disabled={disabled}
        />
      ) : (
        <Select
          label={child.label}
          options={controlOptions}
          value={child.value}
          defaultValue={child.defaultValue}
          placeholder={child.placeholder}
          onChange={(e) => child.onChange?.(e.target.value)}
          size={size}
          disabled={disabled}
        />
      )}
    </div>
  );
}

export default DependentSelect;
