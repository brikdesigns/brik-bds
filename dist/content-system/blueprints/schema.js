import { isMood, isIndustryTag, isSectionType, isPatternType, isBlueprintTier, } from './vocabularies';
import { projectMoodsToPersonality, projectMoodsToVisualStyle, projectIndustryTagsToSlugs, } from './bridges';
/**
 * Validate a Blueprint authored entry against the locked vocabularies.
 * Dependency-free — returns a diagnostic bundle instead of throwing,
 * so callers can surface all drift in one pass.
 */
export function validateBlueprint(bp) {
    const issues = [];
    const push = (field, message) => issues.push({ key: bp.key, field, message });
    if (!bp.key || !/^[a-z][a-z0-9_]*$/.test(bp.key)) {
        push('key', `Invalid key "${bp.key}" — must be snake_case lowercase.`);
    }
    if (!bp.name?.trim())
        push('name', 'Name is required.');
    if (!isSectionType(bp.section_type)) {
        push('section_type', `Unknown section_type "${bp.section_type}".`);
    }
    if (!Array.isArray(bp.moods) || bp.moods.length === 0) {
        push('moods', 'At least one mood is required.');
    }
    else {
        for (const m of bp.moods) {
            if (!isMood(m))
                push('moods', `Unknown mood "${m}".`);
        }
    }
    if (!Array.isArray(bp.industries) || bp.industries.length === 0) {
        push('industries', 'At least one industry tag is required.');
    }
    else {
        for (const i of bp.industries) {
            if (!isIndustryTag(i))
                push('industries', `Unknown industry tag "${i}".`);
        }
    }
    if (!bp.layout_spec?.trim() && !bp.pattern_spec?.trim()) {
        push('layout_spec', 'Must have either layout_spec or pattern_spec — a blueprint with neither describes nothing.');
    }
    if (bp.pattern_type !== undefined && !isPatternType(bp.pattern_type)) {
        push('pattern_type', `Unknown pattern_type "${bp.pattern_type}".`);
    }
    if (!isBlueprintTier(bp.tier)) {
        push('tier', `Unknown tier "${bp.tier}".`);
    }
    if (!/^\d+\.\d+\.\d+/.test(bp.version ?? '')) {
        push('version', `Invalid semver "${bp.version}".`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(bp.last_reviewed ?? '')) {
        push('last_reviewed', `Invalid ISO date "${bp.last_reviewed}".`);
    }
    return { ok: issues.length === 0, issues };
}
/**
 * Validate a whole library envelope. Returns the flattened issue list
 * across every blueprint plus any envelope-level problems.
 */
export function validateBlueprintLibrary(library) {
    const issues = [];
    if (!/^\d+\.\d+\.\d+/.test(library.version ?? '')) {
        issues.push({
            key: '<library>',
            field: 'version',
            message: `Invalid semver "${library.version}".`,
        });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(library.last_reviewed ?? '')) {
        issues.push({
            key: '<library>',
            field: 'last_reviewed',
            message: `Invalid ISO date "${library.last_reviewed}".`,
        });
    }
    const seen = new Set();
    for (const bp of library.blueprints) {
        if (seen.has(bp.key)) {
            issues.push({
                key: bp.key,
                field: 'key',
                message: `Duplicate key "${bp.key}".`,
            });
        }
        seen.add(bp.key);
        const result = validateBlueprint(bp);
        issues.push(...result.issues);
    }
    // Sanity-check bridges — if a valid projection field accidentally lands
    // in the authored data, catch it before it shadows the derived value.
    for (const bp of library.blueprints) {
        for (const field of ['personality', 'visual_style', 'industry_slugs']) {
            if (bp[field] !== undefined) {
                issues.push({
                    key: bp.key,
                    field,
                    message: `Projection field "${field}" is derived — remove from source JSON.`,
                });
            }
        }
    }
    return { ok: issues.length === 0, issues };
}
/**
 * Normalize an authored Blueprint by attaching derived projection fields.
 * Assumes the input has already been validated; callers should run
 * `validateBlueprint` first or gate on `validateBlueprintLibrary`.
 */
export function normalizeBlueprint(bp) {
    return {
        ...bp,
        personality: projectMoodsToPersonality(bp.moods),
        visual_style: projectMoodsToVisualStyle(bp.moods),
        industry_slugs: projectIndustryTagsToSlugs(bp.industries),
        is_universal: bp.industries.includes('universal'),
    };
}
/**
 * Normalize every entry in a library. Safe to call after
 * `validateBlueprintLibrary` reports `ok: true`.
 */
export function normalizeBlueprintLibrary(library) {
    return library.blueprints.map(normalizeBlueprint);
}
//# sourceMappingURL=schema.js.map