/**
 * Blueprint Astro package — contract types.
 *
 * Every blueprint component in `@brikdesigns/bds/blueprints-astro` accepts
 * the SAME props shape (`BlueprintProps`). No blueprint-specific props.
 * This keeps the dispatcher trivial and the maintenance cost linear in
 * the blueprint count, not quadratic in keys × call-sites.
 *
 * These types are the public surface consumers import from
 * `@brikdesigns/bds/blueprints-astro`. Changes here are MAJOR bumps.
 * See `docs/BLUEPRINTS-ASTRO-PACKAGE.md` §2.8 for the versioning policy.
 */

/**
 * Known blueprint keys. Mirrors `blueprints/blueprint-library.json` as a
 * literal union for consumer type-safety. When adding a new blueprint to
 * the library, append its key here in the same PR — the v0.1 policy is
 * hand-maintained; a build-time generator replaces this in a future pass.
 */
export type KnownBlueprintKey =
  | 'hero_split_60_40'
  | 'hero_centered_gradient'
  | 'hero_fullbleed_photo'
  | 'hero_dark_minimal'
  | 'hero_interior_minimal'
  | 'services_numbered_rows'
  | 'services_detail_two_column'
  | 'features_3col_icon_grid'
  | 'features_alternating_split'
  | 'features_bento_asymmetric'
  | 'about_story_split'
  | 'stats_dark_bar'
  | 'stats_centered_light'
  | 'testimonials_3col_cards'
  | 'testimonials_featured_large'
  | 'cta_dark_centered'
  | 'cta_split_contact'
  | 'contact_form_split'
  | 'faq_accordion_grouped'
  | 'team_cards_centered'
  | 'team_bio_grid'
  | 'gallery_masonry_3col'
  | 'nav_sticky_blur'
  | 'nav_light_clean'
  | 'content_legal_centered';

/**
 * Resolved section content — what the portal's content generator emits
 * and the dispatcher consumes. Shape matches the typed section output
 * produced by `generate-content-page-worker` in the portal.
 *
 * `body` is nullable by design — stat + testimonial sections omit prose
 * bodies; the scaffold template must render conditionally on null rather
 * than emitting `<p>null</p>` (the bug the Birdwell `NotionPageBody`
 * template shipped). See intel entry #18.
 */
export interface BlueprintSection {
  readonly sectionKey: string;
  readonly sectionType: string;
  readonly heading: string | null;
  readonly subheading: string | null;
  readonly body: string | null;
  readonly items: readonly {
    readonly title: string;
    readonly description: string;
  }[];
  readonly cta: {
    readonly label: string;
    readonly url: string;
  } | null;
  readonly visualNotes: {
    readonly blueprintKey: KnownBlueprintKey | null;
    readonly moodKeywords: readonly string[];
    readonly layoutBlueprint: string;
    readonly imageOpportunity: string | null;
    readonly animationSuggestion: string | null;
    readonly illustrationOpportunity: string | null;
  } | null;
}

/**
 * Per-client facts the dispatcher passes to every blueprint. Projected
 * from `company_profile` columns by the scaffold task. Required fields
 * are narrow; blueprints may read optional fields via the index signature
 * (for extensibility without modifying this interface every time a new
 * fact appears).
 *
 * The scaffold task MUST validate that every blueprint's `required_facts`
 * (see `blueprint-library.json`) is populated here before emitting the
 * client repo. See docs/BLUEPRINTS-ASTRO-PACKAGE.md §2.4.
 */
export interface ClientFacts {
  readonly brandName: string;
  readonly tagline: string | null;
  readonly valueProposition: string | null;

  readonly services: readonly {
    readonly slug: string;
    readonly displayName: string;
    readonly description?: string | null;
  }[];

  readonly phone: string | null;
  readonly email: string | null;

  readonly address: {
    readonly street: string | null;
    readonly city: string | null;
    readonly state: string | null;
    readonly zip: string | null;
  } | null;

  readonly hours: readonly {
    readonly day: string;
    readonly open: string | null;
    readonly close: string | null;
    readonly closed: boolean;
  }[];

  readonly heroImageUrl: string | null;
  readonly logoUrl: string | null;
  readonly logoVariants: Readonly<Record<string, string>>;

  /**
   * Extension escape hatch for blueprint-specific facts that don't
   * warrant promotion to the canonical interface yet. Keys are snake_case
   * matching `required_facts` entries in `blueprint-library.json`.
   */
  readonly [key: string]: unknown;
}

/**
 * Theme mode — light or dark. Mirrors portal `company_profiles.theme_mode`.
 */
export type ResolvedThemeMode = 'light' | 'dark';

/**
 * Atmosphere slug — one of the 7 locked values in
 * `content-system/vocabularies/atmosphere.ts`. Re-stated here as a union
 * so `@brikdesigns/bds/blueprints-astro` is importable without also
 * importing the vocabularies module (keeps the Astro-package import
 * surface narrow).
 *
 * Source of truth: `content-system/vocabularies/atmosphere.ts :: ATMOSPHERE_VALUES`.
 * Keep in sync; a vocabulary test validates this union matches.
 */
export type ResolvedAtmosphere =
  | 'editorial-luxury'
  | 'cinematic-dramatic'
  | 'minimal-clinical'
  | 'warm-soft'
  | 'clean-bright'
  | 'organic-textured'
  | 'none';

/**
 * Navigation archetype slug. Source of truth:
 * `content-system/vocabularies/nav-archetype.ts :: NAV_ARCHETYPE_VALUES`.
 */
export type ResolvedNavArchetype =
  | 'editorial-transparent'
  | 'utility-first'
  | 'service-centric'
  | 'portfolio-minimal'
  | 'calm-flat';

/**
 * Footer archetype slug. v0.1 vocabulary ships 3 values.
 * Source of truth (after PR #3): `content-system/vocabularies/footer-archetype.ts`.
 * Locked vocabulary — extend-only after first production use.
 */
export type ResolvedFooterArchetype =
  | 'four_col_directory'
  | 'cta_focused'
  | 'legal_heavy';

/**
 * Resolved theming decisions — the output of the scaffold task's
 * theming resolver (pack default + client override). Every blueprint
 * receives this and may adapt rendering based on atmosphere or theme
 * mode, but does not re-resolve on its own.
 */
export interface ResolvedTheme {
  readonly themeMode: ResolvedThemeMode;
  readonly atmosphere: ResolvedAtmosphere;
  readonly navigationArchetype: ResolvedNavArchetype;
  readonly footerArchetype: ResolvedFooterArchetype;
}

/**
 * The single prop shape every blueprint Astro component accepts.
 * No blueprint-specific props, ever. If a blueprint needs data the
 * `ClientFacts` surface doesn't expose, add the field to `ClientFacts`
 * (via the index signature if not canonical), or extend `ClientFacts`
 * in a MAJOR bump.
 */
export interface BlueprintProps {
  readonly section: BlueprintSection;
  readonly clientFacts: ClientFacts;
  readonly theme: ResolvedTheme;
}
