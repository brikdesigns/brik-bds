import { describe, it, expect, afterAll } from 'vitest';
import { writeFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Rule 9 coverage outside `components/ui` (#1646).
 *
 * `lint-tokens` calls itself the authoritative bare-marker gate, but its scan
 * walked `components/ui` + blueprints only. `stories/` is walked by no gate at
 * all, so 16 bare markers sat there passing CI. These tests pin the coverage,
 * not the rule — the rule itself was always correct when reached.
 */

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const LINTER = resolve(REPO_ROOT, 'scripts', 'lint-tokens.js');

// Fixtures must live under the real scanned roots — the whole point is that the
// DEFAULT scan reaches them, which a tmpdir cannot exercise.
const FIXTURES = [
  join(REPO_ROOT, 'stories', '__lint-fixture__.ts'),
  join(REPO_ROOT, '.storybook', '__lint-fixture__.ts'),
];

afterAll(() => {
  for (const f of FIXTURES) if (existsSync(f)) rmSync(f, { force: true });
});

/** Full default scan (no --files), so we test the roots rather than the rule. */
function defaultScanViolations() {
  const result = spawnSync('node', [LINTER, '--json', '--errors-only'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 40 * 1024 * 1024,
  });
  return JSON.parse(result.stdout).violations.filter(
    (v) => v.rule === 'bare-lint-ignore',
  );
}

describe('bare-lint-ignore coverage', () => {
  it('the repo is clean by default — no bare markers anywhere scanned', () => {
    expect(defaultScanViolations()).toEqual([]);
  });

  it.each(FIXTURES)('catches a bare marker in %s on the default scan', (fixture) => {
    mkdirSync(resolve(fixture, '..'), { recursive: true });
    writeFileSync(fixture, "export const x = { color: 'red' }; // bds-lint-ignore\n");
    try {
      const hits = defaultScanViolations();
      expect(hits.length).toBe(1);
      expect(hits[0].file).toContain('__lint-fixture__');
    } finally {
      rmSync(fixture, { force: true });
    }
  });

  it('accepts a reasoned marker in the same location', () => {
    const fixture = FIXTURES[0];
    writeFileSync(fixture, "export const x = { color: 'red' }; // bds-lint-ignore — demo only\n");
    try {
      expect(defaultScanViolations()).toEqual([]);
    } finally {
      rmSync(fixture, { force: true });
    }
  });
});
