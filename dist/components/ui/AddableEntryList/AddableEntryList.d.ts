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
export declare function AddableEntryList({ entries, onChange, label, helperText, primaryLabel, secondaryLabel, primaryPlaceholder, secondaryPlaceholder, addLabel, removeLabel, emptyLabel, size, disabled, maxItems, secondaryRows, className, allowDuplicates, }: AddableEntryListProps): import("react/jsx-runtime").JSX.Element;
export default AddableEntryList;
