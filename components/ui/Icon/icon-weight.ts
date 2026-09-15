import { createContext, useContext } from 'react';

/**
 * BDS icon weight — a **form × stroke** axis, named in Brik's own vocabulary
 * (ADR-036), not Phosphor's flat suffix list.
 *
 * - **form** — `outline*` is hollow (an enclosed glyph keeps its counter-path);
 *   `fill` drops the counter for a solid silhouette; `duotone` sits outside the
 *   axis. The names say which: `outline-bold` is a *heavier outline*, still
 *   hollow — the old `bold` name hid that next to `fill`.
 * - **stroke** — `-thin`/`-light`/(none)/`-bold` order the outline by weight.
 *
 * `outline-bold` is BDS's standard line density. Phosphor still encodes weight
 * in the icon *name* (`ph:{name}-bold`), so each semantic name maps to a
 * Phosphor token via {@link PHOSPHOR_WEIGHT_TOKEN}; `<Icon>` and ThemeProvider
 * expose the axis as an `<Icon weight>` prop and a per-app context default.
 *
 * **Linear-glyph carve-out.** Where a glyph has no enclosed area, `fill` is a
 * visual no-op — `ph:arrows-clockwise` vs `-fill` is identical geometry (2→2
 * subpaths). Reach for `outline-bold`, not `fill`, on linear glyphs; detect the
 * carve-out with the subpath test, never by eye.
 *
 * Lives in its own module (not Icon.tsx) so both `<Icon>` and ThemeProvider can
 * import the context without an Icon↔ThemeProvider import cycle.
 */
export type IconWeight =
  | 'outline-thin'
  | 'outline-light'
  | 'outline'
  | 'outline-bold'
  | 'fill'
  | 'duotone'
  /** @deprecated Renamed to `'outline'` (Phosphor regular). Kept for one minor; remove next minor. */
  | 'regular'
  /** @deprecated Renamed to `'outline-bold'` — the BDS standard. Kept for one minor; remove next minor. */
  | 'bold';

/**
 * Each semantic weight → its Phosphor icon-name token (`''` = no suffix, the
 * Phosphor-regular glyph). Single source of truth shared by `applyWeight`
 * (Icon.tsx) and `offlineGapAt` (offline-coverage.ts) so the form×stroke
 * vocabulary and the on-disk Phosphor names can never drift apart.
 *
 * `outline-bold`/`bold` both map to `bold`; `outline`/`regular` both map to
 * `''` — so a deprecated alias resolves to the exact same glyph as its rename.
 */
export const PHOSPHOR_WEIGHT_TOKEN = {
  'outline-thin': 'thin',
  'outline-light': 'light',
  outline: '',
  'outline-bold': 'bold',
  fill: 'fill',
  duotone: 'duotone',
  regular: '',
  bold: 'bold',
} as const satisfies Record<IconWeight, string>;

/**
 * BDS's standard line density: `outline-bold` — a heavier *outline*, still
 * hollow. The weight `<Icon>` renders when neither a `weight` prop nor an
 * enclosing provider says otherwise. Renamed from `bold`; the **rendered glyph
 * is unchanged** (both resolve to the Phosphor `-bold` token).
 */
export const DEFAULT_ICON_WEIGHT: IconWeight = 'outline-bold';

/**
 * Per-app default Phosphor weight, set by a provider (ThemeProvider's
 * `defaultIconWeight` prop). `undefined` means no provider is mounted — the
 * common case for an isolated `<Icon>` — and callers fall back to
 * {@link DEFAULT_ICON_WEIGHT}.
 *
 * Icon weight is NOT a `[data-mode-*]` CSS token: weight selects a different
 * SVG asset by rewriting the Phosphor name in JS (see `applyWeight` in
 * Icon.tsx), which the CSS cascade cannot carry. It therefore travels on React
 * context, not through `dist/tokens.css` (ADR-036).
 */
export const IconWeightContext = createContext<IconWeight | undefined>(undefined);

/**
 * Resolve the ambient default icon weight. Non-throwing by design — unlike
 * `useTheme`, `<Icon>` is used in trees with no provider above it, so a missing
 * provider must degrade to {@link DEFAULT_ICON_WEIGHT}, never error.
 */
export function useIconWeight(): IconWeight {
  return useContext(IconWeightContext) ?? DEFAULT_ICON_WEIGHT;
}
