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
