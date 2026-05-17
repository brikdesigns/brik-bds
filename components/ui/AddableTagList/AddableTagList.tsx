import { useRef, useState, useCallback, type KeyboardEvent } from 'react';
import { Icon } from '@iconify/react';
import { bdsClass } from '../../utils';
import { Button, type ButtonSize } from '../Button';
import { Tag, type TagSize } from '../Tag';
import { TextInput, type TextInputSize } from '../TextInput';
import { useSuggestionFilter } from '../shared/useSuggestionFilter';
import './AddableTagList.css';

export type AddableTagListSize = 'sm' | 'md' | 'lg';

export interface AddableTagListProps {
  /** Current list of tag values. */
  values: string[];
  /** Called with the updated values when user adds or removes a tag. */
  onChange: (next: string[]) => void;
  /**
   * Optional suggestion set. When provided the component renders a combobox —
   * typing filters the list, Enter commits the highlighted suggestion or a
   * free-form value. When omitted the component is a plain text input.
   */
  suggestions?: string[];
  /**
   * When true, only values present in `suggestions` can be added (free-form
   * entries are rejected). Only meaningful when `suggestions` is provided.
   * Default false.
   */
  strict?: boolean;
  /** Optional field label. */
  label?: string;
  /** Helper text below the list. */
  helperText?: string;
  /** Placeholder shown in the reveal input. */
  placeholder?: string;
  /** Text on the reveal button and accessible add label. Default "Add". */
  addLabel?: string;
  /** Accessible label for the remove button on each tag. Default "Remove". */
  removeLabel?: string;
  /** Text shown when `values` is empty and input is not revealed. */
  emptyLabel?: string;
  /** Size for input, button, and tags. Default "md". */
  size?: AddableTagListSize;
  /** Renders tags as read-only chips with no input controls. */
  disabled?: boolean;
  /** Maximum number of entries. Input is hidden when reached. */
  maxItems?: number;
  /** Allow duplicate values (case-insensitive). Default false. */
  allowDuplicates?: boolean;
  /** Additional className applied to root. */
  className?: string;
}

const TAG_SIZE: Record<AddableTagListSize, TagSize> = { sm: 'sm', md: 'md', lg: 'md' };
const BUTTON_SIZE: Record<AddableTagListSize, ButtonSize> = { sm: 'sm', md: 'md', lg: 'lg' };
const INPUT_SIZE: Record<AddableTagListSize, TextInputSize> = { sm: 'sm', md: 'md', lg: 'lg' };

/**
 * AddableTagList — reveal-on-click list of removable text tags.
 *
 * Without `suggestions`: plain text input, Enter commits.
 * With `suggestions`: combobox — typing filters the list, arbitrary free-form
 * entries are also accepted unless `strict` is true.
 *
 * Replaces `AddableTextList` (plain) and `AddableComboList` (suggestion-backed)
 * with a single API. See ADR-003.
 *
 * @example
 * ```tsx
 * // Plain
 * <AddableTagList label="Anti-messages" values={msgs} onChange={setMsgs} />
 *
 * // Suggestion-backed
 * <AddableTagList
 *   label="Services Offered"
 *   values={services}
 *   onChange={setServices}
 *   suggestions={getIndustryServices(industrySlug)}
 *   placeholder="Search or add a service…"
 * />
 * ```
 *
 * @summary Reveal-on-click list of text tags with optional suggestion combobox
 */
export function AddableTagList({
  values,
  onChange,
  suggestions,
  strict = false,
  label,
  helperText,
  placeholder,
  addLabel = 'Add',
  removeLabel = 'Remove',
  emptyLabel,
  size = 'md',
  disabled = false,
  maxItems,
  allowDuplicates = false,
  className,
}: AddableTagListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [flashDupe, setFlashDupe] = useState(false);
  const isComboMode = suggestions !== undefined;

  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const atLimit = typeof maxItems === 'number' && values.length >= maxItems;

  const triggerDupeFlash = useCallback(() => {
    setFlashDupe(true);
    setTimeout(() => setFlashDupe(false), 600);
  }, []);

  const remove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  // Always call the hook — plain mode gets suggestions=[] so filtered is always
  // empty and the dropdown never renders, giving plain Enter-to-commit UX.
  const combo = useSuggestionFilter({
    suggestions: suggestions ?? [],
    // Bypass duplicate check inside the hook when allowDuplicates=true
    selectedValues: allowDuplicates ? [] : values,
    strict: isComboMode ? strict : false,
    onCommit: (value) => {
      onChange([...values, value]);
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    onCancel: () => {
      setIsEditing(false);
    },
    onDuplicate: isComboMode ? triggerDupeFlash : undefined,
    onBackspaceEmpty: () => {
      if (values.length > 0) onChange(values.slice(0, -1));
    },
  });

  const reveal = () => {
    combo.reset();
    setIsEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      combo.closeList();
      if (!combo.query.trim()) {
        setIsEditing(false);
        combo.reset();
      }
    }
  };

  const handlePlainKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      combo.commitValue(combo.query);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
      combo.reset();
    } else if (e.key === 'Backspace' && combo.query.length === 0) {
      if (values.length > 0) onChange(values.slice(0, -1));
    }
  };

  const showEmpty = values.length === 0 && !isEditing && emptyLabel;

  return (
    <div className={bdsClass('bds-addable-tag-list', className)}>
      {label && <span className="bds-addable-tag-list__label">{label}</span>}

      {values.length > 0 && (
        <div
          className={bdsClass(
            'bds-addable-tag-list__tags',
            isComboMode && flashDupe && 'bds-addable-tag-list__tags--flash',
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
        <span className="bds-addable-tag-list__empty">{emptyLabel}</span>
      )}

      {!disabled && isEditing && !atLimit && (
        <div
          ref={isComboMode ? containerRef : undefined}
          className="bds-addable-tag-list__combobox"
          onBlur={isComboMode ? handleBlur : undefined}
        >
          <div className="bds-addable-tag-list__input-row">
            <div className="bds-addable-tag-list__input-wrap" style={{ position: 'relative' }}>
              <TextInput
                ref={inputRef}
                {...(isComboMode ? {
                  id: combo.comboId,
                  role: 'combobox' as const,
                  'aria-expanded': combo.isOpen,
                  'aria-haspopup': 'listbox' as const,
                  'aria-controls': combo.listboxId,
                  'aria-activedescendant': combo.activeDescendant,
                  'aria-autocomplete': 'list' as const,
                  autoComplete: 'off',
                  onFocus: () => {
                    if (combo.query.trim() && combo.filtered.length > 0) combo.openList();
                  },
                } : {})}
                size={INPUT_SIZE[size]}
                value={combo.query}
                onChange={combo.handleInputChange}
                onKeyDown={isComboMode ? combo.handleKeyDown : handlePlainKeyDown}
                onBlur={!isComboMode ? () => {
                  if (!combo.query.trim()) {
                    setIsEditing(false);
                    combo.reset();
                  }
                } : undefined}
                placeholder={placeholder}
                aria-label={label ? `Add ${label}` : 'Add item'}
                fullWidth
              />

              {isComboMode && combo.isOpen && combo.filtered.length > 0 && (
                <ul
                  ref={listboxRef}
                  id={combo.listboxId}
                  role="listbox"
                  aria-label={label ? `${label} suggestions` : 'Suggestions'}
                  className="bds-addable-tag-list__dropdown"
                >
                  {combo.filtered.map((suggestion, idx) => (
                    <li
                      key={suggestion}
                      id={`${combo.comboId}-option-${idx}`}
                      role="option"
                      aria-selected={idx === combo.activeIndex}
                      className={bdsClass(
                        'bds-addable-tag-list__option',
                        idx === combo.activeIndex && 'bds-addable-tag-list__option--active',
                      )}
                      onMouseDown={(e) => {
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
                if (isComboMode && combo.activeIndex >= 0 && combo.filtered[combo.activeIndex]) {
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
              onClick={() => {
                setIsEditing(false);
                combo.reset();
              }}
            >
              Cancel
            </Button>
          </div>

          {isComboMode && strict && combo.query.trim() &&
            !suggestions.some((s) => s.toLowerCase() === combo.query.trim().toLowerCase()) && (
            <span className="bds-addable-tag-list__strict-hint" aria-live="polite">
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
        <span className="bds-addable-tag-list__helper">{helperText}</span>
      )}
    </div>
  );
}

export default AddableTagList;
