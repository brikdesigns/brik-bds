/**
 * Tests for the blueprint-key context-word rule (#2303 / ADR-037 §4).
 *
 * Each case plants a throwaway manifest + type surface and runs the gate
 * against it with `--root`, so no real blueprint data is touched — the same
 * seam and shape as `scripts/validate-blueprints.test.mjs` (#2313).
 *
 * The rule ships with **no allowlist**, so the only thing keeping it honest is
 * a case per banned word class plus a case proving the shipped key vocabulary
 * still passes. A rule that only ever runs against a clean tree is a rule
 * nobody has seen fire.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const GATE = join(dirname(fileURLToPath(import.meta.url)), 'lint-blueprint-naming.mjs');

/** @type {string[]} */
const dirs = [];

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A schema-shaped library entry. Only `key` varies per case. */
function entry(key) {
  return {
    key,
    name: key,
    section_type: 'hero',
    industries: ['universal'],
    moods: ['modern'],
    layout_spec: 'A hero.',
    tier: 'internal',
    is_active: true,
    version: '1.0.0',
    last_reviewed: '2026-09-09',
    required_facts: [],
  };
}

/**
 * Plant a tree carrying `keys` in both declaration sites the rule reads —
 * the manifest and `astro/types.ts`. Returns the root.
 */
function plant(keys) {
  const root = mkdtempSync(join(tmpdir(), 'lint-blueprint-naming-'));
  dirs.push(root);

  mkdirSync(join(root, 'blueprints'), { recursive: true });
  writeFileSync(
    join(root, 'blueprints', 'blueprint-library.json'),
    JSON.stringify(
      { version: '1.0.0', last_reviewed: '2026-09-09', review_cadence: 'quarterly', blueprints: keys.map(entry) },
      null,
      2,
    ),
  );

  const astroDir = join(root, 'content-system', 'blueprints', 'astro');
  mkdirSync(astroDir, { recursive: true });
  writeFileSync(
    join(astroDir, 'types.ts'),
    [
      'export type KnownBlueprintKey =',
      ...keys.map((k) => `  | '${k}'`),
      ';',
      '',
      'export const WIRED_BLUEPRINT_KEYS = [',
      ...keys.map((k) => `  '${k}',`),
      '] as const;',
      '',
    ].join('\n'),
  );

  // The component rules read this dir; leaving it empty keeps each case to the
  // one rule under test.
  mkdirSync(join(root, 'content-system', 'blueprints', 'react'), { recursive: true });

  return root;
}

/** Run the gate. Returns `{ status, output }` — never throws on exit 1. */
function run(root) {
  try {
    const output = execFileSync('node', [GATE, '--root', root, '--errors-only'], {
      encoding: 'utf8',
    });
    return { status: 0, output };
  } catch (err) {
    return { status: err.status, output: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  }
}

describe('blueprint-key-context-word', () => {
  it('passes the shipped key vocabulary', () => {
    const { status, output } = run(
      plant([
        'hero_split',
        'hero_split_image_card_overlay',
        'hero_interior_minimal',
        'two_column_detail',
        'card_grid',
        'callout_split',
        'feature_grid',
        'story_split',
        'stats_bar',
        'testimonials_featured_large',
        'cta_split_contact',
        'cta_centered',
      ]),
    );
    expect(output).not.toContain('blueprint-key-context-word');
    expect(status).toBe(0);
  });

  it('rejects a content-domain word', () => {
    const { status, output } = run(plant(['services_card_grid']));
    expect(status).toBe(1);
    expect(output).toContain('blueprint-key-context-word');
    expect(output).toContain('`services` is a content domain');
  });

  it('rejects an atmosphere word', () => {
    const { status, output } = run(plant(['cta_dark_centered']));
    expect(status).toBe(1);
    expect(output).toContain('`dark` is an atmosphere/brand word');
  });

  it('rejects a baked-in column count or ratio', () => {
    const { status, output } = run(plant(['hero_split_60_40']));
    expect(status).toBe(1);
    expect(output).toContain('bakes a column count or ratio');
  });

  it('flags the key in both declaration sites, not just the manifest', () => {
    const { output } = run(plant(['team_bio_grid']));
    expect(output).toContain('blueprint-library.json');
    expect(output).toContain('types.ts');
  });

  it('fires under --files too, since the key set has no pre-existing violations', () => {
    const root = plant(['support_plan_callout_split']);
    let status = 0;
    let output = '';
    try {
      output = execFileSync(
        'node',
        [GATE, '--root', root, '--errors-only', '--files'],
        { encoding: 'utf8' },
      );
    } catch (err) {
      status = err.status;
      output = `${err.stdout ?? ''}${err.stderr ?? ''}`;
    }
    expect(status).toBe(1);
    expect(output).toContain('`support` is a content domain');
  });
});
