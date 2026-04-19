/**
 * Visual Style — the 13 canonical style directions captured in the client portal.
 *
 * Drives theme token selection (palette density, typography, spacing),
 * imagery treatment, and blueprint shortlist trimming. Distinct from
 * Personality — a "Playful" personality can be expressed in a "Minimal"
 * visual style, and those tradeoffs are where craftwork lives.
 *
 * Clients pick up to 3. "Minimal" and "Playful" also appear in Personality;
 * "Luxurious" overlaps with Personality's "Luxury" (intentional — singular
 * adjective form in Personality, adverbial form here).
 *
 * Ordering mirrors the portal's onboarding picker so the eventual
 * `taxonomy.ts` → BCS import swap is a zero-reorder change.
 */
export declare const VISUAL_STYLE_VALUES: readonly ["Minimal", "Bold", "Editorial", "Playful", "Luxurious", "Modern", "Classic", "Dark", "Light", "Colorful", "Monochrome", "Textural", "Brutalist"];
export type VisualStyle = (typeof VISUAL_STYLE_VALUES)[number];
export declare const isVisualStyle: (value: string) => value is VisualStyle;
/**
 * Reference imagery registry.
 *
 * A Visual Style can be represented by multiple example images — a pure
 * primary expression, the same style with a modifier layered on, different
 * client executions over time. Keeping this a list (not a Record<VisualStyle>)
 * means you can add rows without re-classifying existing values, and one
 * style can carry many examples as the design library grows.
 *
 * `modifierStyles` is empty for a pure expression, or carries 1–2 other
 * VisualStyle values to describe a composition ("Minimal × Colorful").
 * Paper's `bds-theming` file (01KPH6ANXVEPBJ4PAVB7V380JH) is the current
 * source for the imagery; a follow-up PR exports each artboard as PNG and
 * populates `referenceImageUrl`.
 *
 * Consumers:
 *   - Storybook MDX (Content System / Visual Styles / {slug})
 *   - Portal onboarding picker (thumbnail + caption next to each option)
 *   - Client-facing proposals and mood boards
 */
export interface VisualStyleExample {
    /** The dominant style this example expresses. */
    primaryStyle: VisualStyle;
    /**
     * Zero or more styles layered over `primaryStyle`. Empty for a pure
     * expression. Modifier order is significant (first pick dominates).
     */
    modifierStyles: readonly VisualStyle[];
    /** Canonical hosted URL of the reference image (PNG/WEBP). */
    referenceImageUrl: string;
    /**
     * Optional source URL that inspired the composition (Webflow template,
     * published site, etc). Preserved for attribution + follow-up research.
     */
    referenceSiteUrl?: string;
    /** Optional human-readable caption — "Minimal × Colorful — soft take". */
    caption?: string;
}
export declare const VISUAL_STYLE_EXAMPLES: readonly VisualStyleExample[];
/**
 * All examples that feature `style` as the primary or as a modifier.
 * Used by Storybook per-style pages and the portal onboarding picker.
 */
export declare const getVisualStyleExamples: (style: VisualStyle) => readonly VisualStyleExample[];
/**
 * The canonical "pure" example for a style — first entry where the style
 * is the primary and there are no modifiers. Returns undefined if the
 * style has no standalone example authored yet.
 */
export declare const getPrimaryVisualStyleExample: (style: VisualStyle) => VisualStyleExample | undefined;
//# sourceMappingURL=visual-style.d.ts.map