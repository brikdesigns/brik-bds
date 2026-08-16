import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

// Integration tests for the Tier 4 hook-discipline rules in scripts/lint-tokens.js
// (brik-bds#1043 / ADR-014): `fallback-literal` and `retired-bp-namespace`.
// Exercised via the CLI's --json mode against temp-dir fixtures, mirroring the
// Rule 5 suite, so the test doesn't couple to the script's CommonJS internals.

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const LINTER = resolve(REPO_ROOT, 'scripts', 'lint-tokens.js');

function runLinter({ cssFiles = [], files = [], rule }) {
  const args = ['--json', '--errors-only'];
  if (cssFiles.length > 0) args.push('--css-files', ...cssFiles);
  if (files.length > 0) args.push('--files', ...files);
  const result = spawnSync('node', [LINTER, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  const payload = JSON.parse(result.stdout);
  return payload.violations.filter((v) => v.rule === rule);
}

describe('lint-tokens Rule 7 (fallback-literal) — #1043 / ADR-014', () => {
  let tmpDir;
  beforeAll(() => { tmpDir = mkdtempSync(join(tmpdir(), 'bds-lint-fallback-')); });
  afterAll(() => { rmSync(tmpDir, { recursive: true, force: true }); });

  it('fires on the canonical failure: a raw shadow literal in a var() fallback', () => {
    const file = join(tmpDir, 'RawShadow.css');
    writeFileSync(file, `
      .x { box-shadow: var(--bds-toast-shadow, 0 4px 12px rgba(0, 0, 0, 0.08)); }
    `);
    const violations = runLinter({ cssFiles: [file], rule: 'fallback-literal' });
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toMatch(/Raw literal .* in var\(--bds-toast-shadow/);
    expect(violations[0].message).toMatch(/never a raw value/);
  });

  it('fires on a hex literal fallback', () => {
    const file = join(tmpDir, 'RawHex.css');
    writeFileSync(file, `
      .x { color: var(--bds-card-fg, #ffffff); }
    `);
    const violations = runLinter({ cssFiles: [file], rule: 'fallback-literal' });
    expect(violations).toHaveLength(1);
  });

  it('fires on a numeric dimension fallback', () => {
    const file = join(tmpDir, 'RawDim.css');
    writeFileSync(file, `
      .x { inline-size: var(--bds-hero-icon, 2.5rem); }
    `);
    const violations = runLinter({ cssFiles: [file], rule: 'fallback-literal' });
    expect(violations).toHaveLength(1);
  });

  it('passes a nested Semantic-token fallback (the correct Tier 4 shape)', () => {
    const file = join(tmpDir, 'NestedToken.css');
    writeFileSync(file, `
      .x { box-shadow: var(--bds-toast-shadow, var(--shadow-md)); }
    `);
    const violations = runLinter({ cssFiles: [file], rule: 'fallback-literal' });
    expect(violations).toEqual([]);
  });

  it('passes a CSS keyword fallback (transparent / uppercase are not Tier-1 values)', () => {
    const file = join(tmpDir, 'Keyword.css');
    writeFileSync(file, `
      .a { background: var(--surface-navigation, transparent); }
      .b { text-transform: var(--text-transform-subtitle, uppercase); }
    `);
    const violations = runLinter({ cssFiles: [file], rule: 'fallback-literal' });
    expect(violations).toEqual([]);
  });

  it('honours bds-lint-ignore on the same line', () => {
    const file = join(tmpDir, 'Ignored.css');
    writeFileSync(file, `
      .x { box-shadow: var(--bds-toast-shadow, 0 4px 12px rgba(0,0,0,0.08)); /* bds-lint-ignore */ }
    `);
    const violations = runLinter({ cssFiles: [file], rule: 'fallback-literal' });
    expect(violations).toEqual([]);
  });

  // ── Line-wrapped declarations — #1473 ─────────────────────────────────────
  // The rule used to bail on any `var(` whose parens didn't close on the same
  // line, so a formatter line-break silently defeated it. That is how four real
  // ADR-014 violations shipped undetected in the blueprints.

  it('fires on a wrapped declaration — a line break must not defeat the rule', () => {
    // NB: use a token that is NOT in FALLBACK_LITERAL_BASELINE — the real
    // `--bds-*-padding-y` knobs are grandfathered to `warning`, and runLinter
    // filters on --errors-only.
    const file = join(tmpDir, 'Wrapped.css');
    writeFileSync(file, `
      .x {
        padding-block: var(
          --bds-wrapped-padding-y,
          clamp(16px, 6vw, 48px)
        );
      }
    `);
    const violations = runLinter({ cssFiles: [file], rule: 'fallback-literal' });
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toMatch(/var\(--bds-wrapped-padding-y/);
    // The wrap is collapsed so the reported literal reads as one declaration.
    expect(violations[0].message).toContain('clamp(16px, 6vw, 48px)');
  });

  it('treats the wrapped and one-line forms of one declaration identically', () => {
    const wrapped = join(tmpDir, 'FormA.css');
    const oneLine = join(tmpDir, 'FormB.css');
    writeFileSync(wrapped, `
      .x {
        padding-block: var(
          --bds-probe-padding-y,
          clamp(16px, 6vw, 48px)
        );
      }
    `);
    writeFileSync(oneLine, `
      .x { padding-block: var(--bds-probe-padding-y, clamp(16px, 6vw, 48px)); }
    `);
    const a = runLinter({ cssFiles: [wrapped], rule: 'fallback-literal' });
    const b = runLinter({ cssFiles: [oneLine], rule: 'fallback-literal' });
    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);
    expect(a[0].message).toEqual(b[0].message);
  });

  it('reports a wrapped violation once, at the line the var() opens on', () => {
    const file = join(tmpDir, 'WrappedOnce.css');
    writeFileSync(file, `.x {
  padding-block: var(
    --bds-once-padding-y,
    clamp(16px, 6vw, 48px)
  );
}
`);
    const violations = runLinter({ cssFiles: [file], rule: 'fallback-literal' });
    expect(violations).toHaveLength(1);
    expect(violations[0].line).toBe(2); // the `padding-block: var(` line
  });

  it('passes a wrapped nested-token fallback (the correct Tier 4 shape)', () => {
    const file = join(tmpDir, 'WrappedNested.css');
    writeFileSync(file, `
      .x {
        box-shadow: var(
          --bds-toast-shadow,
          var(--shadow-md)
        );
      }
    `);
    const violations = runLinter({ cssFiles: [file], rule: 'fallback-literal' });
    expect(violations).toEqual([]);
  });

  it('honours bds-lint-ignore anywhere inside a wrapped declaration', () => {
    const file = join(tmpDir, 'WrappedIgnored.css');
    writeFileSync(file, `
      .x {
        padding-block: var(
          --bds-ignored-padding-y,
          clamp(16px, 6vw, 48px) /* bds-lint-ignore — intentional */
        );
      }
    `);
    const violations = runLinter({ cssFiles: [file], rule: 'fallback-literal' });
    expect(violations).toEqual([]);
  });

  it('does not let an unterminated paren swallow later declarations', () => {
    // A stray `(` must not cause the scanner to run away and mis-attribute a
    // violation from a later, unrelated rule.
    const file = join(tmpDir, 'Runaway.css');
    writeFileSync(file, `
      .a { content: "("; }
      .b { color: var(--bds-safe-fg, var(--text-primary)); }
    `);
    const violations = runLinter({ cssFiles: [file], rule: 'fallback-literal' });
    expect(violations).toEqual([]);
  });
});

// ── Typed exemptions — #1044 / ADR-014 ──────────────────────────────────────
// Defaults that no design token can express: runtime bindings, off-scale
// geometry knobs, and responsive clamp()/min()/max() anchored on tokens. Each
// is exempt; everything else still errors (the baselines were burned down).
describe('lint-tokens Rule 7 (fallback-literal) — typed exemptions #1044', () => {
  let tmpDir;
  beforeAll(() => { tmpDir = mkdtempSync(join(tmpdir(), 'bds-lint-exempt-')); });
  afterAll(() => { rmSync(tmpDir, { recursive: true, force: true }); });

  it('exempts a runtime-binding hook (--bds-slider-percent, set in TSX)', () => {
    const file = join(tmpDir, 'RuntimeBinding.css');
    writeFileSync(file, `
      .x { background: linear-gradient(to right, red var(--bds-slider-percent, 50%), blue 0); }
    `);
    expect(runLinter({ cssFiles: [file], rule: 'fallback-literal' })).toEqual([]);
  });

  it('exempts an off-scale geometry knob (--bds-grid-min-col-width, no scale rung)', () => {
    const file = join(tmpDir, 'GeometryKnob.css');
    writeFileSync(file, `
      .x { grid-template-columns: repeat(auto-fit, minmax(var(--bds-grid-min-col-width, 240px), 1fr)); }
    `);
    expect(runLinter({ cssFiles: [file], rule: 'fallback-literal' })).toEqual([]);
  });

  it('exempts a clamp() fallback anchored on Semantic tokens', () => {
    const file = join(tmpDir, 'TokenClamp.css');
    writeFileSync(file, `
      .x { padding-block: var(--bds-hero-padding-y, clamp(var(--padding-xl), 6vw, var(--padding-huge))); }
    `);
    expect(runLinter({ cssFiles: [file], rule: 'fallback-literal' })).toEqual([]);
  });

  it('exempts a min()/max() fallback anchored on tokens', () => {
    const file = join(tmpDir, 'TokenMinMax.css');
    writeFileSync(file, `
      .x { inline-size: var(--bds-panel-w, min(var(--size-2200), 90vw)); }
    `);
    expect(runLinter({ cssFiles: [file], rule: 'fallback-literal' })).toEqual([]);
  });

  it('STILL fires on a clamp() with raw px anchors (Tier-1 leakage, not exempt)', () => {
    const file = join(tmpDir, 'RawClamp.css');
    writeFileSync(file, `
      .x { padding-block: var(--bds-raw-padding-y, clamp(16px, 6vw, 48px)); }
    `);
    expect(runLinter({ cssFiles: [file], rule: 'fallback-literal' })).toHaveLength(1);
  });

  it('STILL fires on a non-exempt token with a bare % literal (allowlist is not blanket)', () => {
    const file = join(tmpDir, 'BarePercent.css');
    writeFileSync(file, `
      .x { width: var(--bds-not-listed, 50%); }
    `);
    expect(runLinter({ cssFiles: [file], rule: 'fallback-literal' })).toHaveLength(1);
  });
});

describe('lint-tokens Rule 8 (retired-bp-namespace) — #1043 / ADR-014', () => {
  let tmpDir;
  beforeAll(() => { tmpDir = mkdtempSync(join(tmpdir(), 'bds-lint-bp-')); });
  afterAll(() => { rmSync(tmpDir, { recursive: true, force: true }); });

  it('fires on a --bp-* reference and points at the --bds-* rename', () => {
    const file = join(tmpDir, 'BpRef.css');
    writeFileSync(file, `
      .x { background: var(--bp-hero-img-card-bg, var(--surface-primary)); }
    `);
    const violations = runLinter({ cssFiles: [file], rule: 'retired-bp-namespace' });
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toMatch(/use --bds-hero-img-card-bg instead/);
  });

  it('fires on a --bp-* definition', () => {
    const file = join(tmpDir, 'BpDef.css');
    writeFileSync(file, `
      .x { --bp-hero-img-card-bg: var(--surface-primary); }
    `);
    const violations = runLinter({ cssFiles: [file], rule: 'retired-bp-namespace' });
    expect(violations).toHaveLength(1);
  });

  it('passes once migrated to the sanctioned --bds-* namespace', () => {
    const file = join(tmpDir, 'BdsRef.css');
    writeFileSync(file, `
      .x { background: var(--bds-hero-img-card-bg, var(--surface-primary)); }
    `);
    const violations = runLinter({ cssFiles: [file], rule: 'retired-bp-namespace' });
    expect(violations).toEqual([]);
  });
});

describe('blueprint-path routing (pre-commit --files path) — #1043', () => {
  let tmpDir;
  beforeAll(() => { tmpDir = mkdtempSync(join(tmpdir(), 'bds-lint-bproute-')); });
  afterAll(() => { rmSync(tmpDir, { recursive: true, force: true }); });

  // Regression guard: a staged blueprint passed via --files must be routed to
  // the Tier 4 rule subset. The `isBlueprint` matcher must accept relative
  // (no leading slash) paths, not only absolute findFiles() paths.
  function blueprintFixture(name, body) {
    const dir = join(tmpDir, 'content-system', 'blueprints', 'react');
    mkdirSync(dir, { recursive: true });
    const file = join(dir, name);
    writeFileSync(file, body);
    return file;
  }

  it('routes a --files blueprint path through fallback-literal', () => {
    const file = blueprintFixture('Reg.css', `
      .x { box-shadow: var(--bds-foo, 0 4px 12px rgba(0,0,0,0.08)); }
    `);
    const violations = runLinter({ files: [file], rule: 'fallback-literal' });
    expect(violations).toHaveLength(1);
  });

  it('routes a --files blueprint path through retired-bp-namespace', () => {
    const file = blueprintFixture('Reg2.css', `
      .x { background: var(--bp-foo-bar, var(--surface-primary)); }
    `);
    const violations = runLinter({ files: [file], rule: 'retired-bp-namespace' });
    expect(violations).toHaveLength(1);
  });
});
