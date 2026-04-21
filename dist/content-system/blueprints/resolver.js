/**
 * Per-axis weights for the shortlist scorer. Exported so the portal
 * can run the same math against the same numbers — drift between
 * "what BDS considers a match" and "what the portal thinks it did"
 * is the whole reason this helper lives in BDS.
 *
 * Tuned so industry match > personality reinforcement > single-axis
 * visual-style signal. A universal blueprint ships with a baseline
 * lift that keeps evergreen layouts in the shortlist even when the
 * client has picked traits that don't overlap with authored moods.
 */
export const SHORTLIST_WEIGHTS = {
    perPersonalityHit: 2,
    perVisualStyleHit: 1,
    industrySlugMatch: 3,
    universalBonus: 5,
};
/**
 * Score a single blueprint against a profile.
 *
 * Exposed so callers can surface the per-axis breakdown (why a
 * blueprint ranked where it did) without re-running the whole
 * shortlist. The resolver calls this internally.
 */
export function scoreBlueprintForProfile(blueprint, profile) {
    const personalitySet = new Set(profile.brand_personality ?? []);
    const visualStyleSet = new Set(profile.style_preferences ?? []);
    const industrySlug = profile.industry_slug ?? null;
    const personalityHits = [];
    for (const p of blueprint.personality) {
        if (personalitySet.has(p))
            personalityHits.push(p);
    }
    const visualStyleHits = [];
    for (const v of blueprint.visual_style) {
        if (visualStyleSet.has(v))
            visualStyleHits.push(v);
    }
    const industryMatch = industrySlug !== null && blueprint.industry_slugs.includes(industrySlug);
    let score = 0;
    score += personalityHits.length * SHORTLIST_WEIGHTS.perPersonalityHit;
    score += visualStyleHits.length * SHORTLIST_WEIGHTS.perVisualStyleHit;
    if (industryMatch)
        score += SHORTLIST_WEIGHTS.industrySlugMatch;
    if (blueprint.is_universal)
        score += SHORTLIST_WEIGHTS.universalBonus;
    return {
        blueprint,
        score,
        personality_hits: personalityHits,
        visual_style_hits: visualStyleHits,
        industry_match: industryMatch,
        is_universal: blueprint.is_universal,
    };
}
/**
 * Rank a normalized blueprint library against a company profile.
 *
 * Returns a score-descending list of `NormalizedBlueprint`. Universal
 * blueprints are always included regardless of industry match (their
 * `universalBonus` guarantees a nonzero score); non-universal entries
 * only appear when they earned at least one axis hit, so zero-match
 * blueprints fall out instead of padding the tail.
 *
 * Weighting rationale — see `SHORTLIST_WEIGHTS`. The JSDoc on the
 * [Storybook Overview page](https://brikstorybook.netlify.app/?path=/docs/theming-blueprints--docs)
 * explains how the portal wires this into the mockup generator seed.
 *
 * Sort is stable for equal scores: the earlier entry in the input
 * library wins. Callers relying on ordering for equal-score entries
 * should sort the input library by `key` or `last_reviewed` upstream.
 */
export function resolveBlueprintShortlist(profile, library, options = {}) {
    const entries = resolveBlueprintShortlistWithScores(profile, library, options);
    return entries.map((entry) => entry.blueprint);
}
/**
 * Same as `resolveBlueprintShortlist` but returns the full scoring
 * breakdown. Use when the portal needs to explain *why* a blueprint
 * ranked — e.g. surfacing "matched your brand's Trustworthy pick" next
 * to a suggested layout.
 */
export function resolveBlueprintShortlistWithScores(profile, library, options = {}) {
    const { limit, includeInactive = false } = options;
    const indexed = library.map((blueprint, index) => ({
        entry: scoreBlueprintForProfile(blueprint, profile),
        index,
    }));
    const eligible = indexed.filter(({ entry }) => {
        if (!includeInactive && !entry.blueprint.is_active)
            return false;
        return entry.score > 0 || entry.is_universal;
    });
    eligible.sort((a, b) => {
        if (b.entry.score !== a.entry.score)
            return b.entry.score - a.entry.score;
        return a.index - b.index;
    });
    const ranked = eligible.map(({ entry }) => entry);
    return typeof limit === 'number' ? ranked.slice(0, limit) : ranked;
}
//# sourceMappingURL=resolver.js.map