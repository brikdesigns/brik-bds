/**
 * Border Width Mode — the expression-mode axis that sets stroke weight.
 *
 * Members are exactly the selector values `tokens/modes-borderwidth.css`
 * switches on. That file is the authority (ADR-039 amendment 2026-10-12:
 * "BDS CSS selector values win") and `expression-modes.test.ts` parses it to
 * hold this list to it.
 *
 * Unlike the other four, `modes-borderwidth.css` is HAND-AUTHORED and
 * pre-dates the COLLECTIONS registry in `scripts/generate-modes-css.mjs`
 * (see the `border-width` entry in `lint-mode-emission-coverage.mjs`'s
 * ATTRIBUTE_OVERRIDES). That is why the vocabulary test parses the CSS rather
 * than importing COLLECTIONS: the CSS is the one instrument that covers all
 * five axes, generated and hand-authored alike.
 *
 * Wires the "Thin" and "Bold" picks from brand-kit-modes.json's borderWidth
 * mode catalog (#313).
 *
 * The DEFAULT border-width mode is `standard`, the attribute-ABSENT state
 * (Figma's --border-width-* values stand). It is deliberately not a member:
 * no `[data-mode-borderwidth="standard"]` selector exists.
 */
export const BORDERWIDTH_MODE_VALUES = ['thin', 'bold'] as const;

export type BorderWidthMode = (typeof BORDERWIDTH_MODE_VALUES)[number];

export const isBorderWidthMode = (value: string): value is BorderWidthMode =>
  (BORDERWIDTH_MODE_VALUES as readonly string[]).includes(value);
