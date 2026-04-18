/**
 * Visual Style — the 11 canonical style directions captured in the client portal.
 *
 * Drives theme token selection (palette density, typography, spacing),
 * imagery treatment, and blueprint shortlist trimming. Distinct from
 * Personality — a "Playful" personality can be expressed in a "Minimal"
 * visual style, and those tradeoffs are where craftwork lives.
 *
 * Clients pick up to 3. "Minimal" and "Playful" also appear in Personality;
 * "Luxurious" overlaps with Personality's "Luxury" (intentional — singular
 * adjective form in Personality, adverbial form here).
 */
export const VISUAL_STYLE_VALUES = [
  'Minimal',
  'Playful',
  'Luxurious',
  'Modern',
  'Classic',
  'Dark',
  'Light',
  'Colorful',
  'Monochrome',
  'Textural',
  'Brutalist',
] as const;

export type VisualStyle = (typeof VISUAL_STYLE_VALUES)[number];

export const isVisualStyle = (value: string): value is VisualStyle =>
  (VISUAL_STYLE_VALUES as readonly string[]).includes(value);
