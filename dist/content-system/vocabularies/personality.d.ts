/**
 * Brand Personality — the 13 canonical traits captured in the client portal.
 *
 * Single source of truth. The portal enum and BDS blueprint/theme tags
 * must reference these values. Drift here causes silent resolver failures.
 *
 * Clients pick up to 3. Repeated traits across Personality + Voice +
 * Visual Style indicate reinforced intent and should be weighted higher
 * by the resolver.
 *
 * Version history:
 *   - v0.8.0: 11 traits (initial set)
 *   - v0.9.0: added Trustworthy + Energetic. Cross-vertical load-bearing —
 *     Trustworthy is the default signal for medical/legal/financial;
 *     Energetic fills a gap between Playful and Bold for active-lifestyle
 *     and youth-forward brands. Also gives the mood→personality bridge
 *     (blueprints/ARCHITECTURE.md) a clean target for every mood value.
 */
export declare const PERSONALITY_VALUES: readonly ["Warm", "Approachable", "Playful", "Bold", "Energetic", "Professional", "Modern", "Minimal", "Luxury", "Corporate", "Authoritative", "Trustworthy", "Refined"];
export type Personality = (typeof PERSONALITY_VALUES)[number];
export declare const isPersonality: (value: string) => value is Personality;
//# sourceMappingURL=personality.d.ts.map