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
export const VISUAL_STYLE_VALUES = [
  'Minimal',
  'Bold',
  'Editorial',
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

/**
 * Per-style metadata sidecar. Kept separate from the enum so the
 * `VisualStyle` type stays a clean string-literal union for downstream
 * consumers (portal, blueprint resolver, schema bridges).
 *
 * `referenceImageUrl` points at a canonical thumbnail used in:
 *   - Storybook MDX (Content System / Visual Styles / {slug})
 *   - Portal onboarding picker (thumbnail next to each option)
 *   - Client-facing proposals and mood boards
 *
 * TODO(bcs): populate `referenceImageUrl` for all 13 styles. Scaffold
 * ships with empty strings so dependent wiring (Storybook stories,
 * portal picker) can proceed in parallel; fill via a follow-up data-only
 * PR once the canonical URLs are finalized.
 */
export interface VisualStyleMetadata {
  /** Canonical thumbnail URL representing this style direction. */
  referenceImageUrl: string;
}

export const VISUAL_STYLE_METADATA: Record<VisualStyle, VisualStyleMetadata> = {
  Minimal: { referenceImageUrl: '' },
  Bold: { referenceImageUrl: '' },
  Editorial: { referenceImageUrl: '' },
  Playful: { referenceImageUrl: '' },
  Luxurious: { referenceImageUrl: '' },
  Modern: { referenceImageUrl: '' },
  Classic: { referenceImageUrl: '' },
  Dark: { referenceImageUrl: '' },
  Light: { referenceImageUrl: '' },
  Colorful: { referenceImageUrl: '' },
  Monochrome: { referenceImageUrl: '' },
  Textural: { referenceImageUrl: '' },
  Brutalist: { referenceImageUrl: '' },
};

export const getVisualStyleMetadata = (
  style: VisualStyle,
): VisualStyleMetadata => VISUAL_STYLE_METADATA[style];
