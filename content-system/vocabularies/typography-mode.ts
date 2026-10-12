/**
 * Typography Mode — the expression-mode axis that selects a heading scale.
 *
 * Members are exactly the selector values `tokens/modes-typography.css`
 * switches on. That file is the authority (ADR-039 amendment 2026-10-12:
 * "BDS CSS selector values win") and `expression-modes.test.ts` parses it to
 * hold this list to it.
 *
 * Mode semantics (from the generated file's own header):
 *   - compact / comfortable / spacious — uniform density steps.
 *   - expressive                       — a steeper modular curve (smaller
 *     small end, larger large end) for editorial / marketing surfaces.
 *
 * The variants are mutually exclusive and this axis owns --bds-heading-*
 * alone (ADR-013 amendment 2026-06-21, #928). display-* is mode-invariant in
 * Figma today, so only heading-* emits overrides.
 *
 * Shares three value NAMES with `spacing-mode` (compact / comfortable /
 * spacious) and is a different axis on a different attribute — keep the two
 * closed lists separate rather than aliasing one to the other, or a
 * typography rename silently retunes spacing.
 *
 * The DEFAULT typography mode is the attribute-ABSENT state
 * (figma-tokens.css base), named `default` in the generator's COLLECTIONS
 * registry. It is deliberately not a member: no
 * `[data-mode-typography="default"]` selector exists.
 */
export const TYPOGRAPHY_MODE_VALUES = [
  'compact',
  'comfortable',
  'spacious',
  'expressive',
] as const;

export type TypographyMode = (typeof TYPOGRAPHY_MODE_VALUES)[number];

export const isTypographyMode = (value: string): value is TypographyMode =>
  (TYPOGRAPHY_MODE_VALUES as readonly string[]).includes(value);
