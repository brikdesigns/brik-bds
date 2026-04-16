import { useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '@iconify/react';
import { bdsClass } from '../../utils';
import { Button, type ButtonSize } from '../Button';
import { Tag, type TagSize } from '../Tag';
import { TextInput, type TextInputSize } from '../TextInput';
import './AddableTextList.css';

export type AddableTextListSize = 'sm' | 'md' | 'lg';

export interface AddableTextListProps {
  /** Current list of values */
  values: string[];
  /** Called when values change (add / remove) */
  onChange: (next: string[]) => void;
  /** Optional field label */
  label?: string;
  /** Helper text below the list */
  helperText?: string;
  /** Placeholder shown in the reveal input */
  placeholder?: string;
  /** Text on the reveal button */
  addLabel?: string;
  /** Text shown when list is empty (and input is not revealed) */
  emptyLabel?: string;
  /** Size for input, button, and tags */
  size?: AddableTextListSize;
  /** Hide all controls */
  disabled?: boolean;
  /** Maximum number of entries */
  maxItems?: number;
  /** Additional className applied to root */
  className?: string;
  /** Block duplicate values (case-insensitive) */
  allowDuplicates?: boolean;
}

const TAG_SIZE: Record<AddableTextListSize, TagSize> = { sm: 'sm', md: 'md', lg: 'md' };
const BUTTON_SIZE: Record<AddableTextListSize, ButtonSize> = { sm: 'sm', md: 'md', lg: 'lg' };
const INPUT_SIZE: Record<AddableTextListSize, TextInputSize> = { sm: 'sm', md: 'md', lg: 'lg' };

/**
 * AddableTextList — list of text values with a reveal-on-click add pattern.
 *
 * The input is hidden until the user clicks the "Add new" button. Pressing
 * Enter commits the value, Escape cancels. Existing values render as
 * removable Tags.
 *
 * @example
 * ```tsx
 * <AddableTextList
 *   label="Services Offered"
 *   values={services}
 *   onChange={setServices}
 *   placeholder="e.g. Dental cleaning"
 * />
 * ```
 */
export function AddableTextList({
  values,
  onChange,
  label,
  helperText,
  placeholder,
  addLabel = 'Add New',
  emptyLabel,
  size = 'md',
  disabled = false,
  maxItems,
  className,
  allowDuplicates = false,
}: AddableTextListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const atLimit = typeof maxItems === 'number' && values.length >= maxItems;

  const reveal = () => {
    setDraft('');
    setIsEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const cancel = () => {
    setDraft('');
    setIsEditing(false);
  };

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      cancel();
      return;
    }
    if (!allowDuplicates && values.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      cancel();
      return;
    }
    onChange([...values, trimmed]);
    setDraft('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const remove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  };

  const showEmpty = values.length === 0 && !isEditing && emptyLabel;

  return (
    <div className={bdsClass('bds-addable-text-list', className)}>
      {label && <span className="bds-addable-text-list__label">{label}</span>}

      {values.length > 0 && (
        <div className="bds-addable-text-list__items" role="list">
          {values.map((value, index) => (
            <Tag
              key={`${index}-${value}`}
              size={TAG_SIZE[size]}
              onRemove={disabled ? undefined : () => remove(index)}
              role="listitem"
            >
              {value}
            </Tag>
          ))}
        </div>
      )}

      {showEmpty && <span className="bds-addable-text-list__empty">{emptyLabel}</span>}

      {!disabled && isEditing && !atLimit && (
        <div className="bds-addable-text-list__input-row">
          <div className="bds-addable-text-list__input">
            <TextInput
              ref={inputRef}
              size={INPUT_SIZE[size]}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKey}
              onBlur={() => {
                if (!draft.trim()) cancel();
              }}
              placeholder={placeholder}
              aria-label={label ? `Add ${label}` : 'Add item'}
              fullWidth
            />
          </div>
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

      {helperText && <span className="bds-addable-text-list__helper">{helperText}</span>}
    </div>
  );
}

export default AddableTextList;
