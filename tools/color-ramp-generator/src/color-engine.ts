/**
 * Brik Color Ramp Engine
 *
 * Generates Tailwind-quality 11-stop color scales using CIE LCH color space.
 * Works in LCH (perceptually uniform) so lightness steps feel visually consistent
 * across hues — prevents the muddy mid-tones you get from simple HSL interpolation.
 *
 * Calibrated against tints.dev output to match quality and character.
 */

import chroma from 'chroma-js';

export const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type Stop = typeof STOPS[number];

// CIE LCH lightness targets per stop (L: 0–100 scale)
// Calibrated to match tints.dev / Tailwind CSS generator output
const LIGHTNESS: Record<Stop, number> = {
  50:  97,
  100: 93,
  200: 87,
  300: 79,
  400: 71,
  500: 62,
  600: 53,
  700: 42,
  800: 34,
  900: 27,
  950: 17,
};

// Chroma multipliers: reduce saturation at extremes to avoid neon lights / mud
// 500 is always 1.0 (the anchor stop matches your input color's saturation)
// Calibrated against Tailwind CSS generator output — near-neutral at 50,
// strong saturation 100-400, gentle fade on dark end
const CHROMA: Record<Stop, number> = {
  50:  0.08,
  100: 0.28,
  200: 0.50,
  300: 0.76,
  400: 0.92,
  500: 1.00,
  600: 0.88,
  700: 0.68,
  800: 0.52,
  900: 0.42,
  950: 0.30,
};

export interface ColorStop {
  stop: Stop;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

export interface ColorRamp {
  name: string;
  inputHex: string;
  stops: ColorStop[];
}

function hexToCmyk(hex: string): { c: number; m: number; y: number; k: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - r - k) / (1 - k)) * 100),
    m: Math.round(((1 - g - k) / (1 - k)) * 100),
    y: Math.round(((1 - b - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

export function generateRamp(name: string, inputHex: string): ColorRamp | null {
  let base: chroma.Color;
  try {
    base = chroma(inputHex);
  } catch {
    return null;
  }

  const [inputL, baseChr, baseHue] = base.lch();

  // Anchor input color at stop 500 exactly, distribute curve proportionally
  const REF_500 = LIGHTNESS[500];
  const LIGHT_MAX = 97;
  const DARK_MIN = 17;

  function anchoredLightness(stop: Stop): number {
    if (stop === 500) return inputL;
    if (stop < 500) {
      const t = (LIGHTNESS[stop] - REF_500) / (LIGHT_MAX - REF_500);
      return inputL + t * (LIGHT_MAX - inputL);
    }
    const t = (REF_500 - LIGHTNESS[stop]) / (REF_500 - DARK_MIN);
    return inputL - t * (inputL - DARK_MIN);
  }

  // Dark-end hue rotation: shift toward warmer tones (lower LCH hue) as stops
  // go darker. Matches Tailwind's warm-brown character in 700–950 range.
  // Max rotation of ~15° at stop 950, zero at 500 and above.
  const HUE_ROTATION: Partial<Record<Stop, number>> = {
    600: -2,
    700: -6,
    800: -10,
    900: -13,
    950: -15,
  };

  const stops: ColorStop[] = STOPS.map((stop) => {
    const targetL = anchoredLightness(stop);
    const targetC = baseChr * CHROMA[stop];
    const hueShift = HUE_ROTATION[stop] ?? 0;
    const color = stop === 500 ? base : chroma.lch(targetL, targetC, baseHue + hueShift);
    const hexVal = color.hex();
    const [r, g, b] = color.rgb().map(Math.round);
    const [h, s, l] = color.hsl();

    return {
      stop,
      hex: hexVal,
      rgb: { r, g, b },
      hsl: {
        h: Math.round(h ?? 0),
        s: Math.round((s ?? 0) * 100),
        l: Math.round((l ?? 0) * 100),
      },
      cmyk: hexToCmyk(hexVal),
    };
  });

  return { name, inputHex: base.hex(), stops };
}

export function isValidHex(hex: string): boolean {
  return /^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hex.trim());
}

export function normalizeHex(hex: string): string {
  const h = hex.trim().replace(/^#?/, '#');
  if (h.length === 4) {
    // Expand shorthand: #abc → #aabbcc
    return '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  }
  return h.toLowerCase();
}
