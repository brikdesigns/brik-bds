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
 *     SiteHeader,
 *   } from '@brikdesigns/bds';
 *
 * Renderers ship through the main library bundle (Vite multi-export
 * via `lib-entry.ts`); no separate sub-path import is needed.
 *
 * ## Coverage vs the Astro twins
 *
 * Every blueprint shipped in `../astro/index.ts` (except the
 * to-be-net-new SiteFooter) has a React twin re-exported here.
 * `SiteHeader` is the site-shell nav component — site-shell, not a
 * blueprint, so it lives here but does NOT register in
 * BLUEPRINT_REGISTRY (takes its own props, not BlueprintProps).
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
export { HeroSplit6040 } from './HeroSplit6040';
export { HeroInteriorMinimal } from './HeroInteriorMinimal';
export { ServicesDetailTwoColumn } from './ServicesDetailTwoColumn';
export { Services3ColCardGrid } from './Services3ColCardGrid';
export { SupportPlanCalloutSplit } from './SupportPlanCalloutSplit';
export { AboutStorySplit } from './AboutStorySplit';
export { CtaDarkCentered } from './CtaDarkCentered';

// ── Site shell ─────────────────────────────────────────────────
export { SiteHeader, type SiteHeaderProps } from './SiteHeader';

// ── Dispatch surface ────────────────────────────────────────────
export { BlueprintDispatcher } from './BlueprintDispatcher';
export { BlueprintFallback } from './BlueprintFallback';
