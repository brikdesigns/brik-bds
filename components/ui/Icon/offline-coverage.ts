import phSubset from '../../icons.generated.json';
import type { IconWeight } from './icon-weight';

/**
 * Offline-glyph coverage per Phosphor weight (#2253).
 *
 * The bundled subset (`components/icons.generated.json`, built by
 * `scripts/gen-icon-collection.mjs`) carries every `ph:*` reference in shipped
 * source plus its `-bold` twin — so only `regular` and `bold` resolve offline
 * for the general icon set. Any other weight rewrites `ph:{name}` to a name the
 * subset does not contain (Icon.tsx `applyWeight`), which falls back to a
 * runtime Iconify CDN fetch and breaks the offline-first guarantee.
 *
 * ThemeProvider uses `offlineGapWarning` to warn (dev only) when a `defaultIconWeight`
 * would push bundled icons to the CDN. Fill/duotone/thin/light stay CDN-bound
 * until their glyphs are bundled — see Icon.mdx § Notes (Offline weights).
 */

const NAMES = new Set(Object.keys((phSubset as { icons: Record<string, unknown> }).icons));

// Base (regular-weight) names — those carrying no Phosphor weight suffix. These
// are the icons `applyWeight` re-suffixes when a non-regular weight is asked for.
const BASE_NAMES = [...NAMES].filter((n) => !/-(thin|light|bold|fill|duotone)$/.test(n));

/**
 * How many bundled base icons LACK an offline glyph at `weight` — i.e. how many
 * would fetch from the Iconify CDN when rendered at that weight. `0` means the
 * weight resolves fully offline (`regular`, and `bold` via its bundled twin).
 */
export function offlineGapAt(weight: IconWeight): number {
  if (weight === 'regular') return 0; // base names ARE the regular glyphs
  return BASE_NAMES.filter((base) => !NAMES.has(`${base}-${weight}`)).length;
}

/** Total bundled base icons — the denominator for an offline-coverage gap. */
export const BUNDLED_BASE_COUNT = BASE_NAMES.length;

/**
 * The dev warning for a default icon `weight`, or `null` when the weight
 * resolves fully offline. Pure (no `console`, no environment gate) so the
 * message logic is unit-testable in node; ThemeProvider does the dev-only
 * `console.warn` of the return value. See brik-bds#2253.
 */
export function offlineGapWarning(weight: IconWeight): string | null {
  const gap = offlineGapAt(weight);
  if (gap === 0) return null;
  return (
    `[BDS] ThemeProvider defaultIconWeight="${weight}": ${gap} of ${BUNDLED_BASE_COUNT} ` +
    `bundled icons have no offline glyph at this weight and will fetch from the Iconify ` +
    `CDN at render, defeating <Icon>'s offline-first guarantee. Use "regular"/"bold", or ` +
    `bundle the matching glyphs (see Icon.mdx § Notes (Offline weights), brik-bds#2253).`
  );
}
