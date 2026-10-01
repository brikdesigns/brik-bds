import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Rule `responsive-token-swap` (#2592).
 *
 * A base gap/padding declaration and its @media override for the same
 * selector must stay in the same token family and must not invert direction
 * (a max-width override stepping to a LARGER rung, or a min-width override
 * stepping to a SMALLER one). Either side using a deprecated rung is also
 * flagged. Fixtures go through --css-files rather than components/ui itself —
 * brik-bds's own component CSS carries zero of these pairs today (the 11
 * violating pairs this ticket was filed against live in a separate repo's
 * CSS, out of this script's scan scope), so there is nothing to mutate.
 */

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const LINTER = resolve(REPO_ROOT, 'scripts', 'lint-tokens.js');

function runLinter(cssFiles) {
  const args = ['--json', '--errors-only', '--css-files', ...cssFiles];
  const result = spawnSync('node', [LINTER, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  const payload = JSON.parse(result.stdout);
  return payload.violations.filter((v) => v.rule === 'responsive-token-swap');
}

describe('lint-tokens Rule 13 (responsive-token-swap)', () => {
  let tmpDir;

  beforeAll(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'bds-lint-responsive-swap-'));
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('fails on an inverted pair — narrower viewport gets a LARGER rung (the #2592 .hero-text case)', () => {
    const file = join(tmpDir, 'Inverted.css');
    writeFileSync(file, `
      .hero-text {
        gap: var(--bds-gap-sm);
      }
      @media (max-width: 991px) {
        .hero-text {
          gap: var(--bds-gap-xl);
        }
      }
    `);
    const violations = runLinter([file]);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toMatch(/inverts at @media \(max-width: 991px\)/);
    expect(violations[0].message).toMatch(/narrower viewport gets --bds-gap-sm → --bds-gap-xl/);
  });

  it('passes a max-width override that steps to the same or a smaller rung', () => {
    const file = join(tmpDir, 'ValidMax.css');
    writeFileSync(file, `
      .panel {
        padding: var(--bds-padding-lg);
      }
      @media (max-width: 639px) {
        .panel {
          padding: var(--bds-padding-sm);
        }
      }
    `);
    expect(runLinter([file])).toEqual([]);
  });

  it('passes a min-width override that steps to the same or a larger rung', () => {
    const file = join(tmpDir, 'ValidMin.css');
    writeFileSync(file, `
      .rail {
        gap: var(--bds-gap-xs);
      }
      @media (min-width: 768px) {
        .rail {
          gap: var(--bds-gap-lg);
        }
      }
    `);
    expect(runLinter([file])).toEqual([]);
  });

  it('fails on a min-width override that steps to a SMALLER rung', () => {
    const file = join(tmpDir, 'InvertedMin.css');
    writeFileSync(file, `
      .rail {
        gap: var(--bds-gap-lg);
      }
      @media (min-width: 768px) {
        .rail {
          gap: var(--bds-gap-xs);
        }
      }
    `);
    const violations = runLinter([file]);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toMatch(/wider viewport gets --bds-gap-lg → --bds-gap-xs/);
  });

  it('fails when a semantic base swaps to a raw --bds-space-* primitive (one of the #2592 cross-family cases)', () => {
    const file = join(tmpDir, 'CrossFamily.css');
    writeFileSync(file, `
      .card {
        gap: var(--bds-gap-md);
      }
      @media (max-width: 991px) {
        .card {
          gap: var(--bds-space-1600);
        }
      }
    `);
    const violations = runLinter([file]);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toMatch(/swaps families at @media \(max-width: 991px\)/);
  });

  it('fails when the base or override uses a deprecated 2xs/2xl rung', () => {
    const file = join(tmpDir, 'Deprecated.css');
    writeFileSync(file, `
      .tile {
        padding: var(--bds-padding-2xs);
      }
      @media (min-width: 768px) {
        .tile {
          padding: var(--bds-padding-md);
        }
      }
    `);
    const violations = runLinter([file]);
    expect(violations.map((v) => v.message)).toContainEqual(
      expect.stringContaining('uses deprecated --bds-padding-2xs'),
    );
  });

  it('honours bds-lint-ignore on the override line', () => {
    const file = join(tmpDir, 'Ignored.css');
    writeFileSync(file, `
      .hero-text {
        gap: var(--bds-gap-sm);
      }
      @media (max-width: 991px) {
        .hero-text {
          gap: var(--bds-gap-xl); /* bds-lint-ignore responsive-token-swap — intentional, see #1234 */
        }
      }
    `);
    expect(runLinter([file])).toEqual([]);
  });

  it('does not fire across unrelated selectors sharing a property name', () => {
    const file = join(tmpDir, 'Unrelated.css');
    writeFileSync(file, `
      .a {
        gap: var(--bds-gap-sm);
      }
      @media (max-width: 991px) {
        .b {
          gap: var(--bds-gap-xl);
        }
      }
    `);
    expect(runLinter([file])).toEqual([]);
  });

  it('does not fire on a non-width @media condition (e.g. prefers-reduced-motion)', () => {
    const file = join(tmpDir, 'ReducedMotion.css');
    writeFileSync(file, `
      .thing {
        gap: var(--bds-gap-sm);
      }
      @media (prefers-reduced-motion: reduce) {
        .thing {
          gap: var(--bds-gap-none);
        }
      }
    `);
    expect(runLinter([file])).toEqual([]);
  });

  it('handles a multi-line comma-separated selector list (Grid.css shape)', () => {
    const file = join(tmpDir, 'MultiSelector.css');
    writeFileSync(file, `
      .bds-grid--cols-3,
      .bds-grid--cols-4 {
        gap: var(--bds-gap-sm);
      }
      @media (max-width: 991px) {
        .bds-grid--cols-3,
        .bds-grid--cols-4 {
          gap: var(--bds-gap-xl);
        }
      }
    `);
    const violations = runLinter([file]);
    expect(violations).toHaveLength(2);
    expect(violations.map((v) => v.message)).toEqual([
      expect.stringContaining('.bds-grid--cols-3 { gap } inverts'),
      expect.stringContaining('.bds-grid--cols-4 { gap } inverts'),
    ]);
  });

  it('passes brik-bds’s own component CSS (no violations in the real tree today)', () => {
    const violations = runLinter([
      resolve(REPO_ROOT, 'components', 'ui', 'Grid', 'Grid.css'),
      resolve(REPO_ROOT, 'components', 'ui', 'MediaTabs', 'MediaTabs.css'),
    ]);
    expect(violations).toEqual([]);
  });
});
