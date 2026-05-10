/**
 * Shared blueprint-story fixtures.
 *
 * `baseTheme` and `baseClientFacts` were duplicated verbatim across
 * every blueprint story file. Extracted here so a single source-of-truth
 * change propagates to every fixture, and the per-story files can focus
 * on the *section shape* that's distinctive about that blueprint.
 *
 * Keep this file fixture-only — no React, no decorators, no rendering.
 * Decorators live next to their story (`withAudienceCascade` etc.) since
 * they're per-blueprint affordances, not shared truth.
 */
import type { BlueprintProps } from '../astro/types';

export const baseTheme: BlueprintProps['theme'] = {
  themeMode: 'light',
  atmosphere: 'none',
  navigationArchetype: 'utility-first',
  footerArchetype: 'four_col_directory',
};

export const baseClientFacts: BlueprintProps['clientFacts'] = {
  brandName: 'Brik Designs',
  tagline: null,
  valueProposition: null,
  services: [],
  phone: null,
  email: null,
  address: null,
  hours: [],
  heroImageUrl: null,
  logoUrl: null,
  logoVariants: {},
};
