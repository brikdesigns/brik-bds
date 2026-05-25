import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

// Integration tests for Rule 5 (token-family pairing) in scripts/lint-tokens.js.
// The linter is a CLI; we exercise it via --json mode against temp-dir fixtures
// to avoid coupling the test to the script's internal CommonJS structure.

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const LINTER = resolve(REPO_ROOT, 'scripts', 'lint-tokens.js');

function runLinter({ tsxFiles = [], cssFiles = [] }) {
  const args = ['--json', '--errors-only'];
  if (tsxFiles.length > 0) args.push('--files', ...tsxFiles);
  if (cssFiles.length > 0) args.push('--css-files', ...cssFiles);
  const result = spawnSync('node', [LINTER, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  // JSON output is on stdout regardless of exit code.
  const payload = JSON.parse(result.stdout);
  return payload.violations.filter((v) => v.rule === 'token-family');
}

describe('lint-tokens Rule 5 (token-family pairing)', () => {
  let tmpDir;

  beforeAll(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'bds-lint-family-'));
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('fires on the canonical failure example from #578 (TSX inline style)', () => {
    const file = join(tmpDir, 'Failure.tsx');
    writeFileSync(file, `
      export function Failure() {
        return <span style={{ backgroundColor: 'var(--text-service-marketing)' }} />;
      }
    `);
    const violations = runLinter({ tsxFiles: [file] });
    expect(violations.length).toBe(1);
    expect(violations[0].message).toMatch(/backgroundColor.*--text-service-marketing/);
    expect(violations[0].message).toMatch(/text-family token in background slot/);
  });

  it('fires on CSS property using wrong-family token (background-color: var(--text-*))', () => {
    const file = join(tmpDir, 'Failure.css');
    writeFileSync(file, `
      .x { background-color: var(--text-service-marketing); }
    `);
    const violations = runLinter({ cssFiles: [file] });
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toMatch(/text-family token in background slot/);
  });

  it('fires on custom-property declaration using wrong-family value', () => {
    const file = join(tmpDir, 'Decl.css');
    writeFileSync(file, `
      .x { --background-inverse: var(--text-service-marketing); }
    `);
    const violations = runLinter({ cssFiles: [file] });
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toMatch(/--background-inverse.*--text-service-marketing/);
  });

  it('fires on border-color: var(--text-*) and outline-color: var(--text-*)', () => {
    const file = join(tmpDir, 'BorderOutline.css');
    writeFileSync(file, `
      .a { border-color: var(--text-negative); }
      .b { outline-color: var(--text-positive); }
    `);
    const violations = runLinter({ cssFiles: [file] });
    expect(violations).toHaveLength(2);
    expect(violations.map((v) => v.message)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/text-family token in border slot/),
        expect.stringMatching(/text-family token in outline slot/),
      ]),
    );
  });

  it('passes ServiceTag-style canonical pairings (--background-service-* + --text-service-*)', () => {
    const file = join(tmpDir, 'ServiceTagLike.css');
    writeFileSync(file, `
      .bds-service-tag--brand {
        background-color: var(--background-service-brand);
        color: var(--text-service-brand);
      }
    `);
    const violations = runLinter({ cssFiles: [file] });
    expect(violations).toEqual([]);
  });

  it('passes canonical same-family custom-property override (--background-inverse: var(--background-primary))', () => {
    const file = join(tmpDir, 'SafeDecl.css');
    writeFileSync(file, `
      .x { --background-inverse: var(--background-primary); }
    `);
    const violations = runLinter({ cssFiles: [file] });
    expect(violations).toEqual([]);
  });

  it('honours bds-lint-ignore on the same line', () => {
    const file = join(tmpDir, 'Ignored.css');
    writeFileSync(file, `
      .x { background-color: var(--border-muted); /* bds-lint-ignore token-family */ }
    `);
    const violations = runLinter({ cssFiles: [file] });
    expect(violations).toEqual([]);
  });

  it('does not fire on border CSS shorthand (out of scope — bundles width/style)', () => {
    const file = join(tmpDir, 'Shorthand.css');
    writeFileSync(file, `
      .x { border: 1px solid var(--text-negative); }
    `);
    const violations = runLinter({ cssFiles: [file] });
    expect(violations).toEqual([]);
  });
});
