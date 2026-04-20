/**
 * Image Mood — the canonical photography / imagery-direction vocabulary
 * captured in the client portal.
 *
 * Single source of truth shared by the portal Visual Direction intel topic,
 * the stock-asset picker, the design-preflight image approach, and the
 * mockup generator's image prompts. Distinct from `VISUAL_STYLE_VALUES`
 * which describes overall aesthetic — mood describes how imagery is
 * composed and lit.
 *
 * Clients pick 1–3. Multi-select because a brand often blends moods
 * (e.g. editorial × clinical for a luxury medical practice, or lifestyle
 * × documentary for real estate).
 *
 * Mood semantics:
 *   - editorial        — magazine-styled, composed, aspirational
 *   - clinical         — clean, precise, sterile (medical/dental/legal)
 *   - photojournalistic — candid, moment-in-time, real events
 *   - lifestyle        — people in context, warm, aspirational daily life
 *   - abstract         — non-representational, textural, artistic
 *   - documentary      — unposed, real, environmental portraiture
 */
export declare const IMAGE_MOOD_VALUES: readonly ["editorial", "clinical", "photojournalistic", "lifestyle", "abstract", "documentary"];
export type ImageMood = (typeof IMAGE_MOOD_VALUES)[number];
export declare const isImageMood: (value: string) => value is ImageMood;
//# sourceMappingURL=image-mood.d.ts.map