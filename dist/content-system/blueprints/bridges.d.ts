import type { Personality, VisualStyle, IndustrySlug } from '../vocabularies';
import type { Mood, IndustryTag } from './vocabularies';
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
export declare const MOOD_TO_PERSONALITY: Record<Mood, readonly Personality[]>;
/**
 * Mood → VisualStyle projection.
 *
 * Not every mood has a VisualStyle equivalent — `warm`, `trustworthy`,
 * `professional`, and `approachable` are brand-feel moods with no direct
 * visual correlate. An empty array is explicit, not a bug.
 */
export declare const MOOD_TO_VISUAL_STYLE: Record<Mood, readonly VisualStyle[]>;
/**
 * Industry tag → Industry pack slug.
 *
 * 15 match tags collapse to 3 pack slugs per the small-business
 * promotion policy. `universal` is sentinel-only — it should never
 * trigger a pack lookup (a universal blueprint fits every pack).
 */
export declare const INDUSTRY_TAG_TO_SLUG: Record<IndustryTag, IndustrySlug | 'universal'>;
/**
 * Project a mood set onto the Personality axis.
 * Returns a deduplicated, order-preserving array.
 */
export declare function projectMoodsToPersonality(moods: readonly Mood[]): readonly Personality[];
/**
 * Project a mood set onto the VisualStyle axis.
 * Returns a deduplicated, order-preserving array.
 */
export declare function projectMoodsToVisualStyle(moods: readonly Mood[]): readonly VisualStyle[];
/**
 * Project an industry tag set onto the Industry pack slug axis.
 *
 * Filters out `universal` (which is sentinel-only) and dedupes. Returns
 * an empty array if the blueprint is universal-only — the resolver
 * should treat that as "fits every pack" rather than "fits none."
 */
export declare function projectIndustryTagsToSlugs(tags: readonly IndustryTag[]): readonly IndustrySlug[];
/**
 * True when the tag set contains `universal`. The resolver uses this
 * to ensure these blueprints surface regardless of industry slug match.
 */
export declare function isUniversalIndustryFit(tags: readonly IndustryTag[]): boolean;
//# sourceMappingURL=bridges.d.ts.map