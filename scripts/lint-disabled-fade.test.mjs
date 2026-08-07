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

  // ── RULE C: the pt-1 fill boundary (#1701) ──
  // The regression these guard is the one the gate shipped blind to: Chip and
  // Tag printed `✓` while being the only open violation of pt-1, because the
  // gate only ever asked which token the fade read.

  it('fails a fader that paints its own fill at the root', () => {
    const { code, out } = run(
      tree({
        Chip: `.bds-chip--secondary {\n  background-color: var(--background-secondary);\n}\n` + FADE.replace(/thing/g, 'chip'),
      }),
    );
    expect(code).toBe(1);
    const v = JSON.parse(out).violations;
    expect(v).toHaveLength(1);
    expect(v[0].rule).toBe('fill-bearing-fader');
    expect(v[0].component).toBe('Chip');
  });

  it('passes once that component moves to the swap', () => {
    const { code } = run(
      tree({
        Chip:
          `.bds-chip--secondary {\n  background-color: var(--background-secondary);\n}\n` +
          `.bds-chip--disabled {\n  background-color: var(--background-disabled);\n  color: var(--text-disabled);\n}\n`,
      }),
    );
    expect(code).toBe(0);
  });

  it('passes a fader whose fill is a surface token', () => {
    // ADR-028 pt-2 in prose: an input materialises the surface it sits on.
    // Gating these would flag 13 components the ADR explicitly covers.
    const { code, out } = run(
      tree({
        TextInput: `.bds-text-input {\n  background-color: var(--background-input);\n}\n` + FADE.replace(/thing/g, 'text-input'),
      }),
    );
    expect(code).toBe(0);
    expect(JSON.parse(out).ruleCCandidates.map((c) => c.component)).toEqual(['TextInput']);
  });

  it('passes when the fill and the disabled state are different elements', () => {
    // SegmentedControl: the track paints, only the item ever goes disabled, and
    // that item is transparent. Converting it would repaint a track nothing
    // disables — the false positive that element matching exists to kill.
    const { code, out } = run(
      tree({
        SegmentedControl:
          `.bds-segmented-control {\n  background-color: var(--background-secondary);\n}\n` +
          `.bds-segmented-control-item {\n  background-color: transparent;\n}\n` +
          `.bds-segmented-control-item:disabled {\n  opacity: var(--state-disabled-opacity);\n}\n`,
      }),
    );
    expect(code).toBe(0);
    expect(JSON.parse(out).ruleCCandidates).toEqual([]);
  });

  it('passes when the fill and the fade are different variants', () => {
    // Tag after #1701: `--subtle` is an outline and fades, `--solid` paints and
    // swaps. Both are `.bds-tag`, so element matching alone reports the swapped
    // variant as a violation of the faded one.
    const { code, out } = run(
      tree({
        Tag:
          `.bds-tag--solid {\n  background-color: var(--background-secondary);\n}\n` +
          `.bds-tag--solid.bds-tag--disabled {\n  background-color: var(--background-disabled);\n  color: var(--text-disabled);\n}\n` +
          `.bds-tag--subtle {\n  background-color: transparent;\n}\n` +
          `.bds-tag--subtle.bds-tag--disabled {\n  opacity: var(--state-disabled-opacity);\n}\n`,
      }),
    );
    expect(code).toBe(0);
    expect(JSON.parse(out).ruleCCandidates).toEqual([]);
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
