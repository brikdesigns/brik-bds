/**
 * Navigation Archetype — the canonical site-header pattern per industry.
 *
 * Single source of truth shared by BCS industry packs (which declare a
 * default archetype per vertical), the portal Intel tab (admin can
 * override per client), and the BDS `<SiteHeader>` component in
 * `@brikdesigns/bds/blueprints-astro` that renders the actual navigation.
 *
 * Archetypes are LAYOUT-level decisions, not styling — they describe how
 * many primary links appear, whether a mega-menu is exposed, where the
 * utility cluster (phone, CTA) sits, and the scroll + mobile behaviors.
 * Styling is inherited from the client theme + atmosphere selection
 * (see theme_mode + atmosphere on company_profile).
 *
 * Archetype semantics:
 *
 *   editorial-transparent
 *     4 primary links + Services mega-menu + utility cluster (phone + CTA).
 *     Nav is transparent over hero, frosted glass past 80px scroll.
 *     Fit: luxury dental, med-aesthetic, editorial brands where the
 *     hero photography must breathe at first load.
 *
 *   utility-first
 *     5 primary links + Services mega-menu (optionally with inline
 *     search or map). Always-solid background, no hide-on-scroll.
 *     Utility cluster leads with a task-oriented CTA ("Find a Home",
 *     "Schedule a Tour", "Free Consultation").
 *     Fit: real-estate / RV / MHC, directories, legal multi-practice.
 *
 *   service-centric
 *     5 primary links + prominent mega-menu on Services / Practice Areas
 *     / Specialties. Mega-menu is the product — 2-column layout with
 *     categories + featured attorney/practitioner card.
 *     Fit: multi-practice legal, specialty medical groups, agencies.
 *
 *   portfolio-minimal
 *     3-4 primary links, no dropdowns, text-only serif treatment with
 *     wide tracking. Hide-on-scroll-down + reveal-on-scroll-up. Utility
 *     cluster is minimal — often just an IG icon and a ghost "Inquire".
 *     Fit: MUA, creative portfolios, photographers, wedding.
 *
 *   calm-flat
 *     3-4 primary links, NO dropdowns (anxiety-sensitive audiences don't
 *     hover-explore). Always solid at low contrast. Single warm CTA like
 *     "Book Session" — no secondary actions.
 *     Fit: wellness, mental health, therapy, recovery.
 */
export const NAV_ARCHETYPE_VALUES = [
  'editorial-transparent',
  'utility-first',
  'service-centric',
  'portfolio-minimal',
  'calm-flat',
] as const;

export type NavArchetype = (typeof NAV_ARCHETYPE_VALUES)[number];

export const isNavArchetype = (value: string): value is NavArchetype =>
  (NAV_ARCHETYPE_VALUES as readonly string[]).includes(value);
