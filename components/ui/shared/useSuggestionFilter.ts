import { useState, useId, useCallback } from 'react';
import type { KeyboardEvent } from 'react';

export interface UseSuggestionFilterOptions {
  /** Full set of suggestions to filter against. */
  suggestions: string[];
  /** Already-selected values (hidden from dropdown). Case-insensitive. */
  selectedValues: string[];
  /** When true, commit rejects values not in suggestions. Default false. */
  strict?: boolean;
  /** Called when a value is committed (suggestion or free-form). */
  onCommit: (value: string) => void;
  /** Called on Escape when dropdown is closed (second press). */
  onCancel: () => void;
  /**
   * Called when Enter is pressed and the dropdown is open with no active
   * highlight, but the query is free-form and strict mode would reject it.
   * Only relevant in strict mode. Default: no-op.
   */
  onStrictReject?: () => void;
  /**
   * Optional callback called when a committed value is already in
   * selectedValues (duplicate). Useful for flash-animation.
   */
  onDuplicate?: () => void;
  /**
   * When provided, Enter in "primary committed, now navigate to secondary"
   * mode moves focus to the secondary element. If omitted, Enter commits
   * free-form and stays in primary (AddableComboList style).
   */
  onPrimaryCommitted?: () => void;
  /**
   * Called when Backspace is pressed while the query is empty — consumers
   * wire this to "remove the last selected tag" (see AddableComboList).
   */
  onBackspaceEmpty?: () => void;
}

export interface UseSuggestionFilterReturn {
  /** Controlled query value for the input. */
  query: string;
  /** Whether the dropdown listbox is open. */
  isOpen: boolean;
  /** Index of the highlighted option (-1 = none). */
  activeIndex: number;
  /** Filtered + deduplicated suggestions. */
  filtered: string[];
  /** Stable unique id for the combobox input element. */
  comboId: string;
  /** Stable unique id for the listbox element. */
  listboxId: string;
  /** aria-activedescendant value (undefined when no highlight). */
  activeDescendant: string | undefined;
  /** Handler for the input's onChange event. */
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Handler for the input's onKeyDown event. */
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  /** Open the dropdown (reset highlight). */
  openList: () => void;
  /** Close the dropdown (reset highlight). */
  closeList: () => void;
  /** Reset query and close — call on reveal/cancel. */
  reset: () => void;
  /** Programmatically commit a value (e.g. from a button click). */
  commitValue: (value: string) => void;
}

/**
 * useSuggestionFilter — shared combobox dropdown logic for suggestion-backed
 * inputs in AddableComboList and AddableEntryList.
 *
 * Behaviour:
 * - Case-insensitive contains filter
 * - Already-selected values hidden from dropdown
 * - Keyboard nav: ArrowUp/Down cycle, Enter commits highlighted or free-form,
 *   Escape closes dropdown (or cancels form on second press)
 * - Strict mode: rejects free-form commits not in suggestions list
 * - Duplicate detection calls onDuplicate instead of committing
 *
 * The caller is responsible for:
 * - Rendering the `<input>` with comboId, listboxId, activeDescendant, etc.
 * - Rendering the `<ul>` dropdown when isOpen && filtered.length > 0
 * - Managing the ref on the input (for focus management)
 */
export function useSuggestionFilter({
  suggestions,
  selectedValues,
  strict = false,
  onCommit,
  onCancel,
  onStrictReject,
  onDuplicate,
  onPrimaryCommitted,
  onBackspaceEmpty,
}: UseSuggestionFilterOptions): UseSuggestionFilterReturn {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const comboId = useId();
  const listboxId = `${comboId}-listbox`;

  const selectedSet = new Set(selectedValues.map((v) => v.toLowerCase()));

  // Filter: case-insensitive contains, exclude already-selected
  const filtered = suggestions.filter(
    (s) =>
      !selectedSet.has(s.toLowerCase()) &&
      s.toLowerCase().includes(query.toLowerCase().trim()),
  );

  const openList = useCallback(() => {
    setIsOpen(true);
    setActiveIndex(-1);
  }, []);

  const closeList = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const reset = useCallback(() => {
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const commitValue = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;

      // Strict mode: must match a suggestion
      if (strict && !suggestions.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
        onStrictReject?.();
        return;
      }

      // Duplicate check
      if (selectedSet.has(trimmed.toLowerCase())) {
        onDuplicate?.();
        return;
      }

      onCommit(trimmed);
      setQuery('');
      setIsOpen(false);
      setActiveIndex(-1);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [suggestions, strict, onCommit, onStrictReject, onDuplicate, selectedSet],
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(-1);
    if (val.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (!isOpen && filtered.length > 0) {
            setIsOpen(true);
            setActiveIndex(0);
          } else {
            setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
          }
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
            // Highlighted suggestion — commit it, then move focus if two-field
            const suggestion = filtered[activeIndex];
            commitValue(suggestion);
            onPrimaryCommitted?.();
          } else {
            // Free-form or no dropdown
            if (strict) {
              onStrictReject?.();
            } else {
              commitValue(query);
              onPrimaryCommitted?.();
            }
          }
          break;
        }
        case 'Escape': {
          e.preventDefault();
          if (isOpen) {
            closeList();
          } else {
            onCancel();
          }
          break;
        }
        case 'Backspace': {
          // Empty-input backspace removes the last selected tag (if consumer opts in).
          // Don't preventDefault — when the query has content, native deletion must run.
          if (query.length === 0) {
            onBackspaceEmpty?.();
          }
          break;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, filtered, activeIndex, query, strict, commitValue, onPrimaryCommitted, onCancel, closeList, onBackspaceEmpty],
  );

  const activeDescendant =
    isOpen && activeIndex >= 0 ? `${comboId}-option-${activeIndex}` : undefined;

  return {
    query,
    isOpen,
    activeIndex,
    filtered,
    comboId,
    listboxId,
    activeDescendant,
    handleInputChange,
    handleKeyDown,
    openList,
    closeList,
    reset,
    commitValue,
  };
}
