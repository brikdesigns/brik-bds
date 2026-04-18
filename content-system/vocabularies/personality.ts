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
 *     and youth-forward brands.
 */
export const PERSONALITY_VALUES = [
  'Warm',
  'Approachable',
  'Playful',
  'Bold',
  'Energetic',
  'Professional',
  'Modern',
  'Minimal',
  'Luxury',
  'Corporate',
  'Authoritative',
  'Trustworthy',
  'Refined',
] as const;

export type Personality = (typeof PERSONALITY_VALUES)[number];

export const isPersonality = (value: string): value is Personality =>
  (PERSONALITY_VALUES as readonly string[]).includes(value);
