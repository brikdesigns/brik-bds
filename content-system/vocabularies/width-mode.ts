/**
 * Width Mode — the expression-mode axis that sets the page-band cap.
 *
 * Members are exactly the selector values `tokens/modes-width.css` switches
 * on. That file is the authority (ADR-039 amendment 2026-10-12: "BDS CSS
 * selector values win") and `expression-modes.test.ts` parses it to hold this
 * list to it.
 *
 * `modes-width.css` is hand-authored: no Figma `width` collection exists to
 * generate it from, unlike the other five axes (brik-bds#959 AC3, promotion
 * tracked on brik-bds#894).
 *
 * The DEFAULT width mode is `contained`, the attribute-ABSENT state (the
 * `--bds-content-width-xl` band in gap-fills.css stands). It is deliberately
 * not a member: no `[data-mode-width="contained"]` selector exists.
 */
export const WIDTH_MODE_VALUES = ['wide', 'full-bleed'] as const;

export type WidthMode = (typeof WIDTH_MODE_VALUES)[number];

export const isWidthMode = (value: string): value is WidthMode =>
  (WIDTH_MODE_VALUES as readonly string[]).includes(value);
