/**
 * Tests for scripts/validate-blueprints.mjs's registry-sync directions (#2313).
 *
 * Each case writes a throwaway blueprint tree and runs the gate against it with
 * `--root`, so no real blueprint data is touched — the same seam and shape as
 * `scripts/lint-disabled-fade.test.mjs` (#1697).
 *
 * The case that matters is `activeSet → rails`, the direction #2313 exists to
 * add. Before it, the gate built `activeSet` and never iterated it, so an
 * `is_active: true` key absent from BOTH `BLUEPRINT_REGISTRY` and
 * `WIRED_BLUEPRINT_KEYS` was invisible — `npm run validate` was green with 18
 * keys in that state (#2308). `is_active` is the seed filter for the portal's
 * content-generator vocabulary, so those were keys the model could emit and
 * neither rail could render.
 *
 * The other two directions get cases too. A one-directional gate is what this
 * whole ticket is about, so asserting only the new arrow would repeat the
 * mistake at the test layer.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const GATE = join(dirname(fileURLToPath(import.meta.url)), 'validate-blueprints.mjs');

/** @type {string[]} */
const dirs = [];

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A schema-valid library entry. Only `key` and `is_active` vary per case. */
function entry(key, isActive = true) {
  return {
    key,
    name: key,
    section_type: 'hero',
    industries: ['universal'],
    moods: ['modern'],
    layout_spec: 'A hero.',
    tier: 'internal',
    is_active: isActive,
    version: '1.0.0',
    last_reviewed: '2026-09-08',
    required_facts: [],
  };
}

/**
 * Plant a tree. `active` are library keys with `is_active: true`; `registry`
 * and `wired` are the two runtime sets. Leaving a key out of one is the
 * violation each case is testing.
 */
function plant({ active = [], inactive = [], registry = [], wired = [], reactRegistry }) {
  const root = mkdtempSync(join(tmpdir(), 'validate-blueprints-'));
  dirs.push(root);

  mkdirSync(join(root, 'blueprints'), { recursive: true });
  mkdirSync(join(root, 'content-system', 'blueprints', 'astro'), { recursive: true });
  mkdirSync(join(root, 'content-system', 'blueprints', 'react'), { recursive: true });

  const write = (rel, body) => writeFileSync(join(root, rel), body, 'utf8');

  write(
    'blueprints/blueprint-library.json',
    JSON.stringify(
      {
        version: '1.0.0',
        // Today, so validateReviewCadence never fires and every failure below
        // is attributable to the direction under test.
        last_reviewed: new Date().toISOString().slice(0, 10),
        review_cadence: 'quarterly',
        blueprints: [...active.map((k) => entry(k)), ...inactive.map((k) => entry(k, false))],
      },
      null,
      2,
    ),
  );

  write(
    'blueprints/blueprint-roadmap.json',
    JSON.stringify(
      {
        kind: 'blueprint-roadmap',
        version: '1.0.0',
        last_reviewed: new Date().toISOString().slice(0, 10),
        review_cadence: 'quarterly',
        candidates: [],
      },
      null,
      2,
    ),
  );

  const registryBody = registry.map((k) => `  ${k}: Stub,`).join('\n');
  write(
    'content-system/blueprints/astro/BlueprintDispatcher.astro',
    `---\nconst BLUEPRINT_REGISTRY = {\n${registryBody}\n} as const;\n---\n`,
  );

  const reactBody = (reactRegistry ?? registry).map((k) => `  ${k}: Stub,`).join('\n');
  write(
    'content-system/blueprints/react/BlueprintDispatcher.tsx',
    `const BLUEPRINT_REGISTRY: Partial<Record<string, unknown>> = {\n${reactBody}\n};\n`,
  );

  const wiredBody = wired.map((k) => `  '${k}',`).join('\n');
  write(
    'content-system/blueprints/astro/types.ts',
    `export const WIRED_BLUEPRINT_KEYS = [\n${wiredBody}\n] as const;\n`,
  );

  return root;
}

/** Run the gate. Returns `{ status, output }` without throwing on exit 1. */
function run(root) {
  try {
    const output = execFileSync('node', [GATE, '--root', root], { encoding: 'utf8' });
    return { status: 0, output };
  } catch (err) {
    return { status: err.status, output: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  }
}

describe('validate-blueprints registry-sync directions', () => {
  it('passes when the active set, both registries, and WIRED_BLUEPRINT_KEYS agree', () => {
    // The honest negative control. A gate that cannot go green on a correct
    // tree is unusable, and this is the shape `main` is in after #2308.
    const root = plant({ active: ['hero_a', 'hero_b'], registry: ['hero_a', 'hero_b'], wired: ['hero_a', 'hero_b'] });
    const { status } = run(root);
    expect(status).toBe(0);
  });

  it('fails on an is_active key that dispatches on neither rail (#2313 AC 1)', () => {
    // THE planted violation. `hero_phantom` is is_active: true and appears in
    // no registry and not in WIRED_BLUEPRINT_KEYS — invisible to the gate
    // before this direction existed.
    const root = plant({
      active: ['hero_a', 'hero_phantom'],
      registry: ['hero_a'],
      wired: ['hero_a'],
    });
    const { status, output } = run(root);

    expect(status).toBe(1);
    expect(output).toContain('hero_phantom');
    expect(output).toContain('dispatches on neither rail');
  });

  it('does not fire on an is_active: false key with no component', () => {
    // The rule is about the flag, not the absence. An explicitly inactive key
    // with nothing built is a correct state, not a violation — flagging it
    // would make `is_active: false` unusable as a disposition.
    const root = plant({
      active: ['hero_a'],
      inactive: ['hero_not_built'],
      registry: ['hero_a'],
      wired: ['hero_a'],
    });
    const { status } = run(root);
    expect(status).toBe(0);
  });

  it('fails on a registry key missing from WIRED_BLUEPRINT_KEYS', () => {
    const root = plant({ active: ['hero_a', 'hero_b'], registry: ['hero_a', 'hero_b'], wired: ['hero_a'] });
    const { status, output } = run(root);

    expect(status).toBe(1);
    expect(output).toContain('missing from WIRED_BLUEPRINT_KEYS');
  });

  it('fails on a wired key with no registry entry', () => {
    const root = plant({ active: ['hero_a', 'hero_b'], registry: ['hero_a'], wired: ['hero_a', 'hero_b'] });
    const { status, output } = run(root);

    expect(status).toBe(1);
    expect(output).toContain('has no registry entry');
  });

  it('fails when the Astro and React registries diverge', () => {
    const root = plant({
      active: ['hero_a', 'hero_b'],
      registry: ['hero_a', 'hero_b'],
      reactRegistry: ['hero_a'],
      wired: ['hero_a', 'hero_b'],
    });
    const { status, output } = run(root);

    expect(status).toBe(1);
    expect(output).toContain('falls back in React');
  });
});
