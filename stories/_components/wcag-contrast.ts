/**
 * WCAG 2.1 contrast math for the Storybook ContrastCompliance dashboard.
 *
 * Re-exported from the single source of truth — scripts/lib/wcag.mjs — so the
 * dashboard, the CI gate (scripts/validate-themes.js), and the foundation-doc
 * matrix all compute contrast identically. `contrastRatio` accepts both hex and
 * `rgb()` strings (the dashboard reads getComputedStyle, which returns rgb()).
 */
export { contrastRatio, isHex, toRgb } from '../../scripts/lib/wcag.mjs';
