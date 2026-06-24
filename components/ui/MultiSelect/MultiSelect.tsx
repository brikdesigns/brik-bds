'use client';

import { useState, useMemo, type CSSProperties, type ReactNode } from 'react';
import { Icon } from '@iconify/react';
import {
  Select,
  type SelectOption,
  type SelectOptionGroup,
  type SelectSize,
} from '../Select/Select';
import { Tag } from '../Tag/Tag';
import { X } from '../../icons';
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
  /**
   * Custom node rendered as the selected chip instead of the default neutral
   * `Tag` — e.g. a line-colored `ServiceTag`. MultiSelect supplies its own
   * remove control beside the node (the node itself need not be removable).
   * The native dropdown still shows the plain `label` (a native `<option>`
   * can't render a node); use the `icon` for a dropdown glyph.
   */
  chip?: ReactNode;
}

/**
 * Grouped options — section header + its options. Mirrors `Select`'s
 * `SelectOptionGroup`; the dropdown renders one `<optgroup>` per group
 * (e.g. one group per service line).
 */
export interface MultiSelectOptionGroup {
  /** Group header label, rendered as the `<optgroup>` label. */
  label: string;
  /** Options belonging to this group. */
  options: MultiSelectOption[];
}

function isOptionGroup(
  opt: MultiSelectOption | MultiSelectOptionGroup,
): opt is MultiSelectOptionGroup {
  return 'options' in opt;
}

/**
 * MultiSelect size variants (matching Select/TextInput)
 */
export type MultiSelectSize = SelectSize;

/**
 * MultiSelect component props
 */
export interface MultiSelectProps {
  /**
   * Available options to choose from. Flat options or grouped option groups —
   * mix freely; entries with an `options` key render as a labelled `<optgroup>`
   * in the dropdown. The flat-only API stays back-compatible.
   */
  options: (MultiSelectOption | MultiSelectOptionGroup)[];
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

  // Flatten groups to a single option list for lookups + counts.
  const flatOptions = useMemo(
    () => options.flatMap((opt) => (isOptionGroup(opt) ? opt.options : [opt])),
    [options],
  );

  // Filter out already-selected options from the dropdown, preserving group
  // structure. Groups left with no remaining options are dropped entirely.
  const availableOptions: (SelectOption | SelectOptionGroup)[] = useMemo(() => {
    const selectedSet = new Set(selectedValues);
    const toSelectOption = (opt: MultiSelectOption): SelectOption => ({
      label: opt.label,
      value: opt.value,
    });
    const result: (SelectOption | SelectOptionGroup)[] = [];
    for (const entry of options) {
      if (isOptionGroup(entry)) {
        const remaining = entry.options
          .filter((opt) => !selectedSet.has(opt.value))
          .map(toSelectOption);
        if (remaining.length > 0) result.push({ label: entry.label, options: remaining });
      } else if (!selectedSet.has(entry.value)) {
        result.push(toSelectOption(entry));
      }
    }
    return result;
  }, [options, selectedValues]);

  // Count of selectable options left — drives the "all selected" empty state
  // (availableOptions may hold group wrappers, so its length isn't the count).
  const remainingCount = useMemo(() => {
    const selectedSet = new Set(selectedValues);
    return flatOptions.filter((opt) => !selectedSet.has(opt.value)).length;
  }, [flatOptions, selectedValues]);

  // Build a lookup map for labels
  const optionMap = useMemo(() => {
    const map = new Map<string, MultiSelectOption>();
    for (const opt of flatOptions) {
      map.set(opt.value, opt);
    }
    return map;
  }, [flatOptions]);

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
        placeholder={remainingCount === 0 ? 'All options selected' : placeholder}
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
        disabled={disabled || remainingCount === 0}
        fullWidth={fullWidth}
      />

      {selectedValues.length > 0 && (
        <div className="bds-multi-select__tags">
          {selectedValues.map((val) => {
            const opt = optionMap.get(val);
            if (!opt) return null;
            // Custom chip node (e.g. a line-colored ServiceTag): render it as the
            // pill and supply our own remove control alongside.
            if (opt.chip) {
              return (
                <span key={val} className="bds-multi-select__item">
                  {opt.chip}
                  {!disabled && (
                    <button
                      type="button"
                      className="bds-multi-select__remove"
                      aria-label={`Remove ${opt.label}`}
                      onClick={() => removeValue(val)}
                    >
                      <Icon icon={X} />
                    </button>
                  )}
                </span>
              );
            }
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
