import { describe, it, expect, afterAll } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Rule `spacing-mode-track` (#2588).
 *
 * Every `[data-mode-spacing]` track collapsed `--gap-tiny` and `--gap-xs` to
 * `0px` and `npm run lint-tokens:grid` still exited 0 — step 5 read only
 * `tokens/figma-tokens.css`, and `grid-4pt` is warning-only by design. These
 * tests pin the three failure classes the new rule must block on, and the fact
 * that it blocks without `--check-grid` (the `validate` path never passes it).
 *
 * The `--padding-*` family joined the rule in #2613, once its own broken
 * `compact` rungs were fixed in Figma. Each family gets the same four cases:
 * the two families resolve separate base tracks and separate overrides, so a
 * regex or a track-resolution bug can reach one and miss the other.
 */

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const LINTER = resolve(REPO_ROOT, 'scripts', 'lint-tokens.js');
// The rule resolves this path itself, so a fixture has to stand in for the
// real file rather than live beside it.
const MODES_SPACING = resolve(REPO_ROOT, 'tokens', 'modes-spacing.css');

const PRISTINE = readFileSync(MODES_SPACING, 'utf8');
afterAll(() => writeFileSync(MODES_SPACING, PRISTINE));

/** Run the default (no --check-grid) error scan and return its violations. */
function errorScan() {
  const res = spawnSync('node', [LINTER, '--errors-only', '--json'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  if (res.error || typeof res.stdout !== 'string' || res.stdout.trim() === '') {
    throw new Error(
      `lint-tokens produced no JSON — status=${res.status} signal=${res.signal} ` +
      `error=${res.error && res.error.code} stderr=${JSON.stringify((res.stderr || '').slice(-600))}`,
    );
  }
  return { status: res.status, violations: JSON.parse(res.stdout).violations };
}

function withModesCss(mutate) {
  writeFileSync(MODES_SPACING, mutate(PRISTINE));
  try {
    return errorScan();
  } finally {
    writeFileSync(MODES_SPACING, PRISTINE);
  }
}

const trackErrors = (violations) =>
  violations.filter((v) => v.rule === 'spacing-mode-track');

describe('spacing-mode-track — --padding-*', () => {
  it('fails when a named padding rung collapses to 0px', () => {
    const { status, violations } = withModesCss((css) =>
      css.replace('--padding-tiny: 2px;', '--padding-tiny: 0px;'),
    );
    expect(status).toBe(1);
    expect(trackErrors(violations).map((v) => v.message)).toContainEqual(
      expect.stringContaining('[compact] --padding-tiny is 0px'),
    );
  });

  it('fails when a padding track stops being strictly increasing', () => {
    const { status, violations } = withModesCss((css) =>
      css.replace('--padding-xl: 40px;', '--padding-xl: 16px;'),
    );
    expect(status).toBe(1);
    expect(trackErrors(violations).map((v) => v.message)).toContainEqual(
      expect.stringContaining('[comfortable] padding scale is not strictly increasing'),
    );
  });

  it('fails on an off-grid padding override', () => {
    const { status, violations } = withModesCss((css) =>
      css.replace('--padding-lg: 48px;', '--padding-lg: 49px;'),
    );
    expect(status).toBe(1);
    expect(trackErrors(violations).map((v) => v.message)).toContainEqual(
      expect.stringContaining('[spacious] --padding-lg is 49px — off the 4-point grid'),
    );
  });

  it('resolves un-overridden padding rungs from the base track', () => {
    // `comfortable` emits no --padding-tiny (it equals the base 8px), so pulling
    // --padding-xs down to 8px breaks monotonicity only if the base rung is
    // resolved — modes-spacing.css alone shows a lone 8px and nothing wrong.
    const { violations } = withModesCss((css) =>
      css.replace('--padding-xs: 12px;', '--padding-xs: 8px;'),
    );
    expect(trackErrors(violations).map((v) => v.message)).toContainEqual(
      expect.stringContaining('[comfortable] padding scale is not strictly increasing'),
    );
  });
});

describe('spacing-mode-track', () => {
  it('passes on the committed mode tracks', () => {
    const { status, violations } = errorScan();
    expect(trackErrors(violations)).toEqual([]);
    expect(status).toBe(0);
  });

  it('fails when a named rung collapses to 0px', () => {
    const { status, violations } = withModesCss((css) =>
      css.replace('--gap-tiny: 1px;', '--gap-tiny: 0px;'),
    );
    expect(status).toBe(1);
    expect(trackErrors(violations).map((v) => v.message)).toContainEqual(
      expect.stringContaining('[compact] --gap-tiny is 0px'),
    );
  });

  it('fails when a track stops being strictly increasing', () => {
    const { status, violations } = withModesCss((css) =>
      css.replace('--gap-xl: 104px;', '--gap-xl: 8px;'),
    );
    expect(status).toBe(1);
    expect(trackErrors(violations).map((v) => v.message)).toContainEqual(
      expect.stringContaining('[spacious] gap scale is not strictly increasing'),
    );
  });

  it('fails on an off-grid override', () => {
    const { status, violations } = withModesCss((css) =>
      css.replace('--gap-lg: 56px;', '--gap-lg: 57px;'),
    );
    expect(status).toBe(1);
    expect(trackErrors(violations).map((v) => v.message)).toContainEqual(
      expect.stringContaining('[spacious] --gap-lg is 57px — off the 4-point grid'),
    );
  });

  it('resolves un-overridden rungs from the base track', () => {
    // `comfortable` emits no --gap-tiny (it equals the base), so a base-only
    // regression must still surface against that track — reading
    // modes-spacing.css alone would see nothing at all here.
    const { violations } = withModesCss((css) =>
      css.replace('--gap-sm: 8px;', '--gap-sm: 2px;'),
    );
    expect(trackErrors(violations).map((v) => v.message)).toContainEqual(
      expect.stringContaining('[comfortable] gap scale is not strictly increasing'),
    );
  });
});
