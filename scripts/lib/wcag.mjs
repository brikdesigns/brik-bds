/**
 * WCAG 2.1 relative-luminance + contrast-ratio math.
 *
 * Single source of truth for contrast computation across BDS. Consumed by:
 *   - scripts/validate-themes.js  (the CI contrast gate)
 *   - stories/_components/wcag-contrast.ts (the Storybook ContrastCompliance dashboard)
 *
 * Formula: WCAG 2.1 §1.4.3 (https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio).
 */

/** Parse a #rgb / #rrggbb hex string to an [r, g, b] tuple (0–255). */
export function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** sRGB channel (0–255) → linearized component. */
export function srgbToLinear(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Relative luminance of an [r, g, b] tuple. */
export function luminance([r, g, b]) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/** Parse an `rgb()` / `rgba()` string to an [r, g, b] tuple, or null. */
export function parseRgb(value) {
  const m = String(value).trim().match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  return m ? [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)] : null;
}

/** Coerce a hex (#rgb/#rrggbb) or `rgb()`/`rgba()` string to [r, g, b], or null.
 *  Accepts both so one impl serves the static gate (hex from CSS) and the
 *  Storybook dashboard (rgb() from getComputedStyle). */
export function toRgb(value) {
  if (isHex(value)) return hexToRgb(value);
  return parseRgb(value);
}

/** Contrast ratio between two colors (hex or rgb()). Returns [1, 21], or 0 if
 *  either value can't be parsed. */
export function contrastRatio(a, b) {
  const rgbA = toRgb(a);
  const rgbB = toRgb(b);
  if (!rgbA || !rgbB) return 0;
  const l1 = luminance(rgbA);
  const l2 = luminance(rgbB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** True if `value` is a literal hex color (#rgb / #rrggbb). */
export function isHex(value) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(value).trim());
}
