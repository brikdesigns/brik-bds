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
export declare function AddableEntryList({ entries, onChange, label, helperText, primaryLabel, secondaryLabel, primaryPlaceholder, secondaryPlaceholder, addLabel, removeLabel, emptyLabel, emptyDescriptionLabel, size, disabled, maxItems, secondaryRows, className, allowDuplicates, primaryInputType, primarySuggestions, primaryStrict, }: AddableEntryListProps): import("react/jsx-runtime").JSX.Element;
export default AddableEntryList;
