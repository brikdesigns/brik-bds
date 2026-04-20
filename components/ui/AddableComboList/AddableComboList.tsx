import {
  useRef,
  useState,
  useId,
  useCallback,
  type KeyboardEvent,
} from 'react';
import { Icon } from '@iconify/react';
import { bdsClass } from '../../utils';
import { Button, type ButtonSize } from '../Button';
import { Tag, type TagSize } from '../Tag';
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
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [flashDupe, setFlashDupe] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const comboId = useId();
  const listboxId = `${comboId}-listbox`;

  const atLimit = typeof maxEntries === 'number' && values.length >= maxEntries;
  const selectedSet = new Set(values.map((v) => v.toLowerCase()));

  // Filter suggestions: case-insensitive contains, exclude already-selected
  const filtered = suggestions.filter(
    (s) =>
      !selectedSet.has(s.toLowerCase()) &&
      s.toLowerCase().includes(query.toLowerCase().trim()),
  );

  const openList = () => {
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const closeList = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const reveal = () => {
    setQuery('');
    setIsEditing(true);
    setIsOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const cancel = useCallback(() => {
    setQuery('');
    setIsEditing(false);
    closeList();
  }, []);

  const triggerDupeFlash = () => {
    setFlashDupe(true);
    setTimeout(() => setFlashDupe(false), 600);
  };

  const commit = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;

      // Strict mode: must be in suggestions list
      if (strict && !suggestions.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
        return;
      }

      // Dedupe: case-insensitive
      if (selectedSet.has(trimmed.toLowerCase())) {
        triggerDupeFlash();
        return;
      }

      onChange([...values, trimmed]);
      setQuery('');
      closeList();
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, onChange, strict, suggestions, selectedSet],
  );

  const remove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      openList();
    } else {
      closeList();
    }
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (!isOpen && filtered.length > 0) openList();
        setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, -1));
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (activeIndex >= 0 && filtered[activeIndex]) {
          commit(filtered[activeIndex]);
        } else {
          commit(query);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        if (isOpen) {
          closeList();
        } else {
          cancel();
        }
        break;
      }
      case 'Backspace': {
        if (query === '' && values.length > 0) {
          remove(values.length - 1);
        }
        break;
      }
    }
  };

  // Close dropdown on outside click
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      closeList();
      if (!query.trim()) cancel();
    }
  };

  const showEmpty = values.length === 0 && !isEditing && emptyLabel;
  const activeDescendant =
    isOpen && activeIndex >= 0 ? `${comboId}-option-${activeIndex}` : undefined;

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
              <input
                ref={inputRef}
                id={comboId}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-controls={listboxId}
                aria-activedescendant={activeDescendant}
                aria-label={label ? `Add ${label}` : 'Add item'}
                aria-autocomplete="list"
                autoComplete="off"
                className={bdsClass(
                  'bds-addable-combo-list__input',
                  `bds-addable-combo-list__input--${size}`,
                )}
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (query.trim() && filtered.length > 0) openList();
                }}
                placeholder={placeholder}
              />

              {isOpen && filtered.length > 0 && (
                <ul
                  ref={listboxRef}
                  id={listboxId}
                  role="listbox"
                  aria-label={label ? `${label} suggestions` : 'Suggestions'}
                  className="bds-addable-combo-list__dropdown"
                >
                  {filtered.map((suggestion, idx) => (
                    <li
                      key={suggestion}
                      id={`${comboId}-option-${idx}`}
                      role="option"
                      aria-selected={idx === activeIndex}
                      className={bdsClass(
                        'bds-addable-combo-list__option',
                        idx === activeIndex && 'bds-addable-combo-list__option--active',
                      )}
                      onMouseDown={(e) => {
                        // Prevent blur from firing before click
                        e.preventDefault();
                        commit(suggestion);
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
                if (activeIndex >= 0 && filtered[activeIndex]) {
                  commit(filtered[activeIndex]);
                } else {
                  commit(query);
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
          {strict && query.trim() && !suggestions.some((s) => s.toLowerCase() === query.trim().toLowerCase()) && (
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
