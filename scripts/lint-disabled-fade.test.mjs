/**
 * Tests for scripts/lint-disabled-fade.mjs (#1697).
 *
 * Each case writes a throwaway `components/ui`-shaped tree and runs the gate
 * against it with `--root`, so no real component CSS is touched. The four
 * regressions the gate exists to catch each get a case that MUST exit 1, and
 * the `:not(:disabled)` case MUST exit 0 — that one is the honest negative
 * control: TabBar carries six enabled `opacity: 0.5` rules behind
 * `:not(:disabled)`, and a gate that flagged them would be unusable.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const GATE = join(dirname(fileURLToPath(import.meta.url)), 'lint-disabled-fade.mjs');

/** @type {string[]} */
const trees = [];

afterEach(() => {
  while (trees.length) rmSync(trees.pop(), { recursive: true, force: true });
});

/** Build a fixture tree: { Component: 'css text' } → root path. */
function tree(components) {
  const root = mkdtempSync(join(tmpdir(), 'bds-disabled-fade-'));
  trees.push(root);
  for (const [name, css] of Object.entries(components)) {
    mkdirSync(join(root, name), { recursive: true });
    writeFileSync(join(root, name, `${name}.css`), css);
  }
  return root;
}

/** Run the gate; never throws, so a failing exit is assertable. */
function run(root) {
  try {
    return { code: 0, out: execFileSync('node', [GATE, '--root', root, '--json'], { encoding: 'utf8' }) };
  } catch (err) {
    return { code: err.status, out: err.stdout ?? '' };
  }
}

const FADE = `.bds-thing--disabled {\n  opacity: var(--state-disabled-opacity);\n  cursor: not-allowed;\n}\n`;
const SWAP = `.bds-thing:disabled {\n  background-color: var(--background-disabled);\n  color: var(--text-disabled);\n}\n`;

describe('lint-disabled-fade', () => {
  it('passes the two ADR-028 mechanisms', () => {
    const { code, out } = run(tree({ Faded: FADE, Swapped: SWAP }));
    expect(code).toBe(0);
    const json = JSON.parse(out);
    expect(json.fadeCohort).toEqual(['Faded']);
    expect(json.swapCohort).toEqual(['Swapped']);
    expect(json.violations).toEqual([]);
  });

  it('fails a hardcoded opacity literal', () => {
    const { code, out } = run(
      tree({ Thing: `.bds-thing--disabled {\n  opacity: 0.4;\n}\n` }),
    );
    expect(code).toBe(1);
    expect(JSON.parse(out).violations[0]).toMatchObject({
      rule: 'hardcoded-disabled-opacity',
      component: 'Thing',
      detail: 'opacity: 0.4',
    });
  });

  it('fails a var() fallback, which survives the token being renamed away', () => {
    const { code, out } = run(
      tree({ Thing: `.bds-thing--disabled {\n  opacity: var(--state-disabled-opacity, 0.4);\n}\n` }),
    );
    expect(code).toBe(1);
    expect(JSON.parse(out).violations[0].rule).toBe('hardcoded-disabled-opacity');
  });

  it('fails the muted-text swap ADR-028 pt-4 retired', () => {
    const { code, out } = run(
      tree({ Nav: `.bds-nav-item--disabled {\n  color: var(--text-muted);\n}\n` }),
    );
    expect(code).toBe(1);
    expect(JSON.parse(out).violations[0]).toMatchObject({
      rule: 'muted-text-swap',
      component: 'Nav',
    });
  });

  it('fails a component whose disabled rules carry no mechanism at all', () => {
    const { code, out } = run(
      tree({ Thing: `.bds-thing--disabled {\n  cursor: not-allowed;\n}\n` }),
    );
    expect(code).toBe(1);
    expect(JSON.parse(out).violations[0]).toMatchObject({
      rule: 'no-disabled-mechanism',
      component: 'Thing',
    });
  });

  it('ignores enabled rules behind :not(:disabled) — the TabBar shape', () => {
    const { code, out } = run(
      tree({
        TabBar:
          FADE +
          `.bds-tab-bar-item:hover:not(:disabled) {\n  opacity: 0.8;\n}\n` +
          `.bds-tab-bar-item:active:not(:disabled) {\n  opacity: 0.5;\n}\n`,
      }),
    );
    expect(code).toBe(0);
    expect(JSON.parse(out).violations).toEqual([]);
  });

  it('treats supporting rules as owing no mechanism of their own', () => {
    const { code } = run(
      tree({
        Checkbox:
          FADE +
          `.bds-checkbox--disabled .bds-checkbox__input {\n  cursor: not-allowed;\n}\n`,
      }),
    );
    expect(code).toBe(0);
  });

  it('honours a reasoned bds-lint-ignore but not a bare one', () => {
    const reasoned = run(
      tree({
        Thing: `.bds-thing--disabled {\n  opacity: 0.2; /* bds-lint-ignore disabled-fade — decorative scrim, not a control */\n}\n`,
      }),
    );
    expect(reasoned.code).toBe(0);

    const bare = run(
      tree({ Thing: `.bds-thing--disabled {\n  opacity: 0.2; /* bds-lint-ignore */\n}\n` }),
    );
    expect(bare.code).toBe(1);
    expect(JSON.parse(bare.out).violations[0].bareIgnore).toBe(true);
  });
});
