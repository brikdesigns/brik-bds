'use client';

import { useState, useMemo, type CSSProperties, type ReactNode } from 'react';
import { Select, type SelectOption, type SelectSize } from '../Select/Select';
import { Tag } from '../Tag/Tag';
import { bdsClass } from '../../utils';
import './MultiSelect.css';

/**
 * MultiSelect option type
 */
export interface MultiSelectOption {
  /** Display label */
  label: string;
  /** Option value (unique identifier) */
  value: string;
  /** Optional leading icon for selected tag */
  icon?: ReactNode;
}

/**
 * MultiSelect size variants (matching Select/TextInput)
 */
export type MultiSelectSize = SelectSize;

/**
 * MultiSelect component props
 */
export interface MultiSelectProps {
  /** Available options to choose from */
  options: MultiSelectOption[];
  /** Currently selected values (controlled) */
  value?: string[];
  /** Default selected values (uncontrolled) */
  defaultValue?: string[];
  /** Change handler — called with full array of selected values */
  onChange?: (values: string[]) => void;
  /** Placeholder text for the select dropdown */
  placeholder?: string;
  /** Size variant (matching Select/TextInput) */
  size?: MultiSelectSize;
  /** Optional label text */
  label?: string;
  /** Helper text shown below the component */
  helperText?: string;
  /** Error message (shows error state when provided) */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Full width (default: true — fills container) */
  fullWidth?: boolean;
  /** Tag size for selected items (default: matches size prop) */
  tagSize?: 'sm' | 'md' | 'lg';
  /** Optional className */
  className?: string;
  /** Optional style override */
  style?: CSSProperties;
}

/**
 * MultiSelect - BDS themed multi-select component
 *
 * Composes Select (for the dropdown) + Tag (for selected items).
 * Selecting an option from the dropdown adds it as a Tag below.
 * Each Tag has a remove button to deselect.
 *
 * Uses CSS variables for theming. All spacing, colors, typography,
 * and border-radius reference BDS tokens.
 *
 * @example
 * ```tsx
 * const [selected, setSelected] = useState<string[]>([]);
 *
 * <MultiSelect
 *   label="Services"
 *   placeholder="Select services..."
 *   options={[
 *     { label: 'Brand Design', value: 'brand' },
 *     { label: 'Marketing', value: 'marketing' },
 *     { label: 'Product Design', value: 'product' },
 *   ]}
 *   value={selected}
 *   onChange={setSelected}
 * />
 * ```
 *
 * @summary Themed multi-select dropdown with chip values
 */
export function MultiSelect({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = 'Select...',
  size = 'md',
  label,
  helperText,
  error,
  disabled = false,
  fullWidth = true,
  tagSize,
  className = '',
  style,
}: MultiSelectProps) {
  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
  const selectedValues = controlledValue ?? internalValue;

  const resolvedTagSize = tagSize ?? size;

  // Filter out already-selected options from the dropdown
  const availableOptions: SelectOption[] = useMemo(() => {
    const selectedSet = new Set(selectedValues);
    return options
      .filter((opt) => !selectedSet.has(opt.value))
      .map((opt) => ({ label: opt.label, value: opt.value }));
  }, [options, selectedValues]);

  // Build a lookup map for labels
  const optionMap = useMemo(() => {
    const map = new Map<string, MultiSelectOption>();
    for (const opt of options) {
      map.set(opt.value, opt);
    }
    return map;
  }, [options]);

  function addValue(val: string) {
    if (!val || selectedValues.includes(val)) return;
    const next = [...selectedValues, val];
    if (!controlledValue) setInternalValue(next);
    onChange?.(next);
  }

  function removeValue(val: string) {
    const next = selectedValues.filter((v) => v !== val);
    if (!controlledValue) setInternalValue(next);
    onChange?.(next);
  }

  return (
    <div
      className={bdsClass(
        'bds-multi-select',
        !fullWidth && 'bds-multi-select--auto-width',
        className,
      )}
      style={style}
    >
      <Select
        label={label}
        placeholder={availableOptions.length === 0 ? 'All options selected' : placeholder}
        value=""
        onChange={(e) => {
          addValue(e.target.value);
          // Reset native select back to placeholder
          e.target.value = '';
        }}
        options={availableOptions}
        size={size}
        helperText={error ? undefined : helperText}
        error={error}
        disabled={disabled || availableOptions.length === 0}
        fullWidth={fullWidth}
      />

      {selectedValues.length > 0 && (
        <div className="bds-multi-select__tags">
          {selectedValues.map((val) => {
            const opt = optionMap.get(val);
            if (!opt) return null;
            return (
              <Tag
                key={val}
                size={resolvedTagSize}
                icon={opt.icon}
                onRemove={disabled ? undefined : () => removeValue(val)}
                disabled={disabled}
              >
                {opt.label}
              </Tag>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MultiSelect;
