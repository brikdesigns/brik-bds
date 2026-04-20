/**
 * BDS Blueprint Library — public surface.
 *
 * Blueprints are named layout + interaction patterns that ground AI
 * mockup generation with concrete structural constraints. Consumers
 * load `blueprint-library.json`, run it through `validateBlueprintLibrary`,
 * then `normalizeBlueprintLibrary` to get the query-ready records.
 *
 * This module owns the *shape* of the library — vocabularies, schema,
 * bridges. The JSON data itself will ship in `brik-bds/blueprints/`
 * (outside the TS build) and be loaded at runtime by consumers.
 */
export { MOOD_VALUES, INDUSTRY_TAG_VALUES, SECTION_TYPE_VALUES, PATTERN_TYPE_VALUES, BLUEPRINT_TIER_VALUES, isMood, isIndustryTag, isSectionType, isPatternType, isBlueprintTier, type Mood, type IndustryTag, type SectionType, type PatternType, type BlueprintTier, } from './vocabularies';
export { MOOD_TO_PERSONALITY, MOOD_TO_VISUAL_STYLE, INDUSTRY_TAG_TO_SLUG, projectMoodsToPersonality, projectMoodsToVisualStyle, projectIndustryTagsToSlugs, isUniversalIndustryFit, } from './bridges';
export { validateBlueprint, validateBlueprintLibrary, normalizeBlueprint, normalizeBlueprintLibrary, type Blueprint, type NormalizedBlueprint, type BlueprintLibrary, type ValidationIssue, type ValidationResult, } from './schema';
export { SHORTLIST_WEIGHTS, scoreBlueprintForProfile, resolveBlueprintShortlist, resolveBlueprintShortlistWithScores, type BlueprintShortlistProfile, type BlueprintShortlistEntry, type ResolveBlueprintShortlistOptions, } from './resolver';
//# sourceMappingURL=index.d.ts.map