import { type AddableEntryListSize } from '../AddableEntryList';
import './CatalogPicker.css';
/**
 * A single entry in a reference catalog (e.g. industry services, pain points,
 * keyword bank). Consumers provide a catalog and the picker renders it as
 * searchable suggestions; selections are matched back to catalog entries by
 * displayName + aliases so source attribution is automatic.
 */
export interface CatalogEntry {
    /** Stable identifier used for matching and writeback. */
    slug: string;
    /** Human-readable label shown in the dropdown and as the picked entry's name. */
    displayName: string;
    /** Synonyms matched case-insensitively when the user types free-text. */
    aliases?: readonly string[];
}
/**
 * A picked entry. `source` distinguishes items taken from the catalog
 * (vocabulary the industry pack owns) from items the user typed themselves.
 * Canonical output shape for fields like `company_profiles.services_offered`.
 */
export interface PickedCatalogEntry {
    slug: string;
    displayName: string;
    description?: string;
    source: 'catalog' | 'custom';
}
export type CatalogPickerSize = AddableEntryListSize;
export interface CatalogPickerProps {
    /** Reference catalog (e.g. dental servicesCatalog). */
    catalog: readonly CatalogEntry[];
    /** Currently picked entries. */
    value: readonly PickedCatalogEntry[];
    /** Called with the next picked list on add/remove. */
    onChange: (next: PickedCatalogEntry[]) => void;
    /** Field label above the list. */
    label?: string;
    /** Helper text rendered below the list. */
    helperText?: string;
    /** Placeholder for the search/add input. */
    searchPlaceholder?: string;
    /** Placeholder for the description textarea. */
    descriptionPlaceholder?: string;
    /** Label on the Add-new reveal button. */
    addLabel?: string;
    /** a11y label for the per-entry remove button. */
    removeLabel?: string;
    /** Text shown when the picked list is empty and the form is closed. */
    emptyLabel?: string;
    /** Text rendered in place of an empty description on a committed item. */
    emptyDescriptionLabel?: string;
    /** Size of the control (input + textarea + buttons). */
    size?: CatalogPickerSize;
    /** Hide all controls. */
    disabled?: boolean;
    /**
     * When true, users can only pick entries from the catalog — free-text names
     * that don't match any catalog entry are rejected. Defaults to false so
     * custom additions are allowed.
     */
    strict?: boolean;
    /** Maximum number of picked entries. */
    maxItems?: number;
    /** Number of rows on the description textarea. */
    descriptionRows?: number;
    /** Additional className on the root. */
    className?: string;
}
/**
 * CatalogPicker — industry-aware multi-pick input with custom escape.
 *
 * Renders a reference catalog (e.g. the industry pack's `servicesCatalog`)
 * as suggestion-backed entry list. Users can pick from the catalog or
 * add free-text entries; each picked item carries an optional description.
 *
 * The output shape is normalized: every entry has a slug, a displayName,
 * an optional description, and a `source` flag distinguishing catalog picks
 * from custom additions. Consumers persist the array as a single JSONB
 * column without losing provenance.
 *
 * This is the canonical wiring for BCS → client intel. Use it for any
 * intel field where the industry pack seeds defaults the client can then
 * override or extend (services, pain points, keyword bank, etc.).
 *
 * @example
 * ```tsx
 * import { CatalogPicker } from '@brikdesigns/bds';
 * import { industryPacks } from '@brikdesigns/bds/content-system';
 *
 * const pack = industryPacks.dental;
 *
 * <CatalogPicker
 *   label="Services Offered"
 *   catalog={pack.servicesCatalog}
 *   value={services}
 *   onChange={setServices}
 *   searchPlaceholder="Search or add a service…"
 *   descriptionPlaceholder="What makes this service unique here?"
 *   addLabel="Add Service"
 *   emptyDescriptionLabel="No description set"
 * />
 * ```
 */
export declare function CatalogPicker({ catalog, value, onChange, label, helperText, searchPlaceholder, descriptionPlaceholder, addLabel, removeLabel, emptyLabel, emptyDescriptionLabel, size, disabled, strict, maxItems, descriptionRows, className, }: CatalogPickerProps): import("react/jsx-runtime").JSX.Element;
export default CatalogPicker;
