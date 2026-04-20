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
export declare function AddableComboList({ values, onChange, suggestions, placeholder, addLabel, removeLabel, emptyLabel, helperText, disabled, maxEntries, strict, label, size, className, }: AddableComboListProps): import("react/jsx-runtime").JSX.Element;
export default AddableComboList;
