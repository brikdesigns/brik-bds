import type { Personality, VisualStyle, IndustrySlug } from '../vocabularies';
import type { Mood, IndustryTag, SectionType, PatternType, BlueprintTier } from './vocabularies';
/**
 * Blueprint — a single entry in the BDS blueprint library.
 *
 * Authors hand-write the match fields (`moods`, `industries`) and layout
 * content; projections (`personality`, `visualStyle`, `industrySlugs`)
 * are derived by `normalizeBlueprint()` at load time and not stored in
 * the JSON source. Never hand-author projection fields — it diverges
 * from the bridge and silently breaks resolver shortlists.
 *
 * Shape mirrors the portal `design_blueprints` Supabase table
 * (migrations 00080, 00081) plus the v2 interaction-pattern extensions.
 * The portal re-seeds from this JSON; the JSON does not read from the
 * portal. BDS is upstream.
 */
export interface Blueprint {
    /** Unique slug, e.g. "hero_split_60_40". Stable — external references rely on it. */
    key: string;
    /** Human label, e.g. "Split Hero 60/40". */
    name: string;
    section_type: SectionType;
    /** Brand-feel tags. Projected onto Personality + VisualStyle via bridges. */
    moods: readonly Mood[];
    /** Industry-fit tags. Projected onto IndustrySlug via bridge. */
    industries: readonly IndustryTag[];
    /** Prose description of the layout — feeds the mockup generator system prompt. */
    layout_spec: string;
    /** Optional CSS pattern notes or snippets. */
    css_hints?: string;
    /** Optional HTML snippet using BDS `var()` tokens. */
    html_snippet?: string;
    /** Optional CSS snippet using BDS `var()` tokens. */
    css_snippet?: string;
    /**
     * v2 pivot: blueprints may describe behavior instead of (or alongside)
     * layout. When a Paper artboard supplies the layout, the blueprint's
     * value is the `pattern_spec` + `js_snippet`. Populated as the library
     * accumulates reusable interaction patterns.
     */
    pattern_type?: PatternType;
    pattern_spec?: string;
    js_snippet?: string;
    /** Where the pattern was captured from — "Framer - Buildaxa", "Vale demo", etc. */
    source?: string;
    tier: BlueprintTier;
    is_active: boolean;
    /** Semver. Bump on content change. */
    version: string;
    /** ISO date YYYY-MM-DD. */
    last_reviewed: string;
}
/**
 * NormalizedBlueprint — what the library emits after running authored
 * entries through the bridges. Consumers should type against this when
 * querying, not the raw `Blueprint` interface.
 */
export interface NormalizedBlueprint extends Blueprint {
    /** Derived from `moods` via MOOD_TO_PERSONALITY. */
    personality: readonly Personality[];
    /** Derived from `moods` via MOOD_TO_VISUAL_STYLE. May be empty. */
    visual_style: readonly VisualStyle[];
    /**
     * Derived from `industries` via INDUSTRY_TAG_TO_SLUG.
     * Empty when the blueprint is universal-only (see `is_universal`).
     */
    industry_slugs: readonly IndustrySlug[];
    /** True when `industries` includes `universal`. */
    is_universal: boolean;
}
/**
 * Library envelope — metadata surrounding the blueprint array so
 * consumers can detect version mismatches and review staleness.
 */
export interface BlueprintLibrary {
    /** Semver for the library as a whole. Bumps when the set changes. */
    version: string;
    /** ISO date YYYY-MM-DD of last full review. */
    last_reviewed: string;
    /** Review cadence reminder. */
    review_cadence: 'quarterly' | 'biannual' | 'annual';
    blueprints: readonly Blueprint[];
}
export interface ValidationIssue {
    key: string;
    field: string;
    message: string;
}
export interface ValidationResult {
    ok: boolean;
    issues: readonly ValidationIssue[];
}
/**
 * Validate a Blueprint authored entry against the locked vocabularies.
 * Dependency-free — returns a diagnostic bundle instead of throwing,
 * so callers can surface all drift in one pass.
 */
export declare function validateBlueprint(bp: Blueprint): ValidationResult;
/**
 * Validate a whole library envelope. Returns the flattened issue list
 * across every blueprint plus any envelope-level problems.
 */
export declare function validateBlueprintLibrary(library: BlueprintLibrary): ValidationResult;
/**
 * Normalize an authored Blueprint by attaching derived projection fields.
 * Assumes the input has already been validated; callers should run
 * `validateBlueprint` first or gate on `validateBlueprintLibrary`.
 */
export declare function normalizeBlueprint(bp: Blueprint): NormalizedBlueprint;
/**
 * Normalize every entry in a library. Safe to call after
 * `validateBlueprintLibrary` reports `ok: true`.
 */
export declare function normalizeBlueprintLibrary(library: BlueprintLibrary): readonly NormalizedBlueprint[];
//# sourceMappingURL=schema.d.ts.map