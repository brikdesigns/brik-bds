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
 *     Services3ColCardGrid,
 *   } from '@brikdesigns/bds';
 *
 * Renderers ship through the main library bundle (Vite multi-export
 * via `lib-entry.ts`); no separate sub-path import is needed.
 *
 * ## v0.1 scope
 *
 *   Services3ColCardGrid (this PR — the brikdesigns.com
 *     /services/{slug} index-page driver).
 *
 * Subsequent renderers — HeroSplit6040, HeroInteriorMinimal,
 * ServicesDetailTwoColumn, CtaDarkCentered, AboutStorySplit,
 * SiteHeader, SiteFooter — ship in their own PRs (Workstream A).
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
export { Services3ColCardGrid } from './Services3ColCardGrid';

// ── Dispatch surface ────────────────────────────────────────────
export { BlueprintDispatcher } from './BlueprintDispatcher';
export { BlueprintFallback } from './BlueprintFallback';
