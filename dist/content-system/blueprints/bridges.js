import { DEFAULT_INDUSTRY_SLUG } from '../vocabularies';
/**
 * Two-taxonomy bridge — translates blueprint match tags into the
 * client-picks axes so the portal can query blueprints using the same
 * vocabulary a client uses in the onboarding form.
 *
 * The source of truth is still the blueprint author's `moods[]` and
 * `industries[]` picks. `personality[]`, `visualStyle[]`, and
 * `industrySlugs[]` are PROJECTIONS — derived at load time, never
 * hand-authored. See ARCHITECTURE.md for the rationale.
 *
 * Keep mappings **stable**. Changing a projection silently reshuffles
 * shortlists for every client; treat edits here as a minor version bump
 * on @brikdesigns/bds.
 */
/**
 * Mood → Personality projection.
 *
 * Every mood maps to at least one Personality. A single mood may map
 * to multiple personalities when the mood straddles axes (e.g. `luxury`
 * reinforces both `Luxury` and `Refined`).
 */
export const MOOD_TO_PERSONALITY = {
    bold: ['Bold'],
    minimal: ['Minimal'],
    warm: ['Warm'],
    corporate: ['Corporate'],
    playful: ['Playful'],
    luxury: ['Luxury', 'Refined'],
    trustworthy: ['Trustworthy'],
    energetic: ['Energetic'],
    professional: ['Professional'],
    modern: ['Modern'],
    approachable: ['Approachable'],
};
/**
 * Mood → VisualStyle projection.
 *
 * Not every mood has a VisualStyle equivalent — `warm`, `trustworthy`,
 * `professional`, and `approachable` are brand-feel moods with no direct
 * visual correlate. An empty array is explicit, not a bug.
 */
export const MOOD_TO_VISUAL_STYLE = {
    bold: ['Bold'],
    minimal: ['Minimal'],
    warm: [],
    corporate: ['Classic'],
    playful: ['Playful'],
    luxury: ['Luxurious'],
    trustworthy: [],
    energetic: ['Colorful'],
    professional: [],
    modern: ['Modern'],
    approachable: [],
};
/**
 * Industry tag → Industry pack slug.
 *
 * 15 match tags collapse to 3 pack slugs per the small-business
 * promotion policy. `universal` is sentinel-only — it should never
 * trigger a pack lookup (a universal blueprint fits every pack).
 */
export const INDUSTRY_TAG_TO_SLUG = {
    universal: 'universal',
    healthcare: DEFAULT_INDUSTRY_SLUG,
    real_estate: 'real-estate-rv-mhc',
    legal: DEFAULT_INDUSTRY_SLUG,
    finance: DEFAULT_INDUSTRY_SLUG,
    saas: DEFAULT_INDUSTRY_SLUG,
    ecommerce: DEFAULT_INDUSTRY_SLUG,
    beauty: DEFAULT_INDUSTRY_SLUG,
    salon: DEFAULT_INDUSTRY_SLUG,
    hospitality: DEFAULT_INDUSTRY_SLUG,
    restaurant: DEFAULT_INDUSTRY_SLUG,
    luxury: DEFAULT_INDUSTRY_SLUG,
    corporate: DEFAULT_INDUSTRY_SLUG,
    dental: 'dental',
    veterinary: DEFAULT_INDUSTRY_SLUG,
};
/**
 * Project a mood set onto the Personality axis.
 * Returns a deduplicated, order-preserving array.
 */
export function projectMoodsToPersonality(moods) {
    const seen = new Set();
    const out = [];
    for (const mood of moods) {
        for (const personality of MOOD_TO_PERSONALITY[mood]) {
            if (!seen.has(personality)) {
                seen.add(personality);
                out.push(personality);
            }
        }
    }
    return out;
}
/**
 * Project a mood set onto the VisualStyle axis.
 * Returns a deduplicated, order-preserving array.
 */
export function projectMoodsToVisualStyle(moods) {
    const seen = new Set();
    const out = [];
    for (const mood of moods) {
        for (const style of MOOD_TO_VISUAL_STYLE[mood]) {
            if (!seen.has(style)) {
                seen.add(style);
                out.push(style);
            }
        }
    }
    return out;
}
/**
 * Project an industry tag set onto the Industry pack slug axis.
 *
 * Filters out `universal` (which is sentinel-only) and dedupes. Returns
 * an empty array if the blueprint is universal-only — the resolver
 * should treat that as "fits every pack" rather than "fits none."
 */
export function projectIndustryTagsToSlugs(tags) {
    const seen = new Set();
    const out = [];
    for (const tag of tags) {
        const mapped = INDUSTRY_TAG_TO_SLUG[tag];
        if (mapped === 'universal')
            continue;
        if (!seen.has(mapped)) {
            seen.add(mapped);
            out.push(mapped);
        }
    }
    return out;
}
/**
 * True when the tag set contains `universal`. The resolver uses this
 * to ensure these blueprints surface regardless of industry slug match.
 */
export function isUniversalIndustryFit(tags) {
    return tags.includes('universal');
}
//# sourceMappingURL=bridges.js.map