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
export { HeroSplit6040 } from './HeroSplit6040';
export { HeroSplitImageCardOverlay } from './HeroSplitImageCardOverlay';
export { HeroInteriorMinimal } from './HeroInteriorMinimal';
export { ServicesDetailTwoColumn } from './ServicesDetailTwoColumn';
export { Services3ColCardGrid } from './Services3ColCardGrid';
export { SupportPlanCalloutSplit } from './SupportPlanCalloutSplit';
export { Features3ColBrandedDark } from './Features3ColBrandedDark';
export { AboutStorySplit } from './AboutStorySplit';
export { CtaDarkCentered } from './CtaDarkCentered';

// ── Dispatch surface ────────────────────────────────────────────
export { BlueprintDispatcher } from './BlueprintDispatcher';
export { BlueprintFallback } from './BlueprintFallback';
