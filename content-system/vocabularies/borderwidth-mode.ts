/**
 * Border Width Mode — the expression-mode axis that sets stroke weight.
 *
 * Members are exactly the selector values `tokens/modes-borderwidth.css`
 * switches on. That file is the authority (ADR-039 amendment 2026-10-12:
 * "BDS CSS selector values win") and `expression-modes.test.ts` parses it to
 * hold this list to it.
 *
 * `modes-borderwidth.css` is generated from the Figma `border-width` collection
 * by the `border-width` entry in `scripts/generate-modes-css.mjs` COLLECTIONS
 * (brik-bds#2601), so the members are Figma's mode names: `thin` and `thick`.
 *
 * The DEFAULT border-width mode is `default`, the attribute-ABSENT state
 * (figma-tokens.css values stand). It is deliberately not a member: no
 * `[data-mode-borderwidth="default"]` selector exists.
 */
export const BORDERWIDTH_MODE_VALUES = ['thin', 'thick'] as const;

export type BorderWidthMode = (typeof BORDERWIDTH_MODE_VALUES)[number];

export const isBorderWidthMode = (value: string): value is BorderWidthMode =>
  (BORDERWIDTH_MODE_VALUES as readonly string[]).includes(value);
