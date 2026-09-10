import { useState, useCallback } from 'react';

/**
 * Options for {@link useAddableList}.
 *
 * @typeParam T - the shape of a single list item (a string for tag lists, an
 * object for entry lists).
 */
export interface UseAddableListOptions<T> {
  /** Current list of items. */
  values: T[];
  /** Called with the next list when an item is added / removed / updated. */
  onChange: (next: T[]) => void;
  /** Maximum number of items. Omitted = unlimited. */
  maxItems?: number;
  /** When true, `add` never rejects on a duplicate key. Default false. */
  allowDuplicates?: boolean;
  /**
   * Derives a case-insensitive dedupe key from an item. Omit to disable
   * duplicate detection entirely — `add` then always appends (used by the
   * plain entry list, which appends empty rows the user fills in later).
   */
  getKey?: (item: T) => string;
  /** Called when `add` rejects an item as a duplicate. */
  onDuplicate?: () => void;
}

/**
 * Pure duplicate check shared by the hook and its tests: does `item` collide
 * with any of `values` under a case-insensitive `getKey`?
 *
 * Returns false when `allowDuplicates` is set or no `getKey` is supplied — the
 * latter is how the plain entry list appends blank rows without them colliding.
 */
export function isAddableDuplicate<T>(
  values: T[],
  item: T,
  { allowDuplicates, getKey }: { allowDuplicates?: boolean; getKey?: (item: T) => string },
): boolean {
  if (allowDuplicates || !getKey) return false;
  const key = getKey(item).toLowerCase();
  return values.some((v) => getKey(v).toLowerCase() === key);
}

/** Return shape of {@link useAddableList}. */
export interface UseAddableListReturn<T> {
  /** True when `maxItems` is set and reached — callers hide the add affordance. */
  atLimit: boolean;
  /** Whether the reveal-form is open. */
  isEditing: boolean;
  /** Open the reveal-form. */
  reveal: () => void;
  /** Close the reveal-form. */
  close: () => void;
  /**
   * Append an item. Returns false (and fires `onDuplicate`) when the item is a
   * duplicate, or false when `atLimit`; true when appended.
   */
  add: (item: T) => boolean;
  /** Remove the item at `index`. */
  remove: (index: number) => void;
  /** Shallow-merge `patch` into the item at `index`. */
  update: (index: number, patch: Partial<T>) => void;
  /** Whether `item` collides with an existing item under `getKey`. */
  isDuplicate: (item: T) => boolean;
}

/**
 * useAddableList — shared add / remove / update / reveal lifecycle for the
 * Addable* family (`AddableTagList`, `AddableEntryList`).
 *
 * Encapsulates the list-mutation logic that was copy-pasted across the family
 * per ADR-003 step 3: the `atLimit` computation, the reveal-form open state,
 * duplicate detection, and the append / remove / patch handlers. The combobox
 * dropdown logic stays in the sibling `useSuggestionFilter` hook.
 *
 * State ownership: this hook owns only `isEditing`. `values` remains
 * controlled by the caller — every mutation flows out through `onChange`, so
 * the hook holds no copy of the list.
 */
export function useAddableList<T>({
  values,
  onChange,
  maxItems,
  allowDuplicates = false,
  getKey,
  onDuplicate,
}: UseAddableListOptions<T>): UseAddableListReturn<T> {
  const [isEditing, setIsEditing] = useState(false);

  const atLimit = typeof maxItems === 'number' && values.length >= maxItems;

  const isDuplicate = useCallback(
    (item: T) => isAddableDuplicate(values, item, { allowDuplicates, getKey }),
    [values, allowDuplicates, getKey],
  );

  const add = useCallback(
    (item: T) => {
      if (atLimit) return false;
      if (isDuplicate(item)) {
        onDuplicate?.();
        return false;
      }
      onChange([...values, item]);
      return true;
    },
    [atLimit, isDuplicate, onChange, values, onDuplicate],
  );

  const remove = useCallback(
    (index: number) => {
      onChange(values.filter((_, i) => i !== index));
    },
    [onChange, values],
  );

  const update = useCallback(
    (index: number, patch: Partial<T>) => {
      onChange(values.map((v, i) => (i === index ? { ...v, ...patch } : v)));
    },
    [onChange, values],
  );

  const reveal = useCallback(() => setIsEditing(true), []);
  const close = useCallback(() => setIsEditing(false), []);

  return { atLimit, isEditing, reveal, close, add, remove, update, isDuplicate };
}
