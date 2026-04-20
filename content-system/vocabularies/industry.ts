/**
 * Industry slug registry — canonical keys for every industry pack in BCS.
 *
 * Each slug here must have a matching `{slug}.ts` data file and `{slug}.mdx`
 * narrative in `content-system/industries/`. The portal's
 * `company_profiles.industry_slug` column is a FK to this list.
 *
 * Promotion policy (from industry-reference-small-business.md §Promotion):
 *   Graduate a vertical out of `small-business` to its own slug when:
 *     1. Brik has 3+ active clients in that vertical, OR
 *     2. Seasonality/regulation/terminology diverges meaningfully, OR
 *     3. Strategy docs repeat 60%+ in that vertical.
 *
 * Note on the taxonomy hierarchy: every pack slug in INDUSTRY_SLUGS is a
 * **sub-industry** living under a parent industry bucket declared on the
 * pack (`IndustryPack.parentIndustry`). PARENT_INDUSTRY_SLUGS below is
 * the registry of parent buckets. Portal UI dropdowns drive off the parent
 * first, then filter sub-industries; BDS packs resolve at the sub layer.
 */
export const INDUSTRY_SLUGS = [
  'dental',
  'real-estate-rv-mhc',
  'small-business',
] as const;

export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

export const isIndustrySlug = (value: string): value is IndustrySlug =>
  (INDUSTRY_SLUGS as readonly string[]).includes(value);

/**
 * Fallback slug used when a client's industry has not yet been matched
 * to a dedicated pack. The `small-business` pack is designed as a
 * catch-all baseline.
 */
export const DEFAULT_INDUSTRY_SLUG: IndustrySlug = 'small-business';

/**
 * Parent industry buckets — the top-level groupings portal UI uses for
 * the "Industry" dropdown before filtering sub-industries. Every
 * IndustryPack declares which parent it belongs to.
 *
 * Mirrors the portal's `companies.industry` column. Adding a new parent
 * here without a matching portal UI update will hide the bucket from
 * clients; keep the two in sync.
 */
export const PARENT_INDUSTRY_SLUGS = [
  'medical',
  'real-estate',
  'small-business',
  'other',
] as const;

export type ParentIndustrySlug = (typeof PARENT_INDUSTRY_SLUGS)[number];

export const isParentIndustrySlug = (value: string): value is ParentIndustrySlug =>
  (PARENT_INDUSTRY_SLUGS as readonly string[]).includes(value);
