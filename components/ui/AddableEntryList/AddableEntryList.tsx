import { useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '@iconify/react';
import { bdsClass } from '../../utils';
import { Button, type ButtonSize } from '../Button';
import { TextInput, type TextInputSize } from '../TextInput';
import { TextArea, type TextAreaSize } from '../TextArea';
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
}: AddableEntryListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [primaryDraft, setPrimaryDraft] = useState('');
  const [secondaryDraft, setSecondaryDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const atLimit = typeof maxItems === 'number' && entries.length >= maxItems;

  const reveal = () => {
    setPrimaryDraft('');
    setSecondaryDraft('');
    setIsEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const cancel = () => {
    setPrimaryDraft('');
    setSecondaryDraft('');
    setIsEditing(false);
  };

  const commit = () => {
    const trimmedPrimary = primaryDraft.trim();
    const trimmedSecondary = secondaryDraft.trim();
    if (!trimmedPrimary) {
      cancel();
      return;
    }
    if (!allowDuplicates && entries.some((e) => e.primary.toLowerCase() === trimmedPrimary.toLowerCase())) {
      cancel();
      return;
    }
    onChange([...entries, { primary: trimmedPrimary, secondary: trimmedSecondary }]);
    setPrimaryDraft('');
    setSecondaryDraft('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const remove = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const handlePrimaryKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
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
          <TextInput
            ref={inputRef}
            size={INPUT_SIZE[size]}
            label={primaryLabel}
            value={primaryDraft}
            onChange={(e) => setPrimaryDraft(e.target.value)}
            onKeyDown={handlePrimaryKey}
            placeholder={primaryPlaceholder}
            aria-label={primaryLabel ?? (label ? `Add ${label}` : 'New entry')}
            fullWidth
          />
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
