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
export const VOICE_VALUES = [
  'Direct',
  'Empathetic',
  'Witty',
  'Expert',
  'Conversational',
  'Authoritative',
  'Poetic',
  'Approachable',
] as const;

export type Voice = (typeof VOICE_VALUES)[number];

export const isVoice = (value: string): value is Voice =>
  (VOICE_VALUES as readonly string[]).includes(value);
