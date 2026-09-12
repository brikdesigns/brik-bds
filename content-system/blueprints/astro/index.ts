/**
 * `@brikdesigns/bds/blueprints-astro` — public surface.
 *
 * This barrel ships as SOURCE (not compiled). Astro resolves it at
 * consumer build time — the `.astro` re-exports below can't be
 * TypeScript-compiled through tsc, so this file is explicitly excluded
 * from tsconfig.content-system.json's include path. See
 * docs/BLUEPRINTS-ASTRO-PACKAGE.md §2.7 for the packaging rationale.
 *
 * Surface: contract types, the eight blueprint BLOCKS, and the three
 * dispatch/shell components. Since #2302 a block is one file and the layout it
 * renders in is a prop, so the export list is per-block, not per-layout — the
 * ten former per-layout exports were removed there. `<BlueprintDispatcher>`
 * maps every wired blueprint key onto a (block, layout) pair, so no key lost
 * its render path.
 *
 * Consumer-side type resolution: Astro projects inherit
 * `declare module '*.astro'` from Astro's tsconfig presets — no
 * consumer-side configuration required. Types standalone are also
 * importable at `@brikdesigns/bds/blueprints-astro/types` (compiled
 * to dist) for contexts that don't need the Astro runtime.
 */

// ── Contract types ──────────────────────────────────────────────
export type {
  KnownBlueprintKey,
  WiredBlueprintKey,
  BlueprintSection,
  ClientFacts,
  ResolvedThemeMode,
  ResolvedAtmosphere,
  ResolvedNavArchetype,
  ResolvedFooterArchetype,
  ResolvedTheme,
  BlueprintProps,
  // Layout unions (#2302) — shared with the React rail, which re-exports
  // HeroLayout / CtaLayout from the same declarations.
  HeroLayout,
  CtaLayout,
  CardGridLayout,
  // `<HeroMediaCard missing>` payload (#2312) — shared with the React rail's
  // `HeroMediaCardMissing` (declared inline on `HeroMediaCard.tsx` there;
  // centralized here so a consumer can type it without the Astro runtime).
  HeroMediaCardMissing,
} from './types';

// ── Implemented-set (runtime) ───────────────────────────────────
// The keys with a shipped component in BLUEPRINT_REGISTRY. Greppable,
// runtime-importable (also at the `/types` subpath) — consumers use it
// to tell "renders" from "falls back to <BlueprintFallback>".
export { WIRED_BLUEPRINT_KEYS } from './types';

// ── Blueprint blocks ───────────────────────────────────────────
// One export per BLOCK since #2302 — the layout a block renders in is a
// prop, never a filename, matching the React rail's API. The ten former
// per-layout exports (HeroSplit6040, HeroInteriorMinimal,
// HeroSplitImageCardOverlay, CtaDarkCentered, CtaSplitContact,
// Services3ColCardGrid, ServicesDetailTwoColumn, SupportPlanCalloutSplit,
// Features3ColBrandedDark, AboutStorySplit) are gone; every blueprint key
// they served still resolves, because `<BlueprintDispatcher>` now maps
// key → (block, layout). No client site imported them by name.
//
// Direct consumers compose a block and pass `layout`:
//   <Hero layout="interior-minimal" section={…} clientFacts={…} theme={…} />
export { default as Hero }                      from './Hero.astro';

// `<HeroMediaCard>` / `<HeroMediaCardImage>` / `<HeroMediaCardPrice>` —
// presentational, non-interactive hero media-card sub-parts (brik-bds#2312).
// NOT dispatched blueprints — no `blueprintKey`, no `BlueprintDispatcher`
// entry. `Hero.astro`'s `with-pricing-card` layout composes them for its
// right-hand column; a direct consumer composes them the same way. React
// twins: `../react/HeroMediaCard{,Image,Price}.tsx`.
export { default as HeroMediaCard }             from './HeroMediaCard.astro';
export { default as HeroMediaCardImage }        from './HeroMediaCardImage.astro';
export { default as HeroMediaCardPrice }        from './HeroMediaCardPrice.astro';

export { default as Cta }                       from './Cta.astro';
export { default as About }                     from './About.astro';
export { default as Features }                  from './Features.astro';
export { default as CardGrid }                  from './CardGrid.astro';
export { default as CalloutPanel }              from './CalloutPanel.astro';
export { default as StatsDarkBar }              from './StatsDarkBar.astro';
export { default as TestimonialsFeaturedLarge } from './TestimonialsFeaturedLarge.astro';

// ── Dispatch surface ────────────────────────────────────────────
// <BlueprintDispatcher> is the primary consumer entrypoint — client
// pages render a whole page body with a single component call, reading
// `visualNotes.blueprintKey` on each section to select the matching
// component from BLUEPRINT_REGISTRY. <BlueprintFallback> handles
// unknown keys with a loud visible stub + a CI-greppable data
// attribute. <SiteHeader> is the site-shell nav component — not a
// blueprint, but lives in this package because every client Astro
// site imports it alongside the blueprints.
export { default as BlueprintDispatcher } from './BlueprintDispatcher.astro';
export { default as BlueprintFallback }   from './BlueprintFallback.astro';
export { default as SiteHeader }          from './SiteHeader.astro';
