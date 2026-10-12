/**
 * Radius Mode — the expression-mode axis that retunes corner radius.
 *
 * Members are exactly the selector values `tokens/modes-borderradius.css`
 * switches on. That file is the authority (ADR-039 amendment 2026-10-12:
 * "BDS CSS selector values win") and `expression-modes.test.ts` parses it to
 * hold this list to it.
 *
 * Note the attribute is `data-mode-radius`, not `data-mode-border-radius` —
 * the Figma collection is `border-radius` but the emitted attribute is
 * shortened (see the ATTRIBUTE_OVERRIDES note in
 * `scripts/generate-modes-css.mjs`). Name the mode by its selector value.
 *
 * Mode semantics (from the generated file's own header):
 *   - sharp / round — tighten or loosen the --border-radius-{none,sm,md,lg} ramp.
 *   - pill          — maps every step to the full 999px round.
 *
 * The DEFAULT radius mode is `soft`, the attribute-ABSENT state
 * (figma-tokens.css base). It is deliberately not a member: no
 * `[data-mode-radius="soft"]` selector exists. Omit the attribute to mean soft.
 *
 * `tokens/index.ts` aliases its public `BorderMode` to this type so the
 * ThemeProvider surface and the BCS vocabulary cannot diverge again — before
 * this module it declared `'sharp' | 'rounded' | 'pill'`, and `rounded`
 * matched no selector at all.
 */
export const RADIUS_MODE_VALUES = ['sharp', 'round', 'pill'] as const;

export type RadiusMode = (typeof RADIUS_MODE_VALUES)[number];

export const isRadiusMode = (value: string): value is RadiusMode =>
  (RADIUS_MODE_VALUES as readonly string[]).includes(value);
