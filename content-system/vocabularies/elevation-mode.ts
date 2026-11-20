/**
 * Elevation Mode — DEPRECATED, removed in the next minor (#3058).
 *
 * The elevation expression-mode axis is gone: `tokens/modes-elevation.css`
 * and `[data-mode-elevation]` were deleted, and the six shadow depths compose
 * straight into `--bds-shadow-{sunken,flat,subtle,raised,lifted,dramatic}`.
 * Nothing in BDS reads this list. It stays one minor so a consumer that
 * imports it (the portal's decision set) keeps compiling across the bump,
 * the same one-minor rule as the deprecated `--bds-shadow-*` aliases.
 *
 * @deprecated #3058 — no elevation axis; pick a `--bds-shadow-*` depth instead.
 */
export const ELEVATION_MODE_VALUES = ['flat', 'lifted', 'dramatic'] as const;

/** @deprecated #3058 — see ELEVATION_MODE_VALUES. */
export type ElevationMode = (typeof ELEVATION_MODE_VALUES)[number];

/** @deprecated #3058 — see ELEVATION_MODE_VALUES. */
export const isElevationMode = (value: string): value is ElevationMode =>
  (ELEVATION_MODE_VALUES as readonly string[]).includes(value);
