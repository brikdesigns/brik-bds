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
 */
export const INDUSTRY_SLUGS = [
    'dental',
    'real-estate-rv-mhc',
    'small-business',
];
export const isIndustrySlug = (value) => INDUSTRY_SLUGS.includes(value);
/**
 * Fallback slug used when a client's industry has not yet been matched
 * to a dedicated pack. The `small-business` pack is designed as a
 * catch-all baseline.
 */
export const DEFAULT_INDUSTRY_SLUG = 'small-business';
//# sourceMappingURL=industry.js.map