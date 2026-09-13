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
  // Motion axis unions (ADR-039 §Decision 2, #2494) — shared with the Astro rail;
  // the portal generator (#4004) validates section data against them.
  BlueprintReveal,
  BlueprintContentMotion,
} from '../astro/types';

// ── Blueprint renderers ─────────────────────────────────────────

// Canonical primitives (post-brik-bds#580 alignment — generic, content-agnostic).
// `<CardGrid>` is the section wrapper; consumers compose
// `<Card layout="stack">` items inside via `<Grid>`. Serves any
// "header + grid of cards" layout — services, blog posts, customer
// stories, property listings, team bios, support plans.
export { CardGrid } from './CardGrid';
export type { CardGridProps } from './CardGrid';

// `<CalloutPanel>` — the `bds-callout-panel` section primitive
// (post-brik-bds#581 consolidation). Props-based: section header + a
// plan-callout card, with an optional `media` slot. New consumers
// compose this directly; the `callout_split` blueprint key
// dispatches through the `CalloutSplit` adapter below.
export { CalloutPanel } from './CalloutPanel';
export type { CalloutPanelProps } from './CalloutPanel';

// `<Cta>` — the `bds-cta` closing-CTA section primitive
// (post-brik-bds#582 consolidation). Props-based: heading + optional body +
// a primary and optional secondary action (brik-bds#590), in a single-column
// default or two-column `--split` layout. Replaces the ADR-008-banned
// `bp-cta-dark-centered`. New consumers compose this directly; the
// `cta_centered` and `cta_split_contact` keys dispatch through the
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

// `<HeroMediaCard>` / `<HeroMediaCardImage>` / `<HeroMediaCardPrice>` —
// presentational, non-interactive hero media-card parts (brik-bds#2284).
// Extracted from the `@deprecated` `HeroSplitImageCardOverlay` adapter, which
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
// ship, #2012) — `marquee` → LogoWall, `count-up` → StatsDarkBar (#2532).
export { BlockContentMotion } from './BlockContentMotion';
export type { BlockContentMotionProps } from './BlockContentMotion';

// `<About>` — the `bds-about` narrative section primitive
// (post-brik-bds#1198 consolidation, the last Phase D family). Props-based:
// eyebrow + `h2` + lead, with an optional `testimonial` pull-quote composed
// as a `<CardTestimonial>` aside. Single-member family → no layout modifier;
// the split is a `:has()`-driven state, not a named modifier. Replaces the
// ADR-008-banned `bp-about-story-split`. New consumers compose this directly;
// the `story_split` key dispatches through the adapter below.
export { About } from './About';
export type { AboutProps, AboutTestimonial } from './About';

// `<Features>` — the `bds-features` feature-grid section primitive
// (post-brik-bds#1197 consolidation). Props-based: an optional header above a
// responsive grid of brand-colored, audience-scoped feature cards on a dark
// default surface. Replaces the ADR-008-banned `bp-features-branded-dark`
// (`--dark` = theme, `--branded` = appearance, `3col` = count). New consumers
// compose this directly; the `feature_grid` key dispatches
// through the adapter below.
export { Features } from './Features';
export type { FeaturesProps, FeatureItem } from './Features';

// Legacy section-data adapters — preserve `BlueprintDispatcher` +
// AI-render path compatibility. Internally compose `<CardGrid>` +
// `<Card layout="stack">`. Direct consumers should reach for those
// primitives instead; these adapters retire in Phase E.
export { HeroSplit6040 } from './HeroSplit6040';
export { HeroSplitImageCardOverlay } from './HeroSplitImageCardOverlay';
export { HeroInteriorMinimal } from './HeroInteriorMinimal';
export { ServicesDetailTwoColumn } from './ServicesDetailTwoColumn';
export { Services3ColCardGrid } from './Services3ColCardGrid';
export { CalloutSplit } from './CalloutSplit';
export { Features3ColBrandedDark } from './Features3ColBrandedDark';
export { AboutStorySplit } from './AboutStorySplit';
export { StatsDarkBar } from './StatsDarkBar';
export { TestimonialsFeaturedLarge } from './TestimonialsFeaturedLarge';
export { CtaDarkCentered } from './CtaDarkCentered';
export { CtaSplitContact } from './CtaSplitContact';

// `<LogoWall>` — logo / partner / trust strip; the first block to adopt the
// content-motion axis (#2529). Named per block (not block+layout), matching the
// newer StatsDarkBar / TestimonialsFeaturedLarge rail-parity convention.
export { LogoWall } from './LogoWall';

// ── Dispatch surface ────────────────────────────────────────────
export { BlueprintDispatcher } from './BlueprintDispatcher';
export { BlueprintFallback } from './BlueprintFallback';
