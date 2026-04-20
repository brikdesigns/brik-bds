/**
 * Blueprint-side vocabularies.
 *
 * These are *match* tags — they describe which layouts fit which brands —
 * and are intentionally distinct from the client-picks vocabularies
 * (Personality / Voice / VisualStyle) that clients select in the portal.
 * See ARCHITECTURE.md for the two-taxonomy model and bridge rules.
 */
/**
 * Moods — the brand-feel match tags carried on every blueprint.
 *
 * Bridges to Personality + VisualStyle via MOOD_TO_PERSONALITY and
 * MOOD_TO_VISUAL_STYLE in bridges.ts. A blueprint authored with
 * `moods: ['bold', 'modern']` automatically projects to
 * `personality: ['Bold', 'Modern']` and `visualStyle: ['Modern']`
 * when the JSON is loaded — consumers may query by either axis.
 */
export declare const MOOD_VALUES: readonly ["bold", "minimal", "warm", "corporate", "playful", "luxury", "trustworthy", "energetic", "professional", "modern", "approachable"];
export type Mood = (typeof MOOD_VALUES)[number];
export declare const isMood: (value: string) => value is Mood;
/**
 * Industry tags — the 15 match-side industry labels carried on blueprints.
 *
 * Wider than `INDUSTRY_SLUGS` (which is the 3-pack fallback-driven client
 * axis). Industry tags describe which verticals a layout fits; slugs
 * describe which industry pack supplies voice/copy/strategic defaults.
 *
 * `universal` is a special tag meaning "works for any vertical" — it does
 * NOT map to `small-business`; the resolver must handle it specially so
 * universal blueprints always appear in shortlists.
 */
export declare const INDUSTRY_TAG_VALUES: readonly ["universal", "healthcare", "real_estate", "legal", "finance", "saas", "ecommerce", "beauty", "salon", "hospitality", "restaurant", "luxury", "corporate", "dental", "veterinary"];
export type IndustryTag = (typeof INDUSTRY_TAG_VALUES)[number];
export declare const isIndustryTag: (value: string) => value is IndustryTag;
/**
 * Section types — which page region a blueprint composes.
 *
 * Stable superset; new types require a migration + mockup worker update
 * so both sides know how to slot the blueprint into a variant brief.
 */
export declare const SECTION_TYPE_VALUES: readonly ["hero", "nav", "services", "features", "stats", "testimonials", "cta", "gallery", "team", "faq", "content_block"];
export type SectionType = (typeof SECTION_TYPE_VALUES)[number];
export declare const isSectionType: (value: string) => value is SectionType;
/**
 * Pattern types — the v2 interaction/animation taxonomy.
 *
 * Optional on current blueprints; required when a blueprint's primary
 * value is behavior rather than layout (post-Paper pivot). A blueprint
 * can carry both layout_spec and pattern_spec — they're not exclusive.
 */
export declare const PATTERN_TYPE_VALUES: readonly ["carousel", "scroll-reveal", "hover-card", "parallax", "counter", "accordion", "lightbox"];
export type PatternType = (typeof PATTERN_TYPE_VALUES)[number];
export declare const isPatternType: (value: string) => value is PatternType;
/**
 * Tier — which surfaces a blueprint is cleared for.
 *
 * - `internal`: mockup generation only. Not surfaced in brik-templates.
 * - `template`: eligible for the brik-templates catalog shipped to clients.
 */
export declare const BLUEPRINT_TIER_VALUES: readonly ["internal", "template"];
export type BlueprintTier = (typeof BLUEPRINT_TIER_VALUES)[number];
export declare const isBlueprintTier: (value: string) => value is BlueprintTier;
//# sourceMappingURL=vocabularies.d.ts.map