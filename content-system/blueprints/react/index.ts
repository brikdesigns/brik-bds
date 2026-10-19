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
 *     Hero,
 *     CardGrid,
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
  // Motion axis unions (ADR-039 §Decision 2, #2494) — shared with the Astro rail;
  // the portal generator (#4004) validates section data against them.
  BlueprintReveal,
  BlueprintContentMotion,
} from '../astro/types';

// ── Blueprint renderers ─────────────────────────────────────────

// One component per BLOCK, layout as a prop (#2352) — the same shape as the
// Astro rail. Each block is driven two ways: composed (pass props / children)
// or dispatched (pass a `section`, and `BlueprintDispatcher` picks the block +
// `layout` from the blueprint key).
//
// Canonical primitives (post-brik-bds#580 alignment — generic, content-agnostic).
// `<CardGrid>` is the section wrapper; consumers compose
// `<Card layout="stack">` items inside via `<Grid>`, or pass a `section` and a
// `layout` (`card-grid` | `two-column-list`) to have it render the items. Serves
// any "header + grid of cards" layout — services, blog posts, customer
// stories, property listings, team bios, support plans.
export { CardGrid } from './CardGrid';
export type { CardGridProps, CardGridSectionProps } from './CardGrid';

// `<CalloutPanel>` — the `bds-callout-panel` section primitive
// (post-brik-bds#581 consolidation). Props-based: section header + a
// plan-callout card, with an optional `media` slot. New consumers
// compose this directly, or pass a `section`; `callout_split` dispatches here.
export { CalloutPanel } from './CalloutPanel';
export type { CalloutPanelProps, CalloutPanelSectionProps } from './CalloutPanel';

// `<Cta>` — the `bds-cta` closing-CTA section primitive
// (post-brik-bds#582 consolidation). Props-based: heading + optional body +
// a primary and optional secondary action (brik-bds#590), in a single-column
// default or two-column `--split` layout. Replaces the ADR-008-banned
// `bp-cta-dark-centered`. New consumers compose this directly, or pass a
// `section` + `layout`; `cta_centered` and `cta_split_contact` dispatch here.
export { Cta } from './Cta';
export type { CtaProps, CtaSectionProps, CtaLayout } from './Cta';

// `<Hero>` — the `bds-hero` page-hero section primitive
// (post-brik-bds#583 consolidation). Props-based: a shared content column
// (breadcrumb → eyebrow → h1 → lead → CTA) with an `--interior-minimal`
// (no media), `--split` (content + composed `media` column), or
// `--with-pricing-card` (interior split + image/price card, brik-bds#1165)
// layout. Replaces the per-blueprint `bp-hero-*` classes. `hero_split` and
// `hero_interior_minimal` dispatch here (`layout` = `split` /
// `interior-minimal`); `hero_split_image_card_overlay` dispatches through the
// `HeroSplitImageCardOverlay` adapter below.
export { Hero } from './Hero';
export type { HeroProps, HeroSectionProps, HeroLayout } from './Hero';

// `<HeroMediaCard>` / `<HeroMediaCardImage>` / `<HeroMediaCardPrice>` —
// presentational, non-interactive hero media-card parts (brik-bds#2284).
// Extracted from the `HeroSplitImageCardOverlay` adapter, which
// hard-codes its own `<Button>` inside a plain `<aside>` — nesting that
// `<button>` inside an outer interactive `<a>` / `<Card interactive>` is
// invalid. These parts own no interactivity; a consumer wanting the whole
// card clickable composes `<Card href>` / `as="a"` around `<HeroMediaCard>`.
export { HeroMediaCard } from './HeroMediaCard';
export type { HeroMediaCardProps, HeroMediaCardMissing } from './HeroMediaCard';
export { HeroMediaCardImage } from './HeroMediaCardImage';
export type { HeroMediaCardImageProps } from './HeroMediaCardImage';
export { HeroMediaCardPrice } from './HeroMediaCardPrice';
export type { HeroMediaCardPriceProps } from './HeroMediaCardPrice';

// `<BlockMedia>` — the shared media-axis primitive (ADR-039 §Media axis, #2493).
// Renders `image` / `video` / `bg-video` / `none` through `<Frame>` so a block
// never hand-rolls a `<video>` tag or an `aspect-ratio`. Twin of the Astro
// rail's `_Media.astro`. `bg-video` is reduced-motion-gated by construction.
export { BlockMedia } from './BlockMedia';
export type { BlockMediaProps } from './BlockMedia';

// `<BlockReveal>` — the shared motion-axis entrance primitive (ADR-039 §Decision 2,
// #2494). Applies a `fade` / `rise` / `stagger` entrance selected by the `reveal`
// axis, reduced-motion-gated by construction. The Astro rail applies the same
// `bds-block-reveal--*` modifier class directly (a modifier needs no wrapper).
export { BlockReveal } from './BlockReveal';
export type { BlockRevealProps } from './BlockReveal';

// `<BlockContentMotion>` — the shared content-motion dispatcher (ADR-039
// §Decision 2, #2529), the content half of the motion axis. Renders `marquee`
// through the `Marquee` primitive and `count-up` through the `CountUp` primitive
// selected by the `contentMotion` axis, reduced-motion-gated by construction;
// `animated-svg` lands with its own adopting block (#2533). Each value ships
// with its first adopter (a component unreachable from the dispatcher cannot
// ship, #2012) — `marquee` → LogoWall, `count-up` → StatsBar (#2532).
export { BlockContentMotion } from './BlockContentMotion';
export type { BlockContentMotionProps } from './BlockContentMotion';

// `<Narrative>` — the `bds-narrative` narrative section primitive
// (post-brik-bds#1198 consolidation, the last Phase D family). Props-based:
// eyebrow + `h2` + lead, with an optional `testimonial` pull-quote composed
// as a `<CardTestimonial>` aside. Single-member family → no layout modifier;
// the split is a `:has()`-driven state, not a named modifier. Replaces the
// ADR-008-banned `bp-about-story-split`. New consumers compose this directly,
// or pass a `section`; `story_split` dispatches here.
export { Narrative } from './Narrative';
export type { NarrativeProps, NarrativeSectionProps, NarrativeTestimonial } from './Narrative';

// `<Features>` — the `bds-features` feature-grid section primitive
// (post-brik-bds#1197 consolidation). Props-based: an optional header above a
// responsive grid of brand-colored, audience-scoped feature cards on a dark
// default surface. Replaces the ADR-008-banned `bp-features-branded-dark`
// (`--dark` = theme, `--branded` = appearance, `3col` = count). New consumers
// compose this directly, or pass a `section`; `feature_grid` dispatches here.
export { Features } from './Features';
export type { FeaturesProps, FeaturesSectionProps, FeatureItem } from './Features';

// Key adapters that remain. `HeroSplitImageCardOverlay` builds a breadcrumb +
// pricing-card aside from section data and has its own props (consumers type
// against `ComponentProps<typeof HeroSplitImageCardOverlay>`), so it is not a
// thin wrapper over `<Hero>`. `StatsBar` / `TestimonialsFeaturedLarge` are
// already one block per key (the rail-parity convention).
export { HeroSplitImageCardOverlay } from './HeroSplitImageCardOverlay';
export { StatsBar } from './StatsBar';
export { TestimonialsFeaturedLarge } from './TestimonialsFeaturedLarge';

// `<LogoWall>` — logo / partner / trust strip; the first block to adopt the
// content-motion axis (#2529). Named per block (not block+layout), matching the
// newer StatsBar / TestimonialsFeaturedLarge rail-parity convention.
export { LogoWall } from './LogoWall';

// ── Dispatch surface ────────────────────────────────────────────
export { BlueprintDispatcher } from './BlueprintDispatcher';
export { BlueprintFallback } from './BlueprintFallback';
