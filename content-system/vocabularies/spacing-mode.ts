/**
 * Spacing Mode — the expression-mode axis that modulates padding-* and gap-*.
 *
 * Members are exactly the selector values `tokens/modes-spacing.css` switches
 * on. That file is the authority (ADR-039 amendment 2026-10-12: "BDS CSS
 * selector values win"), and `expression-modes.test.ts` parses it to hold this
 * list to it — a Figma mode rename reaches the CSS through
 * `scripts/generate-modes-css.mjs` and fails that test, rather than drifting
 * silently into portal pick-lists.
 *
 * The DEFAULT spacing mode is the attribute-ABSENT state (figma-tokens.css
 * base), named `default` in the generator's COLLECTIONS registry. It is
 * deliberately not a member: there is no `[data-mode-spacing="default"]`
 * selector, so a consumer that emitted one would get the base values by
 * accident rather than by contract. Omit the attribute to mean default.
 *
 * Pairs with the layout primitives (Stack, Cluster, Grid) — each picks the
 * mode up automatically once `[data-mode-spacing]` is set on :root.
 */
export const SPACING_MODE_VALUES = ['compact', 'comfortable', 'spacious'] as const;

export type SpacingMode = (typeof SPACING_MODE_VALUES)[number];

export const isSpacingMode = (value: string): value is SpacingMode =>
  (SPACING_MODE_VALUES as readonly string[]).includes(value);
