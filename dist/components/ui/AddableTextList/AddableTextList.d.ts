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
export declare function AddableTextList({ values, onChange, label, helperText, placeholder, addLabel, emptyLabel, size, disabled, maxItems, className, allowDuplicates, }: AddableTextListProps): import("react/jsx-runtime").JSX.Element;
export default AddableTextList;
