/**
 * OKLab / OKLCh ↔ sRGB conversion + sRGB gamut mapping.
 *
 * Single source of truth for perceptual color math in BDS. Consumed by:
 *   - scripts/generate-color-ramps.mjs (the 11-step ramp generator, #1737)
 *
 * Why OKLCh and not HSL/Lab: ramp stops have to be perceptually even, and a
 * generated stop must not shift hue away from the brand anchors it sits
 * between. HSL lightness is not perceptual (its 50% is a different apparent
 * lightness per hue) and CIE Lab has a well-known blue-hue skew. OKLab is
 * hue-linear enough that interpolating between two brand anchors keeps the
 * family's hue — which is the whole requirement for #1065's numeric scale.
 *
 * Matrices: Björn Ottosson's OKLab definition
 * (https://bottosson.github.io/posts/oklab/). D65, sRGB primaries.
 *
 * Determinism: every function here is pure float math over IEEE-754 doubles
 * with no lookup tables, no randomness, and no locale-sensitive formatting.
 * Same input → byte-identical output on any platform, which is what the
 * generator's `--check` drift gate depends on.
 */

/** Parse a #rgb / #rrggbb hex string to an [r, g, b] tuple (0–255). */
export function hexToRgb(hex) {
  let h = String(hex).trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new Error(`Not a hex color: ${JSON.stringify(hex)}`);
  }
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** [r, g, b] (0–255) → lowercase #rrggbb. Rounds half away from zero. */
export function rgbToHex([r, g, b]) {
  const c = (v) => {
    const i = Math.min(255, Math.max(0, Math.round(v)));
    return i.toString(16).padStart(2, '0');
  };
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** sRGB channel (0–1, gamma-encoded) → linear-light. */
function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Linear-light channel → sRGB (0–1, gamma-encoded). */
function linearToSrgb(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/** [r, g, b] (0–255) → OKLab [L, a, b]. */
export function rgbToOklab([R, G, B]) {
  const r = srgbToLinear(R / 255);
  const g = srgbToLinear(G / 255);
  const b = srgbToLinear(B / 255);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** OKLab [L, a, b] → linear-light [r, g, b] (unclamped, may leave sRGB gamut). */
function oklabToLinearRgb([L, A, B]) {
  const l_ = L + 0.3963377774 * A + 0.2158037573 * B;
  const m_ = L - 0.1055613458 * A - 0.0638541728 * B;
  const s_ = L - 0.0894841775 * A - 1.291485548 * B;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** OKLab [L, a, b] → OKLCh [L, C, h°]. Hue is undefined at C = 0; we return 0. */
export function oklabToOklch([L, a, b]) {
  const C = Math.hypot(a, b);
  // Below this chroma the a/b components are rounding noise, and a hue derived
  // from them would swing wildly between near-identical greys — which would
  // then get interpolated into a visible tint. Treat it as a true neutral.
  if (C < 1e-6) return [L, 0, 0];
  return [L, C, (Math.atan2(b, a) * 180) / Math.PI];
}

/** OKLCh [L, C, h°] → OKLab [L, a, b]. */
export function oklchToOklab([L, C, h]) {
  const rad = (h * Math.PI) / 180;
  return [L, C * Math.cos(rad), C * Math.sin(rad)];
}

/** #rrggbb → OKLCh [L, C, h°]. */
export function hexToOklch(hex) {
  return oklabToOklch(rgbToOklab(hexToRgb(hex)));
}

const EPS = 1e-7;

function inSrgbGamut([r, g, b]) {
  return (
    r >= -EPS && r <= 1 + EPS && g >= -EPS && g <= 1 + EPS && b >= -EPS && b <= 1 + EPS
  );
}

/**
 * OKLCh → #rrggbb, gamut-mapped into sRGB by reducing chroma at constant
 * lightness and hue.
 *
 * Interpolating between two in-gamut brand anchors can bulge outside sRGB in
 * the middle (OKLCh is not a convex hull of the sRGB solid). Naively clipping
 * the RGB channels shifts hue AND lightness — the two properties a ramp must
 * hold steady. Reducing chroma instead is the standard CSS Color 4 remedy
 * (§13.2), and it degrades exactly the property that is over-budget.
 *
 * The search is a fixed 24-iteration bisection, so the result depends only on
 * the input — no convergence-dependent iteration count that could differ
 * across platforms.
 */
export function oklchToHex([L, C, h]) {
  const direct = oklabToLinearRgb(oklchToOklab([L, C, h]));
  if (inSrgbGamut(direct)) {
    return rgbToHex(direct.map((c) => linearToSrgb(Math.min(1, Math.max(0, c))) * 255));
  }

  let lo = 0; // C = 0 is always in gamut for L within [0, 1] (it is a grey).
  let hi = C;
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2;
    if (inSrgbGamut(oklabToLinearRgb(oklchToOklab([L, mid, h])))) lo = mid;
    else hi = mid;
  }
  const mapped = oklabToLinearRgb(oklchToOklab([L, lo, h]));
  return rgbToHex(mapped.map((c) => linearToSrgb(Math.min(1, Math.max(0, c))) * 255));
}

/**
 * Interpolate between two OKLCh colors at position `t` ∈ [0, 1].
 *
 * Hue takes the shortest arc, so a family whose anchors straddle 0°/360°
 * (poppy sits at ~34°, pink at ~350°) never sweeps the long way round through
 * the opposite side of the wheel. A neutral endpoint (C = 0) has no meaningful
 * hue, so it borrows the other endpoint's — otherwise mixing a grey with a
 * brand color would drag the hue toward an arbitrary 0°.
 */
export function mixOklch(a, b, t) {
  const [L1, C1, h1raw] = a;
  const [L2, C2, h2raw] = b;

  const h1 = C1 < 1e-6 ? h2raw : h1raw;
  const h2 = C2 < 1e-6 ? h1raw : h2raw;

  let dh = h2 - h1;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;

  return [L1 + (L2 - L1) * t, C1 + (C2 - C1) * t, h1 + dh * t];
}
