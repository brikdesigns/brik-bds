import type { Atmosphere, ThemeMode } from './atmosphere';
import type { AnimationTier } from './animation-tier';
import type { SpacingMode } from './spacing-mode';
import type { TypographyMode } from './typography-mode';
import type { RadiusMode } from './radius-mode';
import type { ElevationMode } from './elevation-mode';
import type { BorderWidthMode } from './borderwidth-mode';

/**
 * Visual Style — the 13 canonical style directions captured in the client portal.
 *
 * Drives theme token selection (palette density, typography, spacing),
 * imagery treatment, and blueprint shortlist trimming. Distinct from
 * Personality — a "Playful" personality can be expressed in a "Minimal"
 * visual style, and those tradeoffs are where craftwork lives.
 *
 * Clients pick up to 3. "Minimal" and "Playful" also appear in Personality;
 * "Luxurious" overlaps with Personality's "Luxury" (intentional — singular
 * adjective form in Personality, adverbial form here).
 *
 * Ordering mirrors the portal's onboarding picker so the eventual
 * `taxonomy.ts` → BCS import swap is a zero-reorder change.
 */
export const VISUAL_STYLE_VALUES = [
  'Minimal',
  'Bold',
  'Editorial',
  'Playful',
  'Luxurious',
  'Modern',
  'Classic',
  'Dark',
  'Light',
  'Colorful',
  'Monochrome',
  'Textural',
  'Brutalist',
] as const;

export type VisualStyle = (typeof VISUAL_STYLE_VALUES)[number];

export const isVisualStyle = (value: string): value is VisualStyle =>
  (VISUAL_STYLE_VALUES as readonly string[]).includes(value);

/**
 * What a Visual Style decides. Every key is optional: an omitted key means the
 * style decides nothing on that axis, and the consumer leaves it at its own
 * default (for the expression modes that is the attribute-absent state,
 * ADR-039 § A1 — the defaults are not vocabulary members, so they cannot be
 * named here). A preset never sets a colour, font or logo; those come from the
 * client theme.
 */
export interface VisualStylePreset {
  themeMode?: ThemeMode;
  atmosphere?: Atmosphere;
  spacingMode?: SpacingMode;
  typographyMode?: TypographyMode;
  radiusMode?: RadiusMode;
  elevationMode?: ElevationMode;
  borderWidthMode?: BorderWidthMode;
  animationTier?: AnimationTier;
}

/**
 * One preset per Visual Style (ADR-048 § 7, brik-llm ADR-050 decision A: BDS
 * owns the vocabulary, the portal imports it). Content ratified by the
 * operator on brik-bds#3007, 2026-11-05. `minimal-clinical` and `clean-bright`
 * are deprecated aliases of `none` (DEPRECATED_ATMOSPHERES), so a style that
 * wants no atmosphere layer says `none`.
 */
export const VISUAL_STYLE_PRESETS: Readonly<Record<VisualStyle, VisualStylePreset>> = {
  Minimal:    { themeMode: 'light', atmosphere: 'none', spacingMode: 'spacious', typographyMode: 'comfortable', radiusMode: 'sharp', elevationMode: 'flat', borderWidthMode: 'thin', animationTier: 'subtle' },
  Bold:       { atmosphere: 'cinematic-dramatic', spacingMode: 'comfortable', typographyMode: 'expressive', radiusMode: 'sharp', elevationMode: 'dramatic', borderWidthMode: 'thick', animationTier: 'expressive' },
  Editorial:  { themeMode: 'light', atmosphere: 'editorial-luxury', spacingMode: 'spacious', typographyMode: 'spacious', radiusMode: 'sharp', elevationMode: 'flat', borderWidthMode: 'thin', animationTier: 'moderate' },
  Playful:    { themeMode: 'light', atmosphere: 'warm-soft', spacingMode: 'comfortable', typographyMode: 'expressive', radiusMode: 'pill', elevationMode: 'lifted', animationTier: 'expressive' },
  Luxurious:  { atmosphere: 'editorial-luxury', spacingMode: 'spacious', typographyMode: 'spacious', radiusMode: 'sharp', elevationMode: 'lifted', borderWidthMode: 'thin', animationTier: 'subtle' },
  Modern:     { themeMode: 'light', atmosphere: 'none', spacingMode: 'comfortable', typographyMode: 'comfortable', radiusMode: 'round', elevationMode: 'lifted', borderWidthMode: 'thin', animationTier: 'moderate' },
  Classic:    { themeMode: 'light', atmosphere: 'warm-soft', spacingMode: 'comfortable', typographyMode: 'comfortable', radiusMode: 'round', elevationMode: 'lifted', borderWidthMode: 'thin', animationTier: 'subtle' },
  Dark:       { themeMode: 'dark', atmosphere: 'cinematic-dramatic', animationTier: 'moderate' },
  Light:      { themeMode: 'light', atmosphere: 'none' },
  Colorful:   { themeMode: 'light', atmosphere: 'warm-soft', spacingMode: 'comfortable', typographyMode: 'expressive', radiusMode: 'round', elevationMode: 'lifted', animationTier: 'expressive' },
  Monochrome: { atmosphere: 'none', spacingMode: 'comfortable', typographyMode: 'comfortable', radiusMode: 'sharp', elevationMode: 'flat', borderWidthMode: 'thin', animationTier: 'subtle' },
  Textural:   { themeMode: 'light', atmosphere: 'organic-textured', spacingMode: 'comfortable', typographyMode: 'comfortable', radiusMode: 'round', elevationMode: 'lifted', borderWidthMode: 'thick', animationTier: 'moderate' },
  Brutalist:  { themeMode: 'light', atmosphere: 'none', spacingMode: 'compact', typographyMode: 'comfortable', radiusMode: 'sharp', elevationMode: 'flat', borderWidthMode: 'thick', animationTier: 'subtle' },
};

/**
 * Reference imagery registry.
 *
 * A Visual Style can be represented by multiple example images — a pure
 * primary expression, the same style with a modifier layered on, different
 * client executions over time. Keeping this a list (not a Record<VisualStyle>)
 * means you can add rows without re-classifying existing values, and one
 * style can carry many examples as the design library grows.
 *
 * `modifierStyles` is empty for a pure expression, or carries 1–2 other
 * VisualStyle values to describe a composition ("Minimal × Colorful").
 * Paper's `bds-theming` file (01KPH6ANXVEPBJ4PAVB7V380JH) is the current
 * source for the imagery; a follow-up PR exports each artboard as PNG and
 * populates `referenceImageUrl`.
 *
 * Consumers:
 *   - Storybook MDX (Content System / Visual Styles / {slug})
 *   - Portal onboarding picker (thumbnail + caption next to each option)
 *   - Client-facing proposals and mood boards
 */
export interface VisualStyleExample {
  /** The dominant style this example expresses. */
  primaryStyle: VisualStyle;
  /**
   * Zero or more styles layered over `primaryStyle`. Empty for a pure
   * expression. Modifier order is significant (first pick dominates).
   */
  modifierStyles: readonly VisualStyle[];
  /** Canonical hosted URL of the reference image (PNG/WEBP). */
  referenceImageUrl: string;
  /**
   * Optional source URL that inspired the composition (Webflow template,
   * published site, etc). Preserved for attribution + follow-up research.
   */
  referenceSiteUrl?: string;
  /** Optional human-readable caption — "Minimal × Colorful — soft take". */
  caption?: string;
}

/**
 * Image URLs resolve to `.storybook/public/visual-styles/*.png` hosted at
 * `https://storybook.brikdesigns.com/visual-styles/{file}`. Source artboards
 * live in Paper `bds-theming` (file 01KPH6ANXVEPBJ4PAVB7V380JH).
 *
 * See `.storybook/public/visual-styles/README.md` for the export drop-in
 * convention (filenames + source artboard IDs).
 */
const IMG_BASE = 'https://storybook.brikdesigns.com/visual-styles';

export const VISUAL_STYLE_EXAMPLES: readonly VisualStyleExample[] = [
  { primaryStyle: 'Minimal',    modifierStyles: [], referenceImageUrl: `${IMG_BASE}/minimal.png`,    referenceSiteUrl: 'https://leadify-template.webflow.io' },
  { primaryStyle: 'Bold',       modifierStyles: [], referenceImageUrl: `${IMG_BASE}/bold.png`,       caption: 'Contemporary display poster' },
  { primaryStyle: 'Editorial',  modifierStyles: [], referenceImageUrl: `${IMG_BASE}/editorial.png`,  caption: 'Magazine feature story' },
  { primaryStyle: 'Playful',    modifierStyles: [], referenceImageUrl: `${IMG_BASE}/playful.png`,    referenceSiteUrl: 'https://pizza-guy.webflow.io' },
  { primaryStyle: 'Luxurious',  modifierStyles: [], referenceImageUrl: `${IMG_BASE}/luxurious.png`,  referenceSiteUrl: 'https://villabliss-wbs.webflow.io' },
  { primaryStyle: 'Modern',     modifierStyles: [], referenceImageUrl: `${IMG_BASE}/modern.png`,     referenceSiteUrl: 'https://gradienttemplates.webflow.io' },
  { primaryStyle: 'Classic',    modifierStyles: [], referenceImageUrl: `${IMG_BASE}/classic.png`,    caption: 'Editorial masthead tradition' },
  { primaryStyle: 'Brutalist',  modifierStyles: [], referenceImageUrl: `${IMG_BASE}/brutalist.png`,  referenceSiteUrl: 'https://blacksmith-sbj.webflow.io' },
  // Modifier-demo compositions from Paper bds-theming
  { primaryStyle: 'Modern',     modifierStyles: ['Dark'],       referenceImageUrl: `${IMG_BASE}/modern-dark.png`,       caption: 'Modern × Dark' },
  { primaryStyle: 'Brutalist',  modifierStyles: ['Light'],      referenceImageUrl: `${IMG_BASE}/brutalist-light.png`,   caption: 'Brutalist × Light' },
  { primaryStyle: 'Minimal',    modifierStyles: ['Colorful'],   referenceImageUrl: `${IMG_BASE}/minimal-colorful.png`,  caption: 'Minimal × Colorful' },
  { primaryStyle: 'Luxurious',  modifierStyles: ['Monochrome'], referenceImageUrl: `${IMG_BASE}/luxurious-monochrome.png`, caption: 'Luxurious × Monochrome' },
  { primaryStyle: 'Classic',    modifierStyles: ['Textural'],   referenceImageUrl: `${IMG_BASE}/classic-textural.png`,  caption: 'Classic × Textural' },
];

/**
 * All examples that feature `style` as the primary or as a modifier.
 * Used by Storybook per-style pages and the portal onboarding picker.
 */
export const getVisualStyleExamples = (
  style: VisualStyle,
): readonly VisualStyleExample[] =>
  VISUAL_STYLE_EXAMPLES.filter(
    (ex) => ex.primaryStyle === style || ex.modifierStyles.includes(style),
  );

/**
 * The canonical "pure" example for a style — first entry where the style
 * is the primary and there are no modifiers. Returns undefined if the
 * style has no standalone example authored yet.
 */
export const getPrimaryVisualStyleExample = (
  style: VisualStyle,
): VisualStyleExample | undefined =>
  VISUAL_STYLE_EXAMPLES.find(
    (ex) => ex.primaryStyle === style && ex.modifierStyles.length === 0,
  );
