/**
 * Brand Voice — the 8 canonical voice traits captured in the client portal.
 *
 * Drives copy register, headline cadence, CTA phrasing, and body sentence
 * structure. Distinct from Personality (which drives visual/structural feel).
 *
 * Clients pick up to 3. The resolver blends picks with first-pick weighted
 * highest; voice patterns (phase 2) define per-trait writing rules.
 *
 * Note: "Approachable" and "Authoritative" also appear in Personality.
 * That overlap is a feature — reinforcement across axes indicates stronger
 * intent and should increase weight in the resolver.
 */
export declare const VOICE_VALUES: readonly ["Direct", "Empathetic", "Witty", "Expert", "Conversational", "Authoritative", "Poetic", "Approachable"];
export type Voice = (typeof VOICE_VALUES)[number];
export declare const isVoice: (value: string) => value is Voice;
//# sourceMappingURL=voice.d.ts.map