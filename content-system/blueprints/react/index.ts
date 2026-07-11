/**
 * `@brikdesigns/bds` blueprints-react surface.
 *
 * React renderers for the Brik blueprint library. Twin of
 * `../astro/index.ts` for React / Next.js consumers (primarily
 * brikdesigns.com). Types are shared with the Astro surface via
 * `../astro/types` since they are framework-agnostic.
 *
 * Consumers import from the package root:
 *
 *   import {
 *     BlueprintDispatcher,
 *     HeroSplit6040,
 *     ServicesDetailTwoColumn,
 *   } from '@brikdesigns/bds';
 *
 * Renderers ship through the main library bundle (Vite multi-export
 * via `lib-entry.ts`); no separate sub-path import is needed.
 */

// ── Contract types — re-exported from the framework-agnostic source ──
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
} from '../astro/types';

// ── Blueprint renderers ─────────────────────────────────────────

// Canonical primitives (post-brik-bds#580 alignment — generic, content-agnostic).
// `<CardGrid>` is the section wrapper; consumers compose
// `<Card preset="display">` items inside via `<Grid>`. Serves any
// "header + grid of cards" layout — services, blog posts, customer
// stories, property listings, team bios, support plans.
export { CardGrid } from './CardGrid';
export type { CardGridProps } from './CardGrid';

// `<SupportPlan>` — the `bds-support-plan` section primitive
// (post-brik-bds#581 consolidation). Props-based: section header + a
// plan-callout card, with an optional `media` slot. New consumers
// compose this directly; the `support_plan_callout_split` blueprint key
// dispatches through the `SupportPlanCalloutSplit` adapter below.
export { SupportPlan } from './SupportPlan';
export type { SupportPlanProps } from './SupportPlan';

// `<Cta>` — the `bds-cta` closing-CTA section primitive
// (post-brik-bds#582 consolidation). Props-based: heading + optional body +
// a primary and optional secondary action (brik-bds#590), in a single-column
// default or two-column `--split` layout. Replaces the ADR-008-banned
// `bp-cta-dark-centered`. New consumers compose this directly; the
// `cta_dark_centered` and `cta_split_contact` keys dispatch through the
// adapters below.
export { Cta } from './Cta';
export type { CtaProps, CtaLayout } from './Cta';

// `<Hero>` — the `bds-hero` page-hero section primitive
// (post-brik-bds#583 consolidation). Props-based: a shared content column
// (breadcrumb → eyebrow → h1 → lead → CTA) with an `--interior-minimal`
// (no media), `--split` (content + composed `media` column), or
// `--with-pricing-card` (interior split + image/price card, brik-bds#1165)
// layout. Replaces the per-blueprint `bp-hero-*` classes. The `hero_*` keys
// dispatch through the adapters below.
export { Hero } from './Hero';
export type { HeroProps, HeroLayout } from './Hero';

// `<About>` — the `bds-about` narrative section primitive
// (post-brik-bds#1198 consolidation, the last Phase D family). Props-based:
// eyebrow + `h2` + lead, with an optional `testimonial` pull-quote composed
// as a `<CardTestimonial>` aside. Single-member family → no layout modifier;
// the split is a `:has()`-driven state, not a named modifier. Replaces the
// ADR-008-banned `bp-about-story-split`. New consumers compose this directly;
// the `about_story_split` key dispatches through the adapter below.
export { About } from './About';
export type { AboutProps, AboutTestimonial } from './About';

// Legacy section-data adapters — preserve `BlueprintDispatcher` +
// AI-render path compatibility. Internally compose `<CardGrid>` +
// `<Card preset="display">`. Direct consumers should reach for those
// primitives instead; these adapters retire in Phase E.
export { HeroSplit6040 } from './HeroSplit6040';
export { HeroSplitImageCardOverlay } from './HeroSplitImageCardOverlay';
export { HeroInteriorMinimal } from './HeroInteriorMinimal';
export { ServicesDetailTwoColumn } from './ServicesDetailTwoColumn';
export { Services3ColCardGrid } from './Services3ColCardGrid';
export { SupportPlanCalloutSplit } from './SupportPlanCalloutSplit';
export { Features3ColBrandedDark } from './Features3ColBrandedDark';
export { AboutStorySplit } from './AboutStorySplit';
export { CtaDarkCentered } from './CtaDarkCentered';
export { CtaSplitContact } from './CtaSplitContact';

// ── Dispatch surface ────────────────────────────────────────────
export { BlueprintDispatcher } from './BlueprintDispatcher';
export { BlueprintFallback } from './BlueprintFallback';
