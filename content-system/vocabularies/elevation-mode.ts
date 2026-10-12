/**
 * Elevation Mode — the expression-mode axis that sets shadow depth.
 *
 * Members are exactly the selector values `tokens/modes-elevation.css`
 * switches on. That file is the authority (ADR-039 amendment 2026-10-12:
 * "BDS CSS selector values win") and `expression-modes.test.ts` parses it to
 * hold this list to it.
 *
 * Mode semantics (from the generated file's own header):
 *   - flat                — composes a zeroed shorthand; no visible shadow.
 *   - lifted / dramatic   — compose the full `0px y blur spread rgba(0,0,0,α)`.
 *
 * The DEFAULT elevation mode is `subtle`, the attribute-ABSENT state, which
 * uses the hand-authored --bds-shadow-* composition in `tokens/gap-fills.css`.
 * It is deliberately not a member: no `[data-mode-elevation="subtle"]`
 * selector exists. Omit the attribute to mean subtle.
 */
export const ELEVATION_MODE_VALUES = ['flat', 'lifted', 'dramatic'] as const;

export type ElevationMode = (typeof ELEVATION_MODE_VALUES)[number];

export const isElevationMode = (value: string): value is ElevationMode =>
  (ELEVATION_MODE_VALUES as readonly string[]).includes(value);
