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
export declare function useSuggestionFilter({ suggestions, selectedValues, strict, onCommit, onCancel, onStrictReject, onDuplicate, onPrimaryCommitted, onBackspaceEmpty, }: UseSuggestionFilterOptions): UseSuggestionFilterReturn;
