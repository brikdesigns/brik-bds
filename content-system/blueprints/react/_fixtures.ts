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

/**
 * Generic placeholder fixture. Blueprint stories are section-layout
 * templates, not Brik content — the `Acme` brand name is the universal
 * stand-in so a designer auditing a blueprint sees the template shape,
 * not a specific client's voice.
 */
export const baseClientFacts: BlueprintProps['clientFacts'] = {
  brandName: 'Acme',
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

/**
 * Deterministic SVG data-URI placeholder — replaces placehold.co so blueprint
 * stories render identically offline and in Chromatic (#1319). Hex values are
 * image *content* (fake photography), not UI chrome — token rules don't apply.
 */
export function placeholderImage(width: number, height: number, bg: string, fg: string, label: string): string {
  const fontSize = Math.round(Math.min(width, height) / 8);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">` +
    `<rect width="${width}" height="${height}" fill="${bg}"/>` +
    `<text x="${width / 2}" y="${height / 2 + fontSize / 3}" text-anchor="middle" font-family="sans-serif" font-size="${fontSize}" fill="${fg}">${label}</text>` +
    `</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
