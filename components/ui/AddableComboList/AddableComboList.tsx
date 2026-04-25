import {
  useRef,
  useState,
  useCallback,
} from 'react';
import { Icon } from '@iconify/react';
import { bdsClass } from '../../utils';
import { Button, type ButtonSize } from '../Button';
import { Tag, type TagSize } from '../Tag';
import { TextInput, type TextInputSize } from '../TextInput';
import { useSuggestionFilter } from '../shared/useSuggestionFilter';
import './AddableComboList.css';

export type AddableComboListSize = 'sm' | 'md' | 'lg';

export interface AddableComboListProps {
  /** Current selected values (tags rendered). */
  values: string[];
  /** Called with the next values when user adds or removes. */
  onChange: (next: string[]) => void;
  /** Suggestion set. Filtered by the typed query; free-form entries still allowed. */
  suggestions: string[];
  /** Input placeholder. */
  placeholder?: string;
  /** Label shown on the add button. Default "Add". */
  addLabel?: string;
  /** Accessible label for the remove button on each tag. Default "Remove". */
  removeLabel?: string;
  /** Shown when values is empty. Default "Nothing added yet." */
  emptyLabel?: string;
  /** Shown below the list when provided — e.g. "CRM, billing, scheduling…". */
  helperText?: string;
  /** When true, renders values as read-only chips with no input. */
  disabled?: boolean;
  /** Max entries allowed. When reached, input is disabled. */
  maxEntries?: number;
  /** When true, user can only pick from suggestions (rejects free-form). Default false. */
  strict?: boolean;
  /** Optional field label */
  label?: string;
  /** Size for input, button, and tags */
  size?: AddableComboListSize;
  /** Additional className applied to root */
  className?: string;
}

const TAG_SIZE: Record<AddableComboListSize, TagSize> = { sm: 'sm', md: 'md', lg: 'md' };
const BUTTON_SIZE: Record<AddableComboListSize, ButtonSize> = { sm: 'sm', md: 'md', lg: 'lg' };
const INPUT_SIZE: Record<AddableComboListSize, TextInputSize> = { sm: 'sm', md: 'md', lg: 'lg' };

/**
 * AddableComboList — suggestion-driven combobox for tag-style multi-select
 * with free-form fallback.
 *
 * Typing filters the suggestion list (case-insensitive contains match). Users
 * can pick from suggestions via keyboard or click, or type a free-form value
 * and press Enter (unless `strict` is true). Already-selected suggestions are
 * hidden from the dropdown. Duplicates are rejected with a brief visual flash.
 *
 * Vocabulary-agnostic — the portal wires in BCS getters via the `suggestions`
 * prop; the component does not import from content-system.
 *
 * @example
 * ```tsx
 * <AddableComboList
 *   label="Services Offered"
 *   values={services}
 *   onChange={setServices}
 *   suggestions={getIndustryServices(industrySlug)}
 *   placeholder="Search or add a service…"
 * />
 * ```
 */
export function AddableComboList({
  values,
  onChange,
  suggestions,
  placeholder,
  addLabel = 'Add',
  removeLabel = 'Remove',
  emptyLabel = 'Nothing added yet.',
  helperText,
  disabled = false,
  maxEntries,
  strict = false,
  label,
  size = 'md',
  className,
}: AddableComboListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [flashDupe, setFlashDupe] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const atLimit = typeof maxEntries === 'number' && values.length >= maxEntries;

  const triggerDupeFlash = useCallback(() => {
    setFlashDupe(true);
    setTimeout(() => setFlashDupe(false), 600);
  }, []);

  const cancel = useCallback(() => {
    setIsEditing(false);
    combo.reset();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const combo = useSuggestionFilter({
    suggestions,
    selectedValues: values,
    strict,
    onCommit: (value) => {
      onChange([...values, value]);
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    onCancel: cancel,
    onDuplicate: triggerDupeFlash,
    onBackspaceEmpty: () => {
      if (values.length > 0) onChange(values.slice(0, -1));
    },
  });

  const reveal = () => {
    combo.reset();
    setIsEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // Close dropdown on outside click
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      combo.closeList();
      if (!combo.query.trim()) cancel();
    }
  };

  const showEmpty = values.length === 0 && !isEditing && emptyLabel;

  return (
    <div className={bdsClass('bds-addable-combo-list', className)}>
      {label && <span className="bds-addable-combo-list__label">{label}</span>}

      {values.length > 0 && (
        <div
          className={bdsClass(
            'bds-addable-combo-list__tags',
            flashDupe && 'bds-addable-combo-list__tags--flash',
          )}
          role="list"
          aria-label={label ? `${label} values` : 'Selected values'}
        >
          {values.map((value, index) => (
            <Tag
              key={`${index}-${value}`}
              size={TAG_SIZE[size]}
              onRemove={disabled ? undefined : () => remove(index)}
              role="listitem"
              aria-label={`${value}${!disabled ? `, ${removeLabel}` : ''}`}
            >
              {value}
            </Tag>
          ))}
        </div>
      )}

      {showEmpty && (
        <span className="bds-addable-combo-list__empty">{emptyLabel}</span>
      )}

      {!disabled && isEditing && !atLimit && (
        <div
          ref={containerRef}
          className="bds-addable-combo-list__combobox"
          onBlur={handleBlur}
        >
          <div className="bds-addable-combo-list__input-row">
            <div className="bds-addable-combo-list__input-wrap" style={{ position: 'relative' }}>
              <TextInput
                ref={inputRef}
                id={combo.comboId}
                size={INPUT_SIZE[size]}
                role="combobox"
                aria-expanded={combo.isOpen}
                aria-haspopup="listbox"
                aria-controls={combo.listboxId}
                aria-activedescendant={combo.activeDescendant}
                aria-label={label ? `Add ${label}` : 'Add item'}
                aria-autocomplete="list"
                autoComplete="off"
                value={combo.query}
                onChange={combo.handleInputChange}
                onKeyDown={combo.handleKeyDown}
                onFocus={() => {
                  if (combo.query.trim() && combo.filtered.length > 0) combo.openList();
                }}
                placeholder={placeholder}
                fullWidth
              />

              {combo.isOpen && combo.filtered.length > 0 && (
                <ul
                  ref={listboxRef}
                  id={combo.listboxId}
                  role="listbox"
                  aria-label={label ? `${label} suggestions` : 'Suggestions'}
                  className="bds-addable-combo-list__dropdown"
                >
                  {combo.filtered.map((suggestion, idx) => (
                    <li
                      key={suggestion}
                      id={`${combo.comboId}-option-${idx}`}
                      role="option"
                      aria-selected={idx === combo.activeIndex}
                      className={bdsClass(
                        'bds-addable-combo-list__option',
                        idx === combo.activeIndex && 'bds-addable-combo-list__option--active',
                      )}
                      onMouseDown={(e) => {
                        // Prevent blur from firing before click
                        e.preventDefault();
                        combo.commitValue(suggestion);
                      }}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button
              size={BUTTON_SIZE[size]}
              variant="primary"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (combo.activeIndex >= 0 && combo.filtered[combo.activeIndex]) {
                  combo.commitValue(combo.filtered[combo.activeIndex]);
                } else {
                  combo.commitValue(combo.query);
                }
              }}
              aria-label={addLabel}
            >
              {addLabel}
            </Button>
            <Button
              size={BUTTON_SIZE[size]}
              variant="ghost"
              onMouseDown={(e) => e.preventDefault()}
              onClick={cancel}
            >
              Cancel
            </Button>
          </div>
          {strict && combo.query.trim() && !suggestions.some((s) => s.toLowerCase() === combo.query.trim().toLowerCase()) && (
            <span className="bds-addable-combo-list__strict-hint" aria-live="polite">
              Only suggestions can be added in strict mode.
            </span>
          )}
        </div>
      )}

      {!disabled && !isEditing && !atLimit && (
        <div>
          <Button
            size={BUTTON_SIZE[size]}
            variant="outline"
            onClick={reveal}
          >
            <Icon icon="ph:plus" />
            {addLabel}
          </Button>
        </div>
      )}

      {helperText && (
        <span className="bds-addable-combo-list__helper">{helperText}</span>
      )}
    </div>
  );
}

export default AddableComboList;
