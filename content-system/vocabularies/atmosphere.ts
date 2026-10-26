/**
 * Atmosphere — the canonical CSS layer that sits on top of a client's
 * theme to add editorial-luxury / soft-wellness / organic-paper etc.
 * visual character through radial blurs, film grain, vignettes, and
 * ambient glows.
 *
 * Atmospheres are mode-agnostic decoration (brik-bds#2818). None sets a
 * surface or text colour — every glow and vignette is built from the
 * client's own tokens via color-mix(), so each works on a light or a dark
 * page. The one mode-specific detail is the grain blend mode, which each
 * grain atmosphere keys to `:root[data-theme="dark"]` in its CSS. Light or
 * dark is set only by `theme_mode` on company_profiles (see THEME_MODE_VALUES).
 *
 * The portal's `generate-theme-css.ts` inlines the chosen atmosphere's CSS
 * into the stored theme artifact (it does not @import it); the consumer
 * Astro site pulls the theme artifact at build time and cascades
 * automatically.
 *
 * Atmospheres are orthogonal to the navigation archetype (see NAV_ARCHETYPE_VALUES)
 * and to the blueprint library — they're pure CSS layer decisions, not
 * layout or IA. Naming is editorial vocabulary, not literal CSS.
 *
 * Semantics:
 *
 *   editorial-luxury
 *     Atmospheric radial orbs from the brand colour (blurred 120px), SVG
 *     Perlin film grain at 32% opacity (multiply on light, overlay on
 *     dark), cursor-tracking spotlights on interactive cards, section-edge
 *     vignettes. The "quiet luxury" treatment — hero photography breathes,
 *     depth comes from blur + noise rather than surface shifts.
 *     Fit: luxury dental, med-aesthetic, editorial hospitality.
 *
 *   cinematic-dramatic
 *     Aurora drift gradients in cool tones, centered radial glow behind
 *     hero, section-edge vignettes for "page-turn" feel, conic rotating
 *     spotlight. No grain. More theatrical than editorial-luxury.
 *     Fit: legal, agency, SaaS, finance.
 *
 *   warm-soft
 *     Single top-left radial vignette in rose, reduced grain (15%
 *     opacity; multiply on light, screen on dark), no depth orbs.
 *     Fit: wellness, therapy, mental health, recovery, palliative care.
 *
 *   organic-textured
 *     SVG grain at 40% opacity (multiply on light, screen on dark),
 *     subtle earth-tone radial tint. Textured-paper feel without going
 *     fully cinematic.
 *     Fit: MUA, organic/natural products, artisan brands, beauty editorial.
 *
 *   none
 *     No atmosphere layer. Renders as pure theme tokens with zero
 *     additional CSS. Fallback for clients who haven't picked or don't
 *     want an atmospheric layer.
 *
 *   clean-bright, minimal-clinical (deprecated)
 *     Both emit zero CSS — two names for `none`. Kept in the vocabulary
 *     until DEPRECATED_ATMOSPHERES[slug].removeIn so stored profile rows
 *     still validate; migrate them to `none`.
 */
export const ATMOSPHERE_VALUES = [
  'editorial-luxury',
  'cinematic-dramatic',
  'minimal-clinical',
  'warm-soft',
  'clean-bright',
  'organic-textured',
  'none',
] as const;

export type Atmosphere = (typeof ATMOSPHERE_VALUES)[number];

export const isAtmosphere = (value: string): value is Atmosphere =>
  (ATMOSPHERE_VALUES as readonly string[]).includes(value);

/**
 * Atmospheres kept for stored-row compatibility only. Both emit zero CSS
 * (comments only), so `none` is the replacement. Slated for removal in
 * `removeIn` (the next major, per the BDS deprecation cycle); migrate
 * `company_profiles.atmosphere` to `none` before then.
 * Tracked in brik-bds#2818.
 */
export const DEPRECATED_ATMOSPHERES = {
  'clean-bright': { replacedBy: 'none', removeIn: '1.0.0' },
  'minimal-clinical': { replacedBy: 'none', removeIn: '1.0.0' },
} as const satisfies Partial<Record<Atmosphere, { replacedBy: Atmosphere; removeIn: string }>>;


/**
 * Theme mode — the light/dark axis that atmospheres compose with.
 *
 * `theme_mode` is a sibling column on company_profiles and the only source
 * of light or dark. Every atmosphere works with both modes.
 */
export const THEME_MODE_VALUES = ['light', 'dark'] as const;

export type ThemeMode = (typeof THEME_MODE_VALUES)[number];

export const isThemeMode = (value: string): value is ThemeMode =>
  (THEME_MODE_VALUES as readonly string[]).includes(value);

/**
 * @deprecated Advisory only — atmospheres are mode-agnostic and set no
 * colour, so the page mode is the client's `theme_mode`, never the
 * atmosphere's. Nothing may derive, filter, or overwrite a mode from this
 * map. Removed with the deprecated atmospheres (see DEPRECATED_ATMOSPHERES).
 */
export const ATMOSPHERE_THEME_MODE: Record<Atmosphere, ThemeMode | null> = {
  'editorial-luxury': 'dark',
  'cinematic-dramatic': 'dark',
  'minimal-clinical': 'light',
  'warm-soft': 'light',
  'clean-bright': 'light',
  'organic-textured': 'light',
  'none': null,
};
