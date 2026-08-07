import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

import { STOPS, ANCHOR_STOPS, buildAll } from '../generate-color-ramps.mjs';
import { hexToOklch } from '../lib/oklch.mjs';
import { contrastRatio, isHex } from '../lib/wcag.mjs';

// The generator is both a CLI and a module. The invariant tests import it
// directly (fast, and they assert on structure the CLI only serializes); the
// drift-gate test shells out, because `--check`'s whole job is comparing the
// committed file against a fresh run.

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const GENERATOR = resolve(REPO_ROOT, 'scripts', 'generate-color-ramps.mjs');
const OUTPUT = resolve(REPO_ROOT, 'design-tokens', 'color-ramps.generated.json');
const BRAND_KIT = resolve(REPO_ROOT, 'design-tokens', 'brand-kits', 'brik.json');

const { payload } = buildAll();
const families = Object.entries(payload).flatMap(([kit, k]) =>
  Object.entries(k['primitives/value'].color).map(([family, stops]) => ({
    label: `${kit}/${family}`,
    family,
    stops,
  })),
);

const hexOf = (stops, stop) => stops[stop].$value;
const kindOf = (stops, stop) => stops[stop].$extensions['com.brikdesigns.ramp'].source;

describe('generate-color-ramps — ramp shape', () => {
  it('emits every brand-kit family', () => {
    expect(families.map((f) => f.label).sort()).toEqual([
      'brik/blue',
      'brik/grayscale',
      'brik/green',
      'brik/orange',
      'brik/pink',
      'brik/poppy',
      'brik/purple',
      'brik/tan',
      'brik/yellow',
    ]);
  });

  it.each(families)('$label emits the 11 stops in order', ({ stops }) => {
    expect(Object.keys(stops)).toEqual(STOPS);
  });

  it.each(families)('$label emits only in-gamut #rrggbb values', ({ stops }) => {
    for (const stop of STOPS) {
      const hex = hexOf(stops, stop);
      expect(isHex(hex), `${stop} = ${hex}`).toBe(true);
      expect(hex).toBe(hex.toLowerCase());
    }
  });
});

describe('generate-color-ramps — anchors are preserved byte for byte', () => {
  // brik-bds#1065 AC: "existing 6-step values are reproducible as a subset".
  // Exact, not approximate — the alias layer (#1739) maps the old names onto
  // these stops, so any drift here silently reskins every consumer.
  const kit = JSON.parse(readFileSync(BRAND_KIT, 'utf8'))['primitives/value'].color;

  it.each(families)('$label round-trips all six named steps', ({ family, stops }) => {
    // Post-#1739 the kit holds the value on the numeric stop and the legacy
    // name is an alias onto it, so the assertion resolves one hop. That is
    // strictly stronger than the pre-#1739 literal comparison: it pins BOTH
    // that the alias targets the right stop and that the value is unchanged.
    for (const [name, stop] of Object.entries(ANCHOR_STOPS)) {
      expect(kindOf(stops, stop)).toBe('anchor');
      expect(kit[family][name].$value).toBe(`{color.${family}.${stop}}`);
      expect(hexOf(stops, stop)).toBe(String(kit[family][stop].$value).toLowerCase());
    }
  });

  it.each(families)('$label emits all 11 numeric stops as literals in the kit', ({ family, stops }) => {
    for (const stop of STOPS) {
      const value = kit[family][stop].$value;
      expect(value, `${family}.${stop}`).toMatch(/^#[0-9a-f]{6}$/);
      expect(value).toBe(hexOf(stops, stop));
    }
  });

  it.each(families)('$label marks every legacy alias deprecated', ({ family }) => {
    for (const name of Object.keys(ANCHOR_STOPS)) {
      expect(kit[family][name].$description).toMatch(/^DEPRECATED —/);
    }
  });

  it('leaves grayscale white/black out of the numeric scale', () => {
    const grayscale = families.find((f) => f.family === 'grayscale').stops;
    const values = STOPS.map((s) => hexOf(grayscale, s));
    expect(values).not.toContain('#ffffff');
    expect(values).not.toContain('#000000');
  });
});

describe('generate-color-ramps — perceptual invariants', () => {
  it.each(families)('$label is strictly monotonic in OKLCh lightness', ({ stops }) => {
    const lightness = STOPS.map((s) => hexToOklch(hexOf(stops, s))[0]);
    for (let i = 1; i < lightness.length; i += 1) {
      expect(
        lightness[i],
        `${STOPS[i]} (L ${lightness[i].toFixed(3)}) must be darker than ` +
          `${STOPS[i - 1]} (L ${lightness[i - 1].toFixed(3)})`,
      ).toBeLessThan(lightness[i - 1]);
    }
  });

  it.each(families)('$label never pushes a generated stop off its anchors’ hue arc', ({ stops }) => {
    // A generated stop is the OKLCh midpoint of two anchors, so its hue must
    // sit ON the arc between theirs — never outside it. Gamut mapping reduces
    // chroma at CONSTANT hue, so it cannot push a stop off-hue; this asserts
    // that property survives the round-trip through 8-bit sRGB.
    //
    // NOT a fixed per-stop budget: the source anchors are hand-picked brand
    // values whose own hues wander (yellow spans 78°–105° across its six
    // steps), so "within N° of my neighbour" would fail on data that is
    // perfectly correct. Containment is the invariant that actually holds.
    for (const stop of STOPS) {
      const ext = stops[stop].$extensions['com.brikdesigns.ramp'];
      if (ext.source !== 'generated') continue;

      const [, C, h] = hexToOklch(hexOf(stops, stop));
      // Below this chroma, hue is quantization noise: at C ≈ 0.015 the OKLab
      // a/b components are ~0.001, so a single 1/255 rounding step swings the
      // reported hue by several degrees. Tan and grayscale live here, and
      // their hue is not a perceptible property to begin with.
      if (C < 0.03) continue;

      const [loKey, hiKey] = ext.midpointOf;
      const hLo = hexToOklch(hexOf(stops, loKey))[2];
      // A white endpoint has no hue of its own — mixOklch borrows the other
      // side's, so the arc collapses to a point.
      const hHi = hiKey === 'white' ? hLo : hexToOklch(hexOf(stops, hiKey))[2];

      const arc = ((hHi - hLo + 540) % 360) - 180; // signed shortest arc
      const offset = ((h - hLo + 540) % 360) - 180; // where the stop landed on it
      const TOLERANCE = 2; // 8-bit sRGB quantization

      const lo = Math.min(0, arc) - TOLERANCE;
      const hi = Math.max(0, arc) + TOLERANCE;
      expect(
        offset,
        `${stop} (h ${h.toFixed(1)}°) must lie between ${loKey} (${hLo.toFixed(1)}°) ` +
          `and ${hiKey} (${hHi.toFixed(1)}°)`,
      ).toBeGreaterThanOrEqual(lo);
      expect(offset).toBeLessThanOrEqual(hi);
    }
  });
});

describe('generate-color-ramps — the gaps the scale exists to close', () => {
  it('mints a near-poppy stop that clears AA on white (brik-bds#479 / #1065)', () => {
    // ADR-016 Option C's durable fix needs an intermediate between
    // --color-poppy-light (#e35335, 3.78:1) and --color-poppy-dark (#b0351b,
    // ~6.2:1) that reaches 4.5:1. The 6-step ladder had nowhere to put it.
    const poppy = families.find((f) => f.family === 'poppy').stops;
    expect(contrastRatio(hexOf(poppy, '500'), '#ffffff')).toBeLessThan(4.5);
    expect(kindOf(poppy, '600')).toBe('generated');
    expect(contrastRatio(hexOf(poppy, '600'), '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });

  it('mints a mid-grey between light and lighter (brik-bds#1726)', () => {
    // --color-grayscale-light (#828282) jumped straight to
    // --color-grayscale-lighter (#e0e0e0); consumers hand-pinned #bdbdbd.
    const grayscale = families.find((f) => f.family === 'grayscale').stops;
    expect(kindOf(grayscale, '400')).toBe('generated');
    const L = hexToOklch(hexOf(grayscale, '400'))[0];
    expect(L).toBeLessThan(hexToOklch('#e0e0e0')[0]);
    expect(L).toBeGreaterThan(hexToOklch('#828282')[0]);
  });
});

describe('generate-color-ramps — CLI', () => {
  it('is deterministic across runs', () => {
    const a = JSON.stringify(buildAll().payload);
    const b = JSON.stringify(buildAll().payload);
    expect(a).toBe(b);
  });

  it('--check passes against the committed file', () => {
    const result = spawnSync('node', [GENERATOR, '--check'], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    });
    expect(result.stderr + result.stdout).toContain('in sync');
    expect(result.status).toBe(0);
  });

  it('--check fails when the committed file is stale', () => {
    const original = readFileSync(OUTPUT, 'utf8');
    try {
      writeFileSync(OUTPUT, original.replace('"#ffefeb"', '"#ff0000"'));
      const result = spawnSync('node', [GENERATOR, '--check'], {
        cwd: REPO_ROOT,
        encoding: 'utf8',
      });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('stale');
    } finally {
      writeFileSync(OUTPUT, original);
    }
  });
});
