import { useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '@iconify/react';
import { bdsClass } from '../../utils';
import { Button, type ButtonSize } from '../Button';
import { TextInput, type TextInputSize } from '../TextInput';
import { TextArea, type TextAreaSize } from '../TextArea';
import { useSuggestionFilter } from '../shared/useSuggestionFilter';
import './AddableEntryList.css';

export type AddableEntryListSize = 'sm' | 'md' | 'lg';

/**
 * Generic entry shape. Consumers map their domain types
 * (competitor URL + notes, reference site + note, line item + description, etc.)
 * to / from this shape at the boundary.
 */
export interface AddableEntry {
  primary: string;
  secondary: string;
}

export interface AddableEntryListProps {
  /** Current list of entries */
  entries: AddableEntry[];
  /** Called when entries change (add / remove) */
  onChange: (next: AddableEntry[]) => void;
  /** Optional field label */
  label?: string;
  /** Helper text below the list */
  helperText?: string;
  /** Label shown above the primary input (defaults to none) */
  primaryLabel?: string;
  /** Label shown above the secondary textarea (defaults to none) */
  secondaryLabel?: string;
  /** Placeholder for the primary input */
  primaryPlaceholder?: string;
  /** Placeholder for the secondary textarea */
  secondaryPlaceholder?: string;
  /** Text on the reveal button */
  addLabel?: string;
  /** Accessible label for the remove button on each entry */
  removeLabel?: string;
  /** Text shown when list is empty (and form is not revealed) */
  emptyLabel?: string;
  /** Size for input, textarea, and buttons */
  size?: AddableEntryListSize;
  /** Hide all controls */
  disabled?: boolean;
  /** Maximum number of entries */
  maxItems?: number;
  /** Number of rows on the secondary textarea */
  secondaryRows?: number;
  /** Additional className applied to root */
  className?: string;
  /** Block duplicates by primary value (case-insensitive) */
  allowDuplicates?: boolean;
  /**
   * Suggestion set for the primary (name) field. Filtered by typed query;
   * free-form entries still allowed. When omitted, primary is a plain text input.
   */
  primarySuggestions?: string[];
  /**
   * When true, primary field rejects free-form entries outside primarySuggestions.
   * Default false. Has no effect when primarySuggestions is omitted.
   */
  primaryStrict?: boolean;
}

const BUTTON_SIZE: Record<AddableEntryListSize, ButtonSize> = { sm: 'sm', md: 'md', lg: 'lg' };
const INPUT_SIZE: Record<AddableEntryListSize, TextInputSize> = { sm: 'sm', md: 'md', lg: 'lg' };
const TEXTAREA_SIZE: Record<AddableEntryListSize, TextAreaSize> = { sm: 'sm', md: 'md', lg: 'lg' };

/**
 * AddableEntryList — the text + textarea sibling of `AddableTextList`.
 *
 * Existing entries render as read-only cards with a remove button.
 * Clicking "Add New" reveals a form with a TextInput (primary) and
 * TextArea (secondary). Save commits the entry and keeps the form open
 * for rapid entry; Cancel closes it.
 *
 * The entry shape is deliberately generic (`{ primary, secondary }`) so
 * a single BDS component serves competitor URLs + notes, reference sites
 * + notes, line item + description, team member + role, and so on.
 * Consumers map their domain shape at the boundary.
 *
 * Pass `primarySuggestions` to enable a combobox dropdown on the primary field
 * (same behaviour as AddableComboList). Existing consumers that pass no
 * `primarySuggestions` render identically to before.
 *
 * @example
 * ```tsx
 * <AddableEntryList
 *   label="Competitors"
 *   entries={competitors}
 *   onChange={setCompetitors}
 *   primaryPlaceholder="https://competitor.com"
 *   secondaryPlaceholder="Competitive positioning, strengths, relevance..."
 *   addLabel="Add Competitor"
 *   removeLabel="Remove competitor"
 * />
 * ```
 *
 * @example With suggestions (dental services):
 * ```tsx
 * <AddableEntryList
 *   label="Services"
 *   entries={services}
 *   onChange={setServices}
 *   primarySuggestions={getIndustryServices(industrySlug)}
 *   primaryPlaceholder="Search or add a service…"
 *   secondaryPlaceholder="Brief description of this service"
 *   addLabel="Add Service"
 * />
 * ```
 */
export function AddableEntryList({
  entries,
  onChange,
  label,
  helperText,
  primaryLabel,
  secondaryLabel,
  primaryPlaceholder,
  secondaryPlaceholder,
  addLabel = 'Add New',
  removeLabel = 'Remove entry',
  emptyLabel,
  size = 'md',
  disabled = false,
  maxItems,
  secondaryRows = 2,
  className,
  allowDuplicates = false,
  primarySuggestions,
  primaryStrict = false,
}: AddableEntryListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [primaryDraft, setPrimaryDraft] = useState('');
  const [secondaryDraft, setSecondaryDraft] = useState('');

  const primaryInputRef = useRef<HTMLInputElement>(null);
  // TextArea does not forward a ref; use a wrapper div to locate the textarea via DOM
  const secondaryWrapRef = useRef<HTMLDivElement>(null);
  const comboContainerRef = useRef<HTMLDivElement>(null);

  const focusSecondary = () => {
    const ta = secondaryWrapRef.current?.querySelector('textarea');
    ta?.focus();
  };

  const hasSuggestions = Array.isArray(primarySuggestions) && primarySuggestions.length > 0;
  const atLimit = typeof maxItems === 'number' && entries.length >= maxItems;
  const existingPrimaries = entries.map((e) => e.primary);

  // ── Cancel ───────────────────────────────────────────────────────────────────
  const cancel = () => {
    setPrimaryDraft('');
    setSecondaryDraft('');
    setIsEditing(false);
    combo.reset();
  };

  // ── Commit ───────────────────────────────────────────────────────────────────
  const commit = () => {
    const trimmedPrimary = primaryDraft.trim();
    const trimmedSecondary = secondaryDraft.trim();
    if (!trimmedPrimary) {
      cancel();
      return;
    }
    // Strict mode: reject if not in suggestions
    if (hasSuggestions && primaryStrict) {
      const inList = primarySuggestions!.some(
        (s) => s.toLowerCase() === trimmedPrimary.toLowerCase(),
      );
      if (!inList) {
        cancel();
        return;
      }
    }
    if (!allowDuplicates && entries.some((e) => e.primary.toLowerCase() === trimmedPrimary.toLowerCase())) {
      cancel();
      return;
    }
    onChange([...entries, { primary: trimmedPrimary, secondary: trimmedSecondary }]);
    setPrimaryDraft('');
    setSecondaryDraft('');
    combo.reset();
    requestAnimationFrame(() => primaryInputRef.current?.focus());
  };

  // ── Reveal ───────────────────────────────────────────────────────────────────
  const reveal = () => {
    setPrimaryDraft('');
    setSecondaryDraft('');
    setIsEditing(true);
    requestAnimationFrame(() => primaryInputRef.current?.focus());
  };

  const remove = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  // ── Combobox hook (active when primarySuggestions provided) ─────────────────
  const combo = useSuggestionFilter({
    suggestions: primarySuggestions ?? [],
    // When allowDuplicates, don't hide already-used primaries from the dropdown
    selectedValues: allowDuplicates ? [] : existingPrimaries,
    strict: primaryStrict,
    onCommit: (value) => {
      // Suggestion committed from dropdown — push to draft, move focus to secondary
      setPrimaryDraft(value);
      requestAnimationFrame(() => focusSecondary());
    },
    onCancel: cancel,
  });

  // ── Primary field handlers ───────────────────────────────────────────────────

  // Plain mode: Enter moves focus to secondary; Escape cancels
  const handlePlainPrimaryKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      requestAnimationFrame(() => focusSecondary());
    }
  };

  // Combo mode: mirror typed value to primaryDraft, delegate keys to hook
  const handleComboPrimaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrimaryDraft(e.target.value);
    combo.handleInputChange(e);
  };

  const handleComboPrimaryKey = (e: KeyboardEvent<HTMLInputElement>) => {
    combo.handleKeyDown(e);
  };

  // Close dropdown on outside click
  const handleComboBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!comboContainerRef.current?.contains(e.relatedTarget as Node)) {
      combo.closeList();
    }
  };

  // Secondary field: Escape cancels
  const handleSecondaryKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  };

  const showEmpty = entries.length === 0 && !isEditing && emptyLabel;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className={bdsClass('bds-addable-entry-list', className)}>
      {label && <span className="bds-addable-entry-list__label">{label}</span>}

      {entries.length > 0 && (
        <div className="bds-addable-entry-list__items" role="list">
          {entries.map((entry, index) => (
            <div
              key={`${index}-${entry.primary}`}
              className="bds-addable-entry-list__item"
              role="listitem"
            >
              <div className="bds-addable-entry-list__item-content">
                <span className="bds-addable-entry-list__item-primary">{entry.primary}</span>
                {entry.secondary && (
                  <span className="bds-addable-entry-list__item-secondary">{entry.secondary}</span>
                )}
              </div>
              {!disabled && (
                <button
                  type="button"
                  className="bds-addable-entry-list__remove"
                  onClick={() => remove(index)}
                  aria-label={removeLabel}
                >
                  <Icon icon="ph:x" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showEmpty && <span className="bds-addable-entry-list__empty">{emptyLabel}</span>}

      {!disabled && isEditing && !atLimit && (
        <div className="bds-addable-entry-list__form">

          {/* ── Primary field ── */}
          {hasSuggestions ? (
            /* Combobox-backed primary */
            <div
              ref={comboContainerRef}
              className="bds-addable-entry-list__primary-combo"
              onBlur={handleComboBlur}
            >
              {primaryLabel && (
                <label
                  htmlFor={combo.comboId}
                  className="bds-addable-entry-list__input-label"
                >
                  {primaryLabel}
                </label>
              )}
              <div style={{ position: 'relative' }}>
                <input
                  ref={primaryInputRef}
                  id={combo.comboId}
                  role="combobox"
                  aria-expanded={combo.isOpen}
                  aria-haspopup="listbox"
                  aria-controls={combo.listboxId}
                  aria-activedescendant={combo.activeDescendant}
                  aria-label={primaryLabel ?? (label ? `Add ${label}` : 'New entry')}
                  aria-autocomplete="list"
                  autoComplete="off"
                  className={bdsClass(
                    'bds-addable-entry-list__primary-input',
                    `bds-addable-entry-list__primary-input--${size}`,
                  )}
                  value={primaryDraft}
                  onChange={handleComboPrimaryChange}
                  onKeyDown={handleComboPrimaryKey}
                  onFocus={() => {
                    if (combo.query.trim() && combo.filtered.length > 0) combo.openList();
                  }}
                  placeholder={primaryPlaceholder}
                />

                {combo.isOpen && combo.filtered.length > 0 && (
                  <ul
                    id={combo.listboxId}
                    role="listbox"
                    aria-label={primaryLabel ? `${primaryLabel} suggestions` : 'Suggestions'}
                    className="bds-addable-entry-list__dropdown"
                  >
                    {combo.filtered.map((suggestion, idx) => (
                      <li
                        key={suggestion}
                        id={`${combo.comboId}-option-${idx}`}
                        role="option"
                        aria-selected={idx === combo.activeIndex}
                        className={bdsClass(
                          'bds-addable-entry-list__option',
                          idx === combo.activeIndex && 'bds-addable-entry-list__option--active',
                        )}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          // commitValue calls onCommit which sets primaryDraft + moves focus
                          combo.commitValue(suggestion);
                        }}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {primaryStrict && primaryDraft.trim() && !primarySuggestions!.some(
                (s) => s.toLowerCase() === primaryDraft.trim().toLowerCase(),
              ) && (
                <span className="bds-addable-entry-list__strict-hint" aria-live="polite">
                  Only suggestions can be added in strict mode.
                </span>
              )}
            </div>
          ) : (
            /* Plain text primary */
            <TextInput
              ref={primaryInputRef}
              size={INPUT_SIZE[size]}
              label={primaryLabel}
              value={primaryDraft}
              onChange={(e) => setPrimaryDraft(e.target.value)}
              onKeyDown={handlePlainPrimaryKey}
              placeholder={primaryPlaceholder}
              aria-label={primaryLabel ?? (label ? `Add ${label}` : 'New entry')}
              fullWidth
            />
          )}

          {/* ── Secondary field ── */}
          <div ref={secondaryWrapRef}>
            <TextArea
              size={TEXTAREA_SIZE[size]}
              label={secondaryLabel}
              value={secondaryDraft}
              onChange={(e) => setSecondaryDraft(e.target.value)}
              onKeyDown={handleSecondaryKey}
              placeholder={secondaryPlaceholder}
              rows={secondaryRows}
              fullWidth
            />
          </div>

          <div className="bds-addable-entry-list__form-actions">
            <Button
              size={BUTTON_SIZE[size]}
              variant="primary"
              onMouseDown={(e) => e.preventDefault()}
              onClick={commit}
            >
              Add
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

      {helperText && <span className="bds-addable-entry-list__helper">{helperText}</span>}
    </div>
  );
}

export default AddableEntryList;
