/**
 * Atmosphere — the canonical CSS layer that sits on top of a client's
 * theme to add dark-luxury-editorial / soft-wellness / clean-clinical etc.
 * visual character through radial blurs, film grain, vignettes, and
 * ambient glows.
 *
 * Paired with `theme_mode` on company_profiles (dark | light) and consumed
 * by the portal's `generate-theme-css.ts` at theme-extraction time. The
 * generated theme CSS references the chosen atmosphere via @import from
 * `@brikdesigns/bds/atmospheres/{atmosphere}.css`; the consumer Astro site
 * pulls the theme artifact at build time and cascades automatically.
 *
 * Atmospheres are orthogonal to the navigation archetype (see NAV_ARCHETYPE_VALUES)
 * and to the blueprint library — they're pure CSS layer decisions, not
 * layout or IA. Naming is editorial vocabulary, not literal CSS.
 *
 * Semantics:
 *
 *   editorial-luxury (dark)
 *     Pure near-black surfaces (#08080a), atmospheric gold radial orbs
 *     (blurred 120px), SVG Perlin film grain at 32% opacity + overlay,
 *     cursor-tracking spotlights on interactive cards, section-edge
 *     vignettes. The "quiet luxury" treatment — hero photography breathes,
 *     depth comes from blur + noise rather than surface shifts.
 *     Fit: luxury dental, med-aesthetic, editorial hospitality.
 *     Reference: web/birdwell-mutlak (pre-migration brand-overrides.css).
 *
 *   cinematic-dramatic (dark)
 *     Deeper navy-black base (#060612), aurora drift gradients in cool
 *     tones, centered radial glow behind hero, section-edge vignettes
 *     for "page-turn" feel, conic rotating spotlight. More theatrical
 *     than editorial-luxury — leans dramatic instead of quiet.
 *     Fit: legal, agency, dark-mode SaaS, finance.
 *
 *   minimal-clinical (light)
 *     Pure white surfaces, no ambient effects, high contrast type,
 *     no blurs or grain. The opposite of editorial-luxury — trust comes
 *     from precision, not atmosphere.
 *     Fit: healthcare practices that aren't aiming luxury, legal where
 *     gravitas > editorial, SaaS/tech with minimal aesthetic.
 *
 *   warm-soft (light)
 *     Warm ivory base (#fbf7f0), single top-left radial vignette in
 *     rose/terracotta, reduced grain (15% opacity), no depth orbs.
 *     Calmer than minimal-clinical; quieter than organic-textured.
 *     Fit: wellness, therapy, mental health, recovery, palliative care.
 *
 *   clean-bright (light)
 *     Pure white (#ffffff) with zero atmospheric effects. Visual interest
 *     comes entirely from typography, imagery, and color accents —
 *     nothing layered behind or over content.
 *     Fit: SaaS, tech, startups, utility-focused marketing.
 *
 *   organic-textured (light)
 *     Warm cream base (#f5efe6), SVG grain at 40% opacity with sepia
 *     multiply, subtle earth-tone radial tint. Textured-paper feel
 *     without going fully cinematic.
 *     Fit: MUA, organic/natural products, artisan brands, beauty editorial.
 *
 *   none
 *     No atmosphere layer. Renders as pure theme tokens with zero
 *     additional CSS. Fallback for clients who haven't picked or don't
 *     want an atmospheric layer; also the default when theme_mode is null.
 */
export const ATMOSPHERE_VALUES = [
    'editorial-luxury',
    'cinematic-dramatic',
    'minimal-clinical',
    'warm-soft',
    'clean-bright',
    'organic-textured',
    'none',
];
export const isAtmosphere = (value) => ATMOSPHERE_VALUES.includes(value);
/**
 * Theme mode — the light/dark axis that atmospheres compose with.
 *
 * `theme_mode` is a sibling column on company_profiles, picked by the admin
 * at intel-tab time. Not every atmosphere works with every mode — e.g.
 * editorial-luxury assumes dark; clean-bright assumes light. See
 * ATMOSPHERE_THEME_MODE below for the natural pairings.
 */
export const THEME_MODE_VALUES = ['light', 'dark'];
export const isThemeMode = (value) => THEME_MODE_VALUES.includes(value);
/**
 * Natural theme_mode pairing for each atmosphere. The portal UI can use
 * this to auto-set or hint the correct `theme_mode` when the admin picks
 * an atmosphere. Not a hard constraint — clients can override.
 */
export const ATMOSPHERE_THEME_MODE = {
    'editorial-luxury': 'dark',
    'cinematic-dramatic': 'dark',
    'minimal-clinical': 'light',
    'warm-soft': 'light',
    'clean-bright': 'light',
    'organic-textured': 'light',
    'none': null,
};
//# sourceMappingURL=atmosphere.js.map