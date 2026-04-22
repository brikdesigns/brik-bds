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

export type AddableEntryPrimaryInputType = 'text' | 'url';

export interface AddableEntryListProps {
  /** Current list of entries */
  entries: AddableEntry[];
  /** Called when entries change (add / edit / remove) */
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
  /** Text on the reveal / append button */
  addLabel?: string;
  /** Accessible label for the remove button on each entry */
  removeLabel?: string;
  /** Text shown when list is empty (and form is not revealed) */
  emptyLabel?: string;
  /**
   * Text rendered in place of the secondary value in read mode when
   * `secondary` is empty. When omitted, the secondary slot is collapsed
   * and nothing is shown.
   */
  emptyDescriptionLabel?: string;
  /** Size for input, textarea, and buttons */
  size?: AddableEntryListSize;
  /**
   * When true, renders in read-only mode (token-backed typography, no
   * inputs, no remove buttons). Use for view/disabled states.
   */
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
   * Input type for the primary field. 'text' (default) renders a standard
   * TextInput. 'url' renders a URL input with `type="url"`, URL-friendly
   * autocomplete, and read-mode anchors.
   */
  primaryInputType?: AddableEntryPrimaryInputType;
  /**
   * Suggestion set for the primary (name) field. Filtered by typed query;
   * free-form entries still allowed. When omitted, primary is a plain text
   * input and entries are inline-editable per row.
   *
   * When provided, primary becomes a combobox and the component preserves
   * the reveal-form flow: existing entries render as read-only cards
   * (vocabulary-locked primary), "Add" reveals a single staging form.
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
 * Two modes of operation:
 *
 * **Plain mode** (no `primarySuggestions`). Each entry is inline-editable:
 * a TextInput (primary) and TextArea (secondary) per row, with a "Remove"
 * button. The Add button appends a new empty row. Use for competitor URLs
 * + notes, reference site + why, line item + description.
 *
 * **Suggestion mode** (with `primarySuggestions`). Preserves the reveal-form
 * flow — existing entries render as read-only cards with an x-icon remove,
 * and the Add button reveals a staging form with a combobox-backed primary.
 * Use for vocabulary-locked lists (services from a catalog, etc.).
 *
 * **Read mode** (`disabled`). Both modes collapse to token-backed typography
 * (primary: `--label-md`; secondary: `--body-md`). If `primaryInputType` is
 * `'url'`, the primary renders as a clickable anchor.
 *
 * The entry shape is deliberately generic (`{ primary, secondary }`) so a
 * single BDS component serves competitors, reference sites, line items,
 * team roles, and more. Consumers map their domain shape at the boundary.
 *
 * @example Competitors — URL input + notes, inline-editable
 * ```tsx
 * <AddableEntryList
 *   label="Competitors"
 *   entries={competitors}
 *   onChange={setCompetitors}
 *   primaryInputType="url"
 *   primaryLabel="URL"
 *   secondaryLabel="Notes"
 *   primaryPlaceholder="https://competitor.com"
 *   secondaryPlaceholder="Competitive positioning, strengths, relevance..."
 *   addLabel="Add Competitor"
 *   removeLabel="Remove competitor"
 * />
 * ```
 *
 * @example Services — suggestion-backed primary
 * ```tsx
 * <AddableEntryList
 *   label="Services"
 *   entries={services}
 *   onChange={setServices}
 *   primarySuggestions={getIndustryServices(industrySlug)}
 *   primaryPlaceholder="Search or add a service…"
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
  emptyDescriptionLabel,
  size = 'md',
  disabled = false,
  maxItems,
  secondaryRows = 2,
  className,
  allowDuplicates = false,
  primaryInputType = 'text',
  primarySuggestions,
  primaryStrict = false,
}: AddableEntryListProps) {
  const hasSuggestions = Array.isArray(primarySuggestions) && primarySuggestions.length > 0;
  const atLimit = typeof maxItems === 'number' && entries.length >= maxItems;

  // ── Read mode ───────────────────────────────────────────────────────────────
  // Token-backed typography, no inputs, no remove, no add. URL primary renders
  // as a clickable anchor.
  if (disabled) {
    const showEmpty = entries.length === 0 && emptyLabel;
    return (
      <div className={bdsClass('bds-addable-entry-list', 'bds-addable-entry-list--read', className)}>
        {label && <span className="bds-addable-entry-list__label">{label}</span>}
        {entries.length > 0 && (
          <div className="bds-addable-entry-list__read-items" role="list">
            {entries.map((entry, index) => (
              <div
                key={`${index}-${entry.primary}`}
                className="bds-addable-entry-list__read-item"
                role="listitem"
              >
                {primaryInputType === 'url' && entry.primary ? (
                  <a
                    href={entry.primary}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={bdsClass(
                      'bds-addable-entry-list__read-primary',
                      'bds-addable-entry-list__read-primary--url',
                    )}
                  >
                    {entry.primary}
                  </a>
                ) : (
                  <span className="bds-addable-entry-list__read-primary">{entry.primary}</span>
                )}
                {entry.secondary ? (
                  <span className="bds-addable-entry-list__read-secondary">{entry.secondary}</span>
                ) : emptyDescriptionLabel ? (
                  <span
                    className={bdsClass(
                      'bds-addable-entry-list__read-secondary',
                      'bds-addable-entry-list__read-secondary--empty',
                    )}
                  >
                    {emptyDescriptionLabel}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        )}
        {showEmpty && <span className="bds-addable-entry-list__empty">{emptyLabel}</span>}
        {helperText && <span className="bds-addable-entry-list__helper">{helperText}</span>}
      </div>
    );
  }

  // ── Suggestion mode ─────────────────────────────────────────────────────────
  // Preserves the reveal-form flow: read-only existing cards + staging form.
  if (hasSuggestions) {
    return (
      <SuggestionModeEdit
        entries={entries}
        onChange={onChange}
        label={label}
        helperText={helperText}
        primaryLabel={primaryLabel}
        secondaryLabel={secondaryLabel}
        primaryPlaceholder={primaryPlaceholder}
        secondaryPlaceholder={secondaryPlaceholder}
        addLabel={addLabel}
        removeLabel={removeLabel}
        emptyLabel={emptyLabel}
        emptyDescriptionLabel={emptyDescriptionLabel}
        size={size}
        atLimit={atLimit}
        secondaryRows={secondaryRows}
        className={className}
        allowDuplicates={allowDuplicates}
        primarySuggestions={primarySuggestions!}
        primaryStrict={primaryStrict}
      />
    );
  }

  // ── Plain inline-edit mode ──────────────────────────────────────────────────
  // Each entry is a numbered row: TextInput (primary) + TextArea (secondary)
  // + text "Remove" button. Add button appends an empty row.

  const update = (index: number, patch: Partial<AddableEntry>) => {
    onChange(entries.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  };

  const remove = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const append = () => {
    onChange([...entries, { primary: '', secondary: '' }]);
  };

  const showEmpty = entries.length === 0 && emptyLabel;

  return (
    <div className={bdsClass('bds-addable-entry-list', className)}>
      {label && <span className="bds-addable-entry-list__label">{label}</span>}

      {entries.length > 0 && (
        <div className="bds-addable-entry-list__rows" role="list">
          {entries.map((entry, index) => (
            <div
              key={index}
              className="bds-addable-entry-list__row"
              role="listitem"
            >
              <div className="bds-addable-entry-list__row-header">
                <span className="bds-addable-entry-list__row-index">#{index + 1}</span>
                <Button
                  size={BUTTON_SIZE[size]}
                  variant="ghost"
                  onClick={() => remove(index)}
                  aria-label={removeLabel}
                >
                  Remove
                </Button>
              </div>
              <TextInput
                size={INPUT_SIZE[size]}
                label={primaryLabel}
                type={primaryInputType}
                inputMode={primaryInputType === 'url' ? 'url' : undefined}
                autoComplete={primaryInputType === 'url' ? 'url' : undefined}
                value={entry.primary}
                onChange={(e) => update(index, { primary: e.target.value })}
                placeholder={primaryPlaceholder}
                fullWidth
              />
              <TextArea
                size={TEXTAREA_SIZE[size]}
                label={secondaryLabel}
                value={entry.secondary}
                onChange={(e) => update(index, { secondary: e.target.value })}
                placeholder={secondaryPlaceholder}
                rows={secondaryRows}
                fullWidth
              />
            </div>
          ))}
        </div>
      )}

      {showEmpty && <span className="bds-addable-entry-list__empty">{emptyLabel}</span>}

      {!atLimit && (
        <div>
          <Button size={BUTTON_SIZE[size]} variant="outline" onClick={append}>
            <Icon icon="ph:plus" />
            {addLabel}
          </Button>
        </div>
      )}

      {helperText && <span className="bds-addable-entry-list__helper">{helperText}</span>}
    </div>
  );
}

// ── Suggestion mode (preserved from previous behavior) ────────────────────────

interface SuggestionModeEditProps {
  entries: AddableEntry[];
  onChange: (next: AddableEntry[]) => void;
  label?: string;
  helperText?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryPlaceholder?: string;
  secondaryPlaceholder?: string;
  addLabel: string;
  removeLabel: string;
  emptyLabel?: string;
  emptyDescriptionLabel?: string;
  size: AddableEntryListSize;
  atLimit: boolean;
  secondaryRows: number;
  className?: string;
  allowDuplicates: boolean;
  primarySuggestions: string[];
  primaryStrict: boolean;
}

function SuggestionModeEdit({
  entries,
  onChange,
  label,
  helperText,
  primaryLabel,
  secondaryLabel,
  primaryPlaceholder,
  secondaryPlaceholder,
  addLabel,
  removeLabel,
  emptyLabel,
  emptyDescriptionLabel,
  size,
  atLimit,
  secondaryRows,
  className,
  allowDuplicates,
  primarySuggestions,
  primaryStrict,
}: SuggestionModeEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [primaryDraft, setPrimaryDraft] = useState('');
  const [secondaryDraft, setSecondaryDraft] = useState('');

  const primaryInputRef = useRef<HTMLInputElement>(null);
  const secondaryWrapRef = useRef<HTMLDivElement>(null);
  const comboContainerRef = useRef<HTMLDivElement>(null);

  const focusSecondary = () => {
    const ta = secondaryWrapRef.current?.querySelector('textarea');
    ta?.focus();
  };

  const existingPrimaries = entries.map((e) => e.primary);

  const cancel = () => {
    setPrimaryDraft('');
    setSecondaryDraft('');
    setIsEditing(false);
    combo.reset();
  };

  const commit = () => {
    const trimmedPrimary = primaryDraft.trim();
    const trimmedSecondary = secondaryDraft.trim();
    if (!trimmedPrimary) {
      cancel();
      return;
    }
    if (primaryStrict) {
      const inList = primarySuggestions.some(
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

  const reveal = () => {
    setPrimaryDraft('');
    setSecondaryDraft('');
    setIsEditing(true);
    requestAnimationFrame(() => primaryInputRef.current?.focus());
  };

  const remove = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const combo = useSuggestionFilter({
    suggestions: primarySuggestions,
    selectedValues: allowDuplicates ? [] : existingPrimaries,
    strict: primaryStrict,
    onCommit: (value) => {
      setPrimaryDraft(value);
      requestAnimationFrame(() => focusSecondary());
    },
    onCancel: cancel,
  });

  const handleComboPrimaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrimaryDraft(e.target.value);
    combo.handleInputChange(e);
  };

  const handleComboPrimaryKey = (e: KeyboardEvent<HTMLInputElement>) => {
    combo.handleKeyDown(e);
  };

  const handleComboBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!comboContainerRef.current?.contains(e.relatedTarget as Node)) {
      combo.closeList();
    }
  };

  const handleSecondaryKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  };

  const showEmpty = entries.length === 0 && !isEditing && emptyLabel;

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
                {entry.secondary ? (
                  <span className="bds-addable-entry-list__item-secondary">{entry.secondary}</span>
                ) : emptyDescriptionLabel ? (
                  <span
                    className={bdsClass(
                      'bds-addable-entry-list__item-secondary',
                      'bds-addable-entry-list__item-secondary--empty',
                    )}
                  >
                    {emptyDescriptionLabel}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                className="bds-addable-entry-list__remove"
                onClick={() => remove(index)}
                aria-label={removeLabel}
              >
                <Icon icon="ph:x" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showEmpty && <span className="bds-addable-entry-list__empty">{emptyLabel}</span>}

      {isEditing && !atLimit && (
        <div className="bds-addable-entry-list__form">
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
            <div className="bds-addable-entry-list__primary-combo-field">
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
                        combo.commitValue(suggestion);
                      }}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {primaryStrict && primaryDraft.trim() && !primarySuggestions.some(
              (s) => s.toLowerCase() === primaryDraft.trim().toLowerCase(),
            ) && (
              <span className="bds-addable-entry-list__strict-hint" aria-live="polite">
                Only suggestions can be added in strict mode.
              </span>
            )}
          </div>

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

      {!isEditing && !atLimit && (
        <div>
          <Button size={BUTTON_SIZE[size]} variant="outline" onClick={reveal}>
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
