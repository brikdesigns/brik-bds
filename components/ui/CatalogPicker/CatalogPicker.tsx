'use client';

import { useCallback, useMemo } from 'react';
import { bdsClass } from '../../utils';
import { AddableEntryList, type AddableEntry, type AddableEntryListSize } from '../AddableEntryList';
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

/** Slugify a display name into a stable identifier. */
function slugify(raw: string): string {
  const base = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base || `custom-${Date.now()}`;
}

/**
 * Return a slug that doesn't collide with any entry in `taken`. Appends
 * `-2`, `-3`, ... until unique. `taken` is the set of slugs already in use
 * (both previously-picked + the new catalog).
 */
function uniqueSlug(base: string, taken: ReadonlySet<string>): string {
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

/**
 * Match a free-text name against the catalog by displayName or alias.
 * Case-insensitive. Returns the matching CatalogEntry or null.
 */
function matchCatalogEntry(
  query: string,
  catalog: readonly CatalogEntry[],
): CatalogEntry | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  for (const entry of catalog) {
    if (entry.displayName.toLowerCase() === q) return entry;
    if (entry.aliases?.some((a) => a.toLowerCase() === q)) return entry;
  }
  return null;
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
export function CatalogPicker({
  catalog,
  value,
  onChange,
  label,
  helperText,
  searchPlaceholder,
  descriptionPlaceholder,
  addLabel = 'Add New',
  removeLabel = 'Remove entry',
  emptyLabel,
  emptyDescriptionLabel,
  size = 'md',
  disabled = false,
  strict = false,
  maxItems,
  descriptionRows = 2,
  className,
}: CatalogPickerProps) {
  // AddableEntryList sees only primary/secondary. Map current value → that shape.
  const entries = useMemo<AddableEntry[]>(
    () => value.map((v) => ({ primary: v.displayName, secondary: v.description ?? '' })),
    [value],
  );

  // Build suggestion list: catalog displayNames minus already-picked.
  // (AddableEntryList also hides already-selected primaries from its dropdown,
  //  but we filter here as a belt-and-suspenders guarantee when aliases match.)
  const suggestions = useMemo<string[]>(() => {
    const pickedSlugs = new Set(value.map((v) => v.slug));
    return catalog
      .filter((entry) => !pickedSlugs.has(entry.slug))
      .map((entry) => entry.displayName);
  }, [catalog, value]);

  // Commit handler: wrap AddableEntryList's onChange so we can attach source
  // and slug metadata before the consumer sees the new entry.
  const handleChange = useCallback(
    (next: AddableEntry[]) => {
      // Rebuild PickedCatalogEntry[] from AddableEntry[]. Preserve existing
      // metadata for entries that survived (matched by primary), and enrich
      // any newly added entries with catalog lookups.
      const byPrimary = new Map(value.map((v) => [v.displayName.toLowerCase(), v]));
      const takenSlugs = new Set<string>(catalog.map((e) => e.slug));
      value.forEach((v) => takenSlugs.add(v.slug));

      const result: PickedCatalogEntry[] = next.map((entry) => {
        const existing = byPrimary.get(entry.primary.toLowerCase());
        if (existing) {
          // Preserved entry — update description but keep slug + source.
          return {
            ...existing,
            description: entry.secondary || undefined,
          };
        }
        // New entry — try to match against catalog.
        const match = matchCatalogEntry(entry.primary, catalog);
        if (match) {
          return {
            slug: match.slug,
            displayName: match.displayName,
            description: entry.secondary || undefined,
            source: 'catalog',
          };
        }
        // Custom — derive a unique slug.
        const slug = uniqueSlug(slugify(entry.primary), takenSlugs);
        takenSlugs.add(slug);
        return {
          slug,
          displayName: entry.primary,
          description: entry.secondary || undefined,
          source: 'custom',
        };
      });

      onChange(result);
    },
    [catalog, value, onChange],
  );

  return (
    <div className={bdsClass('bds-catalog-picker', className)}>
      <AddableEntryList
        label={label}
        helperText={helperText}
        entries={entries}
        onChange={handleChange}
        primarySuggestions={suggestions}
        primaryStrict={strict}
        primaryPlaceholder={searchPlaceholder}
        secondaryPlaceholder={descriptionPlaceholder}
        addLabel={addLabel}
        removeLabel={removeLabel}
        emptyLabel={emptyLabel}
        emptyDescriptionLabel={emptyDescriptionLabel}
        size={size}
        disabled={disabled}
        maxItems={maxItems}
        secondaryRows={descriptionRows}
      />
    </div>
  );
}

export default CatalogPicker;
