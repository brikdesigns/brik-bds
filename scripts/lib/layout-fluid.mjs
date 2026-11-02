/**
 * layout-fluid.mjs — the layout tier's device-fluid clamp() math (ADR-042).
 *
 * Shared by scripts/generate-modes-css.mjs (Foundations → tokens/layout-fluid.css)
 * and scripts/compile-client-theme.mjs (a Brand Kit's own layout values → that
 * kit's theme CSS, brik-bds#2954), so a kit's clamp and Brik's cannot compile
 * differently. Pure: no fs, no process — the compiler ships to client sites.
 */

/** Round to 4 decimals (killing float noise) and format, trimming a trailing
 *  `.0000` (and any other trailing zeros) so `1` prints as `1`, not `1.0000`. */
export function fmtNum(n) {
  const rounded = Math.round(n * 10000) / 10000;
  const normalized = rounded === 0 ? 0 : rounded; // -0 → 0
  if (Number.isInteger(normalized)) return String(normalized);
  return normalized.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

/**
 * Pure math for one layout-tier token's piecewise fluid clamp (ADR-042 D3):
 *
 *   calc(clamp(v0, b1 + s1·vw, v1) + clamp(0, b2 + s2·vw, v2 − v1))
 *
 * Three endpoints (v0 @ w0px, v1 @ w1px, v2 @ w2px) become two linear
 * segments so one fluid value threads all three rungs exactly — a single
 * clamp() from mobile straight to desktop misses the tablet rung. Bounds and
 * intercepts are emitted in `rem` (so a 200%-zoom root raises the floor with
 * it, per WCAG 1.4.4); slope stays in `vw` (device width is what should drive
 * it, not the root font size). No special-casing is needed for a degenerate
 * segment (v1 === v0 or v2 === v1) — the slope term reduces to 0 and the
 * bound collapses to a constant on its own.
 *
 * Throws on non-monotonic endpoints — a silently wrong clamp is worse than a
 * red build (ADR-042 § Refusal).
 */
export function buildFluidValue({ w0, w1, w2, v0, v1, v2 }) {
  if (!(v0 <= v1 && v1 <= v2)) {
    throw new Error(
      `Non-monotonic layout endpoints (need v0 ≤ v1 ≤ v2): v0=${v0} v1=${v1} v2=${v2}`
    );
  }

  const slope1 = ((v1 - v0) / (w1 - w0)) * 100;
  const base1 = (v0 - ((v1 - v0) / (w1 - w0)) * w0) / 16;
  const min1 = v0 / 16;
  const max1 = v1 / 16;

  const slope2 = ((v2 - v1) / (w2 - w1)) * 100;
  const base2 = (-((v2 - v1) / (w2 - w1)) * w1) / 16;
  const max2 = (v2 - v1) / 16;

  const seg1 = `clamp(${fmtNum(min1)}rem, ${fmtNum(base1)}rem + ${fmtNum(slope1)}vw, ${fmtNum(max1)}rem)`;
  const seg2 = `clamp(0rem, ${fmtNum(base2)}rem + ${fmtNum(slope2)}vw, ${fmtNum(max2)}rem)`;

  return `calc(${seg1} + ${seg2})`;
}

/**
 * Resolve a Tokens Studio `{space.NNNN}` alias to the primitive's raw px.
 * Anything else comes back unchanged.
 */
export function resolveSpaceRef(value, primitives) {
  // {space.NNNN} → primitive value
  const m = String(value).match(/^\{space\.(\w+)\}$/);
  if (!m) return value;
  return primitives.space?.[m[1]]?.$value ?? value;
}

/**
 * The layout tier's three device modes and the `breakpoint/default` rung each
 * reads its width from. `desktop` reads `wider` (1440), not `desktop` (1024) —
 * 1440 is the width of the Figma frames the desktop endpoint was measured on
 * (ADR-042 D4).
 */
export const LAYOUT_TIER = {
  modes: ['mobile', 'tablet', 'desktop'],
  rungs: { mobile: 'mobile', tablet: 'tablet', desktop: 'wider' },
  resolve: resolveSpaceRef,
};

/**
 * The layout tier's per-token endpoints, read off a Tokens Studio-shaped
 * object (design-tokens/tokens-studio.json, or Foundations merged with a kit).
 *
 * @param {object} data  Needs `primitives/value`, `breakpoint/default` and
 *                       `layout/{mobile,tablet,desktop}`.
 * @param {object} cfg   `{ collectionKey, modes, rungs, resolve }`, the
 *                       `layout` entry of COLLECTIONS in generate-modes-css.mjs.
 * @returns {{ w0: number, w1: number, w2: number,
 *             entries: { name: string, value: string, v0: number, v1: number, v2: number }[] }}
 *          `entries` sorted by token name; `value` is the calc(clamp() + clamp()).
 */
export function layoutFluidEntries(data, cfg) {
  const { collectionKey, modes, rungs, resolve } = cfg;
  const primitives = data['primitives/value'] ?? {};
  const read = (key) => {
    const slice = data[key];
    if (!slice) throw new Error(`Missing slice in tokens-studio.json: ${key}`);
    return slice;
  };
  const rungSlice = read('breakpoint/default');

  const rungPx = (rungName) => {
    const token = rungSlice[rungName];
    if (!token || typeof token.$value !== 'number') {
      throw new Error(
        `Missing/invalid breakpoint/default rung "${rungName}" needed by the ${collectionKey} fluid tier`
      );
    }
    return token.$value;
  };
  const w0 = rungPx(rungs.mobile);
  const w1 = rungPx(rungs.tablet);
  const w2 = rungPx(rungs.desktop);

  const slices = {};
  for (const mode of modes) slices[mode] = read(`${collectionKey}/${mode}`);

  // Variable set is read off the desktop slice; every mode must carry the
  // same names (Figma authors all three modes on one variable collection).
  const names = Object.keys(slices.desktop).sort((a, b) => a.localeCompare(b));

  const entries = names.map((name) => {
    const v0 = resolve(slices.mobile[name]?.$value, primitives);
    const v1 = resolve(slices.tablet[name]?.$value, primitives);
    const v2 = resolve(slices.desktop[name]?.$value, primitives);
    if (typeof v0 !== 'number' || typeof v1 !== 'number' || typeof v2 !== 'number') {
      throw new Error(
        `Could not resolve an alias for --${name} across ${collectionKey}/{mobile,tablet,desktop}`
      );
    }
    return { name, value: buildFluidValue({ w0, w1, w2, v0, v1, v2 }), v0, v1, v2 };
  });

  return { w0, w1, w2, entries };
}
