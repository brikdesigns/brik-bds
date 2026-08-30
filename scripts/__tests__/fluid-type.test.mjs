import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Fluid display type tier (brik-bds#959 / brik-client-portal#1350).
 *
 * Pins that the hand-authored `--display-fluid-*` clamp() tier is defined for
 * every display step, stays on-system (max anchors to a static --display-*
 * token, min to a --font-size-* primitive), is distinct from the static scale,
 * and is wired into the dist/tokens.css concat so consumers actually receive it.
 */

const here = dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = join(here, '..', '..', 'tokens');
const fluidCss = readFileSync(join(TOKENS_DIR, 'fluid-type.css'), 'utf8');
// Declarations only — the doc-comment intentionally cites resolved px (72.8px …).
const fluidDecls = fluidCss.replace(/\/\*[\s\S]*?\*\//g, '');
const buildScript = readFileSync(join(here, '..', 'build-dist-tokens.js'), 'utf8');

const STEPS = ['sm', 'md', 'lg', 'xl'];

describe('fluid-type.css — fluid display tier', () => {
  it('defines a fluid token for every display step', () => {
    for (const step of STEPS) {
      expect(fluidCss).toMatch(new RegExp(`--display-fluid-${step}\\s*:`));
    }
  });

  it('every fluid display token interpolates via clamp(min, vw, max)', () => {
    for (const step of STEPS) {
      const m = fluidCss.match(new RegExp(`--display-fluid-${step}\\s*:\\s*([^;]+);`));
      expect(m, `--display-fluid-${step} missing`).toBeTruthy();
      const value = m[1];
      expect(value).toContain('clamp(');
      expect(value).toMatch(/\dvw/); // viewport-relative preferred term
    }
  });

  it('anchors both bounds to --font-size-* primitives — no --display-* Semantic alias (ADR-035)', () => {
    // Both min and max resolve to a raw --font-size-* primitive. The max bound
    // used to alias the static --display-* Semantic, but a non-color Semantic
    // may not alias another Semantic (it would parasitize the type scale) — the
    // tier gate flags it (ADR-035, #2187), so both bounds are Primitives now.
    for (const step of STEPS) {
      const value = fluidCss.match(new RegExp(`--display-fluid-${step}\\s*:\\s*([^;]+);`))[1];
      expect(value).not.toContain(`var(--display-${step})`); // no Semantic alias
      expect(value.match(/var\(--font-size-\d+\)/g)?.length).toBe(2); // min + max, both primitives
    }
  });

  it('is distinct from the static display scale (additive, not a redefinition)', () => {
    // It must NOT redefine the static --display-sm/md/lg/xl tokens themselves.
    for (const step of STEPS) {
      expect(fluidCss).not.toMatch(new RegExp(`(?<!fluid-)--display-${step}\\s*:`));
    }
  });

  it('introduces no raw px (fluidity rides on tokens + vw only)', () => {
    expect(fluidDecls).not.toMatch(/\d+px/);
  });

  it('is wired into the dist/tokens.css concat', () => {
    expect(buildScript).toContain("'fluid-type.css'");
    expect(buildScript).toMatch(/fluidType/);
  });
});
