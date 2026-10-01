import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { fmtNum, buildFluidValue } from '../generate-modes-css.mjs';

// `generate()`/`emitFluid()` are CLI-only (not exported) — they read
// design-tokens/tokens-studio.json end to end, which is exercised by
// `npm run build:modes` itself. These tests exercise the two exported pure
// pieces: the number formatter, and the piecewise clamp() builder (ADR-042
// D3), plus a committed-file drift check against the exact strings it must
// keep emitting for --page-inset / --section-padding-block.

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const LAYOUT_FLUID_CSS = resolve(REPO_ROOT, 'tokens', 'layout-fluid.css');

// The two live ADR-042 endpoint sets (mobile@320 / tablet@768 / desktop@1440),
// in px — same units `layout/{mobile,tablet,desktop}` resolve to in Figma.
const PAGE_INSET = { w0: 320, w1: 768, w2: 1440, v0: 16, v1: 32, v2: 96 };
const SECTION_PADDING_BLOCK = { w0: 320, w1: 768, w2: 1440, v0: 64, v1: 80, v2: 104 };

/**
 * Generic CSS `calc(clamp(min, base + slopevw, max) + clamp(min, base + slopevw, max))`
 * evaluator — parses the two clamp() terms `buildFluidValue` emits and
 * resolves them at a given viewport width, at a 16px root (rem → px via *16).
 * This is CSS clamp()/vw semantics, not a re-implementation of the generator's
 * own slope/intercept math, so it is an independent check on the formula.
 */
function evalFluidCss(css, widthPx) {
  const re = /clamp\((-?[\d.]+)rem,\s*(-?[\d.]+)rem \+ (-?[\d.]+)vw,\s*(-?[\d.]+)rem\)/g;
  let total = 0;
  let match;
  let terms = 0;
  while ((match = re.exec(css)) !== null) {
    const [, minRem, baseRem, slopeVw, maxRem] = match.map(Number);
    const minPx = minRem * 16;
    const maxPx = maxRem * 16;
    const rawPx = baseRem * 16 + (slopeVw / 100) * widthPx;
    total += Math.max(minPx, Math.min(maxPx, rawPx));
    terms += 1;
  }
  if (terms !== 2) {
    throw new Error(`expected 2 clamp() terms, parsed ${terms} from: ${css}`);
  }
  return total;
}

describe('generate-modes-css — fmtNum', () => {
  it('prints integers bare', () => {
    expect(fmtNum(2)).toBe('2');
    expect(fmtNum(0)).toBe('0');
  });

  it('trims trailing zeros off a decimal', () => {
    expect(fmtNum(0.5)).toBe('0.5');
    expect(fmtNum(3.571400001)).not.toMatch(/0{2,}$/);
  });

  it('normalizes -0 to 0', () => {
    expect(fmtNum(-0)).toBe('0');
  });
});

describe('generate-modes-css — buildFluidValue (ADR-042 D3)', () => {
  it('throws on non-monotonic endpoints', () => {
    expect(() =>
      buildFluidValue({ w0: 320, w1: 768, w2: 1440, v0: 50, v1: 30, v2: 96 }),
    ).toThrow(/non-monotonic/i);
  });

  it('does not throw on monotonic (including flat) endpoints', () => {
    expect(() =>
      buildFluidValue({ w0: 320, w1: 768, w2: 1440, v0: 16, v1: 16, v2: 16 }),
    ).not.toThrow();
  });

  it.each([
    ['--bds-page-inset', PAGE_INSET],
    ['--bds-section-padding-block', SECTION_PADDING_BLOCK],
  ])('%s hits its mobile/tablet/desktop endpoints exactly', (_name, endpoints) => {
    const css = buildFluidValue(endpoints);
    expect(evalFluidCss(css, endpoints.w0)).toBeCloseTo(endpoints.v0, 2);
    expect(evalFluidCss(css, endpoints.w1)).toBeCloseTo(endpoints.v1, 2);
    expect(evalFluidCss(css, endpoints.w2)).toBeCloseTo(endpoints.v2, 2);
  });

  it.each([
    ['--bds-page-inset', PAGE_INSET],
    ['--bds-section-padding-block', SECTION_PADDING_BLOCK],
  ])('%s is flat above the desktop rung (1920 === 1440 value)', (_name, endpoints) => {
    const css = buildFluidValue(endpoints);
    expect(evalFluidCss(css, 1920)).toBeCloseTo(endpoints.v2, 2);
  });

  it.each([
    ['--bds-page-inset', PAGE_INSET],
    ['--bds-section-padding-block', SECTION_PADDING_BLOCK],
  ])('%s never breaches the mobile floor below 320 (280 === 320 value)', (_name, endpoints) => {
    const css = buildFluidValue(endpoints);
    expect(evalFluidCss(css, 280)).toBeCloseTo(endpoints.v0, 2);
  });

  it('--bds-page-inset emits the exact committed ADR-042 CSS string', () => {
    expect(buildFluidValue(PAGE_INSET)).toBe(
      'calc(clamp(1rem, 0.2857rem + 3.5714vw, 2rem) + clamp(0rem, -4.5714rem + 9.5238vw, 4rem))',
    );
  });

  it('--bds-section-padding-block emits the exact committed ADR-042 CSS string', () => {
    expect(buildFluidValue(SECTION_PADDING_BLOCK)).toBe(
      'calc(clamp(4rem, 3.2857rem + 3.5714vw, 5rem) + clamp(0rem, -1.7143rem + 3.5714vw, 1.5rem))',
    );
  });
});

describe('generate-modes-css — tokens/layout-fluid.css (committed output)', () => {
  const committed = readFileSync(LAYOUT_FLUID_CSS, 'utf8');

  it('ships --bds-page-inset at the exact ADR-042 value', () => {
    expect(committed).toContain(
      '--bds-page-inset: calc(clamp(1rem, 0.2857rem + 3.5714vw, 2rem) + clamp(0rem, -4.5714rem + 9.5238vw, 4rem));',
    );
  });

  it('ships --bds-section-padding-block at the exact ADR-042 value', () => {
    expect(committed).toContain(
      '--bds-section-padding-block: calc(clamp(4rem, 3.2857rem + 3.5714vw, 5rem) + clamp(0rem, -1.7143rem + 3.5714vw, 1.5rem));',
    );
  });

  it('carries no [data-mode-layout] selector — build-time clamp, not a runtime mode', () => {
    expect(committed).not.toMatch(/\[data-mode-layout/);
  });
});
