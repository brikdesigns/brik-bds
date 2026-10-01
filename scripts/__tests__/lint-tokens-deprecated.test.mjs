import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

// brik-bds#1739. The six named color steps still resolve — they are aliases
// onto the 11-step numeric scale — but they are deprecated, and #1740 retires
// them. Rule 12 reports each use with its numeric replacement.

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const LINTER = resolve(REPO_ROOT, 'scripts', 'lint-tokens.js');
const FIGMA_TOKENS = resolve(REPO_ROOT, 'tokens', 'figma-tokens.css');
// ADR-043 / #2670: the 54 word steps are retired from canonical CSS and live
// only in the generated bridge, as `--color-poppy-light: var(--bds-color-poppy-500)`.
const BRIDGE = resolve(REPO_ROOT, 'tokens', 'compat', 'prefix-bridge.css');
const unprefix = (v) => v.replace(/--bds-/g, '--');
const RAMPS = resolve(REPO_ROOT, 'design-tokens', 'color-ramps.generated.json');
const ALIAS_BASELINE = resolve(REPO_ROOT, 'tokens', 'color-alias-baseline.json');

function lint(css) {
  const dir = mkdtempSync(join(tmpdir(), 'bds-deprecated-'));
  try {
    const file = join(dir, 'Sample.css');
    writeFileSync(file, css);
    const result = spawnSync('node', [LINTER, '--json', '--css-files', file], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    });
    return JSON.parse(result.stdout).violations.filter((v) => v.rule === 'deprecated-token');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('lint-tokens Rule 12 (deprecated-token)', () => {
  it('flags a 6-step name and names its numeric replacement', () => {
    const violations = lint('.x { color: var(--bds-color-poppy-light); }');
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('--bds-color-poppy-light');
    expect(violations[0].message).toContain('--bds-color-poppy-500');
  });

  it('warns rather than errors — the aliases are live and correct today', () => {
    // Erroring would fail the build on the 411 in-repo call sites this change
    // deliberately did not touch, turning a deprecation into a breaking change.
    expect(lint('.x { color: var(--bds-color-poppy-light); }')[0].severity).toBe('warning');
  });

  it('does not flag a numeric stop', () => {
    expect(lint('.x { color: var(--bds-color-poppy-500); }')).toHaveLength(0);
  });

  it('does not flag a semantic token that happens to resolve through one', () => {
    expect(lint('.x { color: var(--bds-text-brand-primary); }')).toHaveLength(0);
  });

  it('respects bds-lint-ignore', () => {
    expect(lint('.x { color: var(--bds-color-poppy-light); /* bds-lint-ignore */ }')).toHaveLength(0);
  });

  it('covers every family, from the generated file rather than a hand-list', () => {
    // AC 2 of #1739: "the mapping is generated from the ramp output, not
    // hand-maintained". If the rule ever regresses to a literal table, a newly
    // added family would silently stop being reported.
    const ramps = JSON.parse(readFileSync(RAMPS, 'utf8'));
    const families = Object.keys(ramps.brik['primitives/value'].color);
    expect(families.length).toBeGreaterThan(1);

    const css = families.map((f, i) => `.f${i} { color: var(--bds-color-${f}-light); }`).join('\n');
    expect(lint(css)).toHaveLength(families.length);
  });
});

describe('the alias layer preserves every legacy value (#1739 AC 1)', () => {
  // The contract the 606 existing call sites depend on: each `--color-*-<name>`
  // still resolves, through the bridge, and still paints the exact color it
  // painted before. The canonical CSS no longer declares the word steps.
  const canonical = new Map();
  for (const m of readFileSync(FIGMA_TOKENS, 'utf8').matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    if (!canonical.has(m[1])) canonical.set(m[1], m[2].trim());
  }
  const bridge = new Map();
  for (const m of readFileSync(BRIDGE, 'utf8').matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    if (!bridge.has(m[1])) bridge.set(m[1], m[2].trim());
  }

  const ramps = JSON.parse(readFileSync(RAMPS, 'utf8'));
  const cases = [];
  for (const [family, stops] of Object.entries(ramps.brik['primitives/value'].color)) {
    for (const [stop, entry] of Object.entries(stops)) {
      const ramp = entry.$extensions['com.brikdesigns.ramp'];
      if (ramp.source !== 'anchor') continue;
      cases.push({
        label: `--color-${family}-${ramp.legacyName}`,
        legacy: `--color-${family}-${ramp.legacyName}`,
        numeric: `--bds-color-${family}-${stop}`,
        hex: entry.$value,
      });
    }
  }

  it('has a case for all six steps of all nine families', () => {
    expect(cases).toHaveLength(54);
  });

  it.each(cases)('$label still resolves to its original value', ({ legacy, numeric, hex }) => {
    expect(bridge.get(legacy), `${legacy} must still be bridged`).toBe(`var(${numeric})`);
    expect(canonical.get(numeric)).toBe(hex);
  });

  it.each(cases)('$label is gone from canonical CSS (ADR-043 section 4)', ({ legacy }) => {
    expect(canonical.has(legacy)).toBe(false);
    expect(canonical.has(legacy.replace('--', '--bds-'))).toBe(false);
  });
});

describe('the named aliases still paint their FROZEN values (#1949)', () => {
  // tokens/color-alias-baseline.json is the constant a re-sync cannot move.
  // It stays keyed by the ORIGINAL (un-prefixed) names on purpose: the migration
  // must not move a shipped color, so the bridge is compared against the same
  // frozen file. A failure here is a shipped color changing — read it as a
  // visual diff to approve or revert, never as a stale file to regenerate away.
  const baseline = JSON.parse(readFileSync(ALIAS_BASELINE, 'utf8')).aliases;

  const decls = new Map();
  for (const f of [FIGMA_TOKENS, BRIDGE]) {
    for (const m of readFileSync(f, 'utf8').matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      if (!decls.has(m[1])) decls.set(m[1], m[2].trim());
    }
  }

  const resolved = {};
  for (const [name, value] of decls) {
    if (!/^--color-[a-z]+-(lightest|lighter|light|darkest|darker|dark)$/.test(name)) continue;
    const alias = unprefix(value).match(/^var\((--color-[a-z]+-\d+)\)$/);
    if (!alias) continue;
    resolved[name] = { alias: alias[1], hex: decls.get(`--bds-${alias[1].slice(2)}`) };
  }

  it('covers every named alias the bridge emits — no silent shrinkage', () => {
    // Guards the denominator. Deleting an alias would otherwise pass by simply
    // never being compared, which is the exact deletion #1949 defers.
    expect(Object.keys(resolved).sort()).toEqual(Object.keys(baseline).sort());
  });

  it.each(Object.entries(baseline).map(([token, e]) => ({ token, ...e })))(
    '$token still paints $hex',
    ({ token, alias, hex }) => {
      expect(resolved[token]?.alias, `${token} must still alias ${alias}`).toBe(alias);
      expect(resolved[token]?.hex, `${token} changed color — approve or revert`).toBe(hex);
    },
  );
});
