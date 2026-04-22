/**
 * Footer Archetype — the canonical site-footer pattern per industry.
 *
 * Parallel vocabulary to Navigation Archetype. Each industry pack
 * declares a default footer archetype; the BDS `<SiteFooter>` component
 * (in `@brikdesigns/bds/blueprints-astro`, shipping in v0.2) renders
 * the correct shape at build time. Styling is inherited from the
 * client theme + atmosphere — archetypes decide layout, not aesthetics.
 *
 * v0.1 locks 3 values. The full v0.1→future vocabulary ships values
 * only after a real client validates each — do not extend speculatively.
 *
 * Archetype semantics:
 *
 *   four_col_directory
 *     Informative 4-column layout: brand column (logo + tagline +
 *     social) · directory column (primary nav) · secondary column
 *     (utility pages) · visit column (address + hours + CTA). Bottom
 *     bar with copyright + legal links.
 *     Fit: service businesses with enough content to fill 4 meaningful
 *     columns — dental, real-estate, legal, specialty medical, CRE.
 *     The pack-default for most industries shipping in v0.1.
 *
 *   cta_focused
 *     Large closing CTA occupying the top two-thirds of the footer,
 *     minimal nav + address block below. Used when the footer is the
 *     page's primary conversion surface (single-offer landing pages,
 *     mental-health / wellness verticals that want the CTA to
 *     dominate after a scroll through the story).
 *     Fit: single-service businesses, wellness, focused-offer pages.
 *
 *   legal_heavy
 *     Regulated-industry variant with a prominent compliance block —
 *     HIPAA Notice, Privacy Officer contact, Non-Discrimination
 *     Statement, Notice of Privacy Practices link, additional
 *     jurisdiction-specific disclosures. Directory + visit columns
 *     present but secondary to the compliance stack.
 *     Fit: healthcare practices subject to HIPAA / §1557, legal
 *     multi-practice firms, financial services firms with prominent
 *     disclosure requirements.
 *
 * Archetype selection is a PACK default. Clients override per-engagement
 * via the portal (v0.2 — `company_profiles.footer_archetype` column lands
 * with the render surface). If a client wants a variant outside this
 * vocabulary, either (a) extend this enum with a canonical new value
 * (requires a live client for validation), or (b) graduate their
 * vertical to its own industry pack.
 *
 * Source of truth: this file. When adding a value, coordinate with:
 *   - `content-system/blueprints/astro/types.ts :: ResolvedFooterArchetype`
 *     (union must match — a vocabulary drift test validates this).
 *   - Portal PATCH zod for `company_profiles.footer_archetype` (lands with v0.2).
 *   - Storybook doc page `stories/theming/FooterArchetypes.mdx`.
 */
export const FOOTER_ARCHETYPE_VALUES = [
  'four_col_directory',
  'cta_focused',
  'legal_heavy',
] as const;

export type FooterArchetype = (typeof FOOTER_ARCHETYPE_VALUES)[number];

export const isFooterArchetype = (value: string): value is FooterArchetype =>
  (FOOTER_ARCHETYPE_VALUES as readonly string[]).includes(value);

/**
 * The default footer archetype. Used as the final fallback when both
 * pack and client overrides are absent. `four_col_directory` chosen
 * because it's informative enough to suit most service-business sites
 * without over-weighting any single concern.
 */
export const DEFAULT_FOOTER_ARCHETYPE: FooterArchetype = 'four_col_directory';
