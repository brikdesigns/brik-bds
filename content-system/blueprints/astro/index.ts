/**
 * `@brikdesigns/bds/blueprints-astro` — public surface.
 *
 * v0.1 scope (see docs/BLUEPRINTS-ASTRO-PACKAGE.md §2.1):
 *   Contract types (this PR).
 *   <SiteHeader>, <BlueprintDispatcher>, <BlueprintFallback> (later PR).
 *   8 blueprint components (later PRs).
 *
 * Contract types ship first so consumers + downstream tooling
 * (portal, scaffold task, verification scripts) can resolve the shape
 * before any component exists.
 */

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
