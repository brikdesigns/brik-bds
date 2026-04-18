/**
 * Brand Personality — the 11 canonical traits captured in the client portal.
 *
 * Single source of truth. The portal enum and BDS blueprint/theme tags
 * must reference these values. Drift here causes silent resolver failures.
 *
 * Clients pick up to 3. Repeated traits across Personality + Voice +
 * Visual Style indicate reinforced intent and should be weighted higher
 * by the resolver.
 */
export const PERSONALITY_VALUES = [
  'Warm',
  'Approachable',
  'Playful',
  'Bold',
  'Professional',
  'Modern',
  'Minimal',
  'Luxury',
  'Corporate',
  'Authoritative',
  'Refined',
] as const;

export type Personality = (typeof PERSONALITY_VALUES)[number];

export const isPersonality = (value: string): value is Personality =>
  (PERSONALITY_VALUES as readonly string[]).includes(value);
