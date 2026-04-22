/**
 * Atmosphere manifest — maps atmosphere slug to its CSS asset path.
 *
 * Consumers (portal generate-theme-css.ts, docs renderers) can read this
 * to resolve the canonical @import path for an atmosphere without
 * string-building by hand.
 *
 * CSS files live as siblings and are exported through the package
 * exports field in package.json under `./atmospheres/*.css`.
 */
export const ATMOSPHERE_MANIFEST = {
    'editorial-luxury': {
        slug: 'editorial-luxury',
        cssPath: '@brikdesigns/bds/atmospheres/editorial-luxury.css',
        themeMode: 'dark',
        blurb: 'Pure near-black + gold orbs + film grain. Quiet-luxury dark treatment.',
        naturalFit: ['luxury dental', 'med-aesthetic', 'editorial hospitality'],
    },
    'cinematic-dramatic': {
        slug: 'cinematic-dramatic',
        cssPath: '@brikdesigns/bds/atmospheres/cinematic-dramatic.css',
        themeMode: 'dark',
        blurb: 'Deep navy-black + aurora drift + conic spotlight. Theatrical dark.',
        naturalFit: ['legal', 'agency', 'finance', 'dark-mode SaaS'],
    },
    'minimal-clinical': {
        slug: 'minimal-clinical',
        cssPath: '@brikdesigns/bds/atmospheres/minimal-clinical.css',
        themeMode: 'light',
        blurb: 'Pure white, zero atmospheric effects. Trust via precision.',
        naturalFit: ['non-luxury healthcare', 'legal (gravitas)', 'minimal SaaS'],
    },
    'warm-soft': {
        slug: 'warm-soft',
        cssPath: '@brikdesigns/bds/atmospheres/warm-soft.css',
        themeMode: 'light',
        blurb: 'Warm ivory + quiet rose vignette + minimal grain. Anxiety-safe.',
        naturalFit: ['wellness', 'therapy', 'mental health', 'recovery'],
    },
    'clean-bright': {
        slug: 'clean-bright',
        cssPath: '@brikdesigns/bds/atmospheres/clean-bright.css',
        themeMode: 'light',
        blurb: 'Pure white. No effects. Brand lives in type and imagery.',
        naturalFit: ['SaaS', 'tech', 'startups', 'utility marketing'],
    },
    'organic-textured': {
        slug: 'organic-textured',
        cssPath: '@brikdesigns/bds/atmospheres/organic-textured.css',
        themeMode: 'light',
        blurb: 'Warm cream + sepia grain + earth-tone tint. Tactile paper feel.',
        naturalFit: ['MUA', 'organic beauty', 'artisan', 'natural products'],
    },
    'none': {
        slug: 'none',
        cssPath: '@brikdesigns/bds/atmospheres/none.css',
        themeMode: null,
        blurb: 'No atmosphere layer. Pure theme tokens only.',
        naturalFit: ['fallback', 'custom per-client overrides'],
    },
};
/**
 * Resolve the @import path for an atmosphere slug. Used by the portal
 * theme generator to emit a canonical import reference into the stored
 * theme CSS artifact.
 */
export function getAtmosphereImportPath(atmosphere) {
    return ATMOSPHERE_MANIFEST[atmosphere].cssPath;
}
//# sourceMappingURL=index.js.map