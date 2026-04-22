/**
 * `@brikdesigns/bds/blueprints-astro` — public surface.
 *
 * This barrel ships as SOURCE (not compiled). Astro resolves it at
 * consumer build time — the `.astro` re-exports below can't be
 * TypeScript-compiled through tsc, so this file is explicitly excluded
 * from tsconfig.content-system.json's include path. See
 * docs/BLUEPRINTS-ASTRO-PACKAGE.md §2.7 for the packaging rationale.
 *
 * v0.1 scope (see spec §2.1):
 *   Contract types (shipped PR #2).
 *   HeroSplit6040 (shipped PR #5).
 *   HeroInteriorMinimal, StatsDarkBar, ServicesDetailTwoColumn,
 *     AboutStorySplit, TestimonialsFeaturedLarge, CtaSplitContact,
 *     CtaDarkCentered (this PR).
 *   SiteHeader, BlueprintDispatcher, BlueprintFallback (PR #7).
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
  BlueprintSection,
  ClientFacts,
  ResolvedThemeMode,
  ResolvedAtmosphere,
  ResolvedNavArchetype,
  ResolvedFooterArchetype,
  ResolvedTheme,
  BlueprintProps,
} from './types';

// ── Blueprint components ───────────────────────────────────────
// Each blueprint key in `blueprints/blueprint-library.json` that has
// a shipped Astro component is re-exported here. The
// BlueprintDispatcher (PR #7) imports from this barrel to dispatch
// by `visualNotes.blueprintKey`.
//
// v0.1 ships 8 blueprints — the set needed for Vale's first scaffold
// run. Small-business's `home` composition uses HeroSplit6040 +
// StatsDarkBar + ServicesDetailTwoColumn + AboutStorySplit +
// TestimonialsFeaturedLarge + CtaSplitContact. Interior pages use
// HeroInteriorMinimal + CtaDarkCentered.
export { default as HeroSplit6040 }             from './HeroSplit6040.astro';
export { default as HeroInteriorMinimal }       from './HeroInteriorMinimal.astro';
export { default as StatsDarkBar }              from './StatsDarkBar.astro';
export { default as ServicesDetailTwoColumn }   from './ServicesDetailTwoColumn.astro';
export { default as AboutStorySplit }           from './AboutStorySplit.astro';
export { default as TestimonialsFeaturedLarge } from './TestimonialsFeaturedLarge.astro';
export { default as CtaSplitContact }           from './CtaSplitContact.astro';
export { default as CtaDarkCentered }           from './CtaDarkCentered.astro';
