/**
 * Atmosphere manifest — maps atmosphere slug to its CSS asset path,
 * theme-mode hint, surface-profile guidance, and the safePairings
 * contract the portal contrast preflight relies on.
 *
 * Consumers (portal generate-theme-css.ts, theme-contrast-check.ts,
 * docs renderers) read this manifest to:
 *   - Resolve the canonical @import path for an atmosphere without
 *     string-building by hand.
 *   - Know which BDS-contract token pairings the atmosphere guarantees
 *     pass WCAG AA when the theme generator's output is layered with
 *     this atmosphere.
 *   - Decide which surface tokens (paper / accent-dark / both) the
 *     theme generator should emit alongside the atmosphere CSS.
 *
 * CSS files live as siblings and are exported through the package
 * exports field in package.json under `./atmospheres/*.css`.
 *
 * Schema additions (0.37.0, 2026-04-25 — W1-BDS + W9):
 *   - `safePairings` — every atmosphere declares the foreground/background
 *     token pairs it expects to render. The portal preflight stops
 *     hard-coding an inline list; it reads this instead.
 *   - `surfaceProfile` — declares whether this atmosphere collapses
 *     surfaces to a single tone (`single-tone-light` / `single-tone-dark`)
 *     or supports both light + dark surface emission (`dual-mode`).
 */

import type { Atmosphere } from '../vocabularies/atmosphere';

/**
 * One BDS-contract token pairing the atmosphere guarantees passes WCAG AA
 * for normal body text (≥ 4.5:1) when the theme generator's output is
 * layered with this atmosphere's CSS.
 *
 * `fg` and `bg` are CSS custom-property names INCLUDING the leading `--`.
 * The portal contrast preflight resolves both to hex via
 * `theme-contrast-check.ts#resolveToHex` and grades the pair.
 */
export interface SafePairing {
  fg: string;
  bg: string;
  /** Human-readable note about where this pairing renders. Optional. */
  context?: string;
}

/**
 * Surface emission posture for an atmosphere. The portal theme generator
 * (W2) consumes this to decide which surface tokens to emit alongside the
 * atmosphere CSS:
 *
 *   - `single-tone-light` — atmosphere collapses surfaces to a paper /
 *     ivory base (e.g. warm-soft, organic-textured). Generator emits
 *     `--surface-paper`, `--surface-paper-elevated`, `--text-on-paper`.
 *   - `single-tone-dark` — atmosphere collapses surfaces to ink / deep
 *     accent (e.g. editorial-luxury, cinematic-dramatic). Generator emits
 *     `--surface-accent-dark`, `--surface-accent-warm`, `--text-on-ink`.
 *   - `dual-mode` — atmosphere supports both light and dark surfaces
 *     within the same page (e.g. minimal-clinical's paper hero with dark
 *     CTA strip). Generator emits both sets.
 *   - `passthrough` — atmosphere is `none` or zero-effects; generator
 *     emits whatever the brand palette implies, no atmosphere overrides.
 */
export type SurfaceProfile =
  | 'single-tone-light'
  | 'single-tone-dark'
  | 'dual-mode'
  | 'passthrough';

export interface AtmosphereManifestEntry {
  slug: Atmosphere;
  cssPath: string;
  themeMode: 'light' | 'dark' | null;
  /** One-line description for admin UI tooltips. */
  blurb: string;
  /** Short industries/verticals that naturally fit this atmosphere. */
  naturalFit: readonly string[];
  /**
   * Surface emission posture — see SurfaceProfile docstring.
   * The portal theme generator uses this to decide which surface tokens
   * to emit alongside the atmosphere CSS.
   */
  surfaceProfile: SurfaceProfile;
  /**
   * BDS-contract token pairings the atmosphere guarantees pass WCAG AA
   * for normal text (≥ 4.5:1) when layered over the deterministic theme
   * generator output. Empty array on `none` (atmosphere doesn't constrain
   * pairings; the generator's defaults apply).
   *
   * Source of truth for portal's `theme-contrast-check.ts` preflight
   * check #11 (W1-BDS handoff). Adding a pair here means the preflight
   * starts validating it; removing one means the preflight stops gating
   * on it.
   */
  safePairings: readonly SafePairing[];
}

// ── Canonical pairing sets ──────────────────────────────────────────
//
// Centralized so multiple atmospheres can share a posture without
// drifting (e.g. all single-tone-dark atmospheres share the same
// inverse-text-on-ink contract). Inline-extending these in a manifest
// entry stays correct — the runtime sees a SafePairing[] either way.

// Brand-fill button pairings split by themeMode. The brand-fill background
// is the saturated brand color in every theme, but the canonical text token
// that contrasts against it depends on theme dominance:
//
//   - Light-themed atmospheres pair brand fill with `--text-on-color-dark`
//     (the canonical "light text designed for dark colored fills"). The
//     portal theme generator's light-dominant branch overrides this token to
//     a brand-resolved light neutral.
//   - Dark-themed atmospheres pair brand fill with `--text-on-color-light`
//     (the canonical "dark text designed for light colored fills"). The
//     portal theme generator's dark-dominant branch overrides this token to
//     a brand-resolved dark neutral.
//
// `--text-on-brand` was retired in this release (brik-bds#299) — the
// canonical taxonomy `--text-on-color-{dark,light}` already covers the
// contract; the theme generator does the brand-luminance resolution.

/** Brand-fill pairings for light-themed atmospheres. */
const BASELINE_BRAND_PAIRINGS_LIGHT_THEME: SafePairing[] = [
  { fg: '--text-on-color-dark', bg: '--background-brand-primary',
    context: 'Brand-filled buttons / pills (default state) on a light page.' },
  { fg: '--text-on-color-dark', bg: '--background-brand-primary-hover',
    context: 'Brand-filled buttons / pills (hover state) on a light page.' },
  { fg: '--text-on-color-dark', bg: '--background-brand-primary-pressed',
    context: 'Brand-filled buttons / pills (pressed state) on a light page.' },
];

/** Brand-fill pairings for dark-themed atmospheres. */
const BASELINE_BRAND_PAIRINGS_DARK_THEME: SafePairing[] = [
  { fg: '--text-on-color-light', bg: '--background-brand-primary',
    context: 'Brand-filled buttons / pills (default state) on a dark page.' },
  { fg: '--text-on-color-light', bg: '--background-brand-primary-hover',
    context: 'Brand-filled buttons / pills (hover state) on a dark page.' },
  { fg: '--text-on-color-light', bg: '--background-brand-primary-pressed',
    context: 'Brand-filled buttons / pills (pressed state) on a dark page.' },
];

/** Pairings for light-dominant atmospheres (paper-on-X, X-on-paper). */
const LIGHT_TONE_PAIRINGS: SafePairing[] = [
  { fg: '--text-primary', bg: '--background-primary', context: 'Body copy on the dominant light surface.' },
  { fg: '--text-primary', bg: '--background-secondary', context: 'Body copy on alternating elevated surface.' },
  { fg: '--text-secondary', bg: '--background-primary', context: 'Secondary copy on light surface.' },
  { fg: '--text-muted', bg: '--background-primary', context: 'Captions / metadata on light surface.' },
  { fg: '--text-brand-primary', bg: '--background-primary', context: 'Brand-tinted heading or accent on light surface.' },
  { fg: '--text-inverse', bg: '--background-inverse', context: 'Inverse block (dark CTA strip on a light page).' },
];

/** Pairings for dark-dominant atmospheres (light text on ink). */
const DARK_TONE_PAIRINGS: SafePairing[] = [
  { fg: '--text-primary', bg: '--background-primary', context: 'Body copy on the dominant dark surface.' },
  { fg: '--text-primary', bg: '--background-secondary', context: 'Body copy on the next-lightest dark surface.' },
  { fg: '--text-primary', bg: '--background-tertiary', context: 'Body copy on the elevated dark surface.' },
  { fg: '--text-secondary', bg: '--background-primary', context: 'Secondary copy on dark surface.' },
  // text-muted on dark is intentionally NOT in the safe set — gray-400
  // on near-black sits at ~4.06:1 by the generator's default emission,
  // and the portal preflight catches that. Atmospheres that fix it
  // override the muted token themselves; until then, omit from safe.
  { fg: '--text-brand-primary', bg: '--background-primary', context: 'Brand accent text on dark surface.' },
  { fg: '--text-inverse', bg: '--background-inverse', context: 'Inverse block (light strip inside the dark page).' },
];

// ── Manifest ────────────────────────────────────────────────────────

export const ATMOSPHERE_MANIFEST: Record<Atmosphere, AtmosphereManifestEntry> = {
  'editorial-luxury': {
    slug: 'editorial-luxury',
    cssPath: '@brikdesigns/bds/atmospheres/editorial-luxury.css',
    themeMode: 'dark',
    blurb: 'Pure near-black + gold orbs + film grain. Quiet-luxury dark treatment.',
    naturalFit: ['luxury dental', 'med-aesthetic', 'editorial hospitality'],
    surfaceProfile: 'single-tone-dark',
    safePairings: [...DARK_TONE_PAIRINGS, ...BASELINE_BRAND_PAIRINGS_DARK_THEME],
  },
  'cinematic-dramatic': {
    slug: 'cinematic-dramatic',
    cssPath: '@brikdesigns/bds/atmospheres/cinematic-dramatic.css',
    themeMode: 'dark',
    blurb: 'Deep navy-black + aurora drift + conic spotlight. Theatrical dark.',
    naturalFit: ['legal', 'agency', 'finance', 'dark-mode SaaS'],
    surfaceProfile: 'single-tone-dark',
    safePairings: [...DARK_TONE_PAIRINGS, ...BASELINE_BRAND_PAIRINGS_DARK_THEME],
  },
  'minimal-clinical': {
    slug: 'minimal-clinical',
    cssPath: '@brikdesigns/bds/atmospheres/minimal-clinical.css',
    themeMode: 'light',
    blurb: 'Pure white, zero atmospheric effects. Trust via precision.',
    naturalFit: ['non-luxury healthcare', 'legal (gravitas)', 'minimal SaaS'],
    // Minimal-clinical commonly pairs a paper hero with a dark CTA
    // strip — both surface modes need to render legibly inside the
    // same page. The theme generator emits both surface tokens.
    surfaceProfile: 'dual-mode',
    safePairings: [...LIGHT_TONE_PAIRINGS, ...BASELINE_BRAND_PAIRINGS_LIGHT_THEME],
  },
  'warm-soft': {
    slug: 'warm-soft',
    cssPath: '@brikdesigns/bds/atmospheres/warm-soft.css',
    themeMode: 'light',
    blurb: 'Warm ivory + quiet rose vignette + minimal grain. Anxiety-safe.',
    naturalFit: ['wellness', 'therapy', 'mental health', 'recovery'],
    surfaceProfile: 'single-tone-light',
    safePairings: [...LIGHT_TONE_PAIRINGS, ...BASELINE_BRAND_PAIRINGS_LIGHT_THEME],
  },
  'clean-bright': {
    slug: 'clean-bright',
    cssPath: '@brikdesigns/bds/atmospheres/clean-bright.css',
    themeMode: 'light',
    blurb: 'Pure white. No effects. Brand lives in type and imagery.',
    naturalFit: ['SaaS', 'tech', 'startups', 'utility marketing'],
    surfaceProfile: 'single-tone-light',
    safePairings: [...LIGHT_TONE_PAIRINGS, ...BASELINE_BRAND_PAIRINGS_LIGHT_THEME],
  },
  'organic-textured': {
    slug: 'organic-textured',
    cssPath: '@brikdesigns/bds/atmospheres/organic-textured.css',
    themeMode: 'light',
    blurb: 'Warm cream + sepia grain + earth-tone tint. Tactile paper feel.',
    naturalFit: ['MUA', 'organic beauty', 'artisan', 'natural products'],
    surfaceProfile: 'single-tone-light',
    safePairings: [...LIGHT_TONE_PAIRINGS, ...BASELINE_BRAND_PAIRINGS_LIGHT_THEME],
  },
  'none': {
    slug: 'none',
    cssPath: '@brikdesigns/bds/atmospheres/none.css',
    themeMode: null,
    blurb: 'No atmosphere layer. Pure theme tokens only.',
    naturalFit: ['fallback', 'custom per-client overrides'],
    surfaceProfile: 'passthrough',
    // No atmosphere = no atmosphere-level guarantees. The portal
    // preflight falls back to its own default pairings list when
    // safePairings is empty.
    safePairings: [],
  },
};

/**
 * Resolve the @import path for an atmosphere slug. Used by the portal
 * theme generator to emit a canonical import reference into the stored
 * theme CSS artifact.
 */
export function getAtmosphereImportPath(atmosphere: Atmosphere): string {
  return ATMOSPHERE_MANIFEST[atmosphere].cssPath;
}

/**
 * Convenience accessor — returns the safePairings for a given atmosphere.
 * Returns an empty array when the slug is `none` or the atmosphere
 * declares no constraints; callers fall back to their own defaults.
 */
export function getAtmosphereSafePairings(atmosphere: Atmosphere): readonly SafePairing[] {
  return ATMOSPHERE_MANIFEST[atmosphere].safePairings;
}
