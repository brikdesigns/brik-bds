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

/** A schema-valid library entry. Only `key`, `is_active`, and `rails` vary. */
function entry(key, isActive = true, rails) {
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
    ...(rails ? { rails } : {}),
  };
}

/** `hero_a` → `HeroA` — the component file a registry key resolves to. */
const pascal = (key) => key.replace(/(^|_)([a-z0-9])/g, (_, __, c) => c.toUpperCase());

/**
 * Plant a tree. `active` are library keys with `is_active: true`; `registry`
 * and `wired` are the two runtime sets. Leaving a key out of one is the
 * violation each case is testing.
 *
 * Since #2304 the tree also carries the files the two filesystem axes read: a
 * component per registry key on each rail, a `.stories.tsx` beside every React
 * component, and the three structural non-blueprints
 * (`BlueprintDispatcher` / `BlueprintFallback` / `SiteHeader`). The last group
 * exists because the on-disk gate asserts its own exclusion list still resolves
 * on disk — a synthetic tree missing them is not a violation to detect, it is
 * an unrealistic tree.
 *
 * Options for the new axes:
 *   - `rails`        — `{ key: ['astro'] }`, the declared single-rail divergence
 *   - `noStory`      — React keys whose `.stories.tsx` is not written
 *   - `badStoryTitle`— React keys whose story sits outside `Blueprints/`
 *   - `orphans`      — `{ astro: [...], react: [...] }` component files written
 *                      to disk and wired into nothing
 *   - `chained`      — `{ Component: 'Inner' }`, an extra file reachable ONLY
 *                      through another component's import
 */
function plant({
  active = [],
  inactive = [],
  registry = [],
  wired = [],
  reactRegistry,
  rails = {},
  noStory = [],
  badStoryTitle = [],
  orphans = {},
  chained = {},
}) {
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
        blueprints: [
          ...active.map((k) => entry(k, true, rails[k])),
          ...inactive.map((k) => entry(k, false, rails[k])),
        ],
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

  const astroImports = registry.map((k) => `import ${pascal(k)} from './${pascal(k)}.astro';`).join('\n');
  const registryBody = registry.map((k) => `  ${k}: { component: ${pascal(k)}, props: {} },`).join('\n');
  write(
    'content-system/blueprints/astro/BlueprintDispatcher.astro',
    `---\n${astroImports}\nconst BLUEPRINT_REGISTRY = {\n${registryBody}\n} as const;\n---\n`,
  );

  const reactKeys = reactRegistry ?? registry;
  const reactImports = reactKeys.map((k) => `import { ${pascal(k)} } from './${pascal(k)}';`).join('\n');
  const reactBody = reactKeys.map((k) => `  ${k}: ${pascal(k)},`).join('\n');
  write(
    'content-system/blueprints/react/BlueprintDispatcher.tsx',
    `${reactImports}\nconst BLUEPRINT_REGISTRY: Partial<Record<string, unknown>> = {\n${reactBody}\n};\n`,
  );

  const wiredBody = wired.map((k) => `  '${k}',`).join('\n');
  write(
    'content-system/blueprints/astro/types.ts',
    `export const WIRED_BLUEPRINT_KEYS = [\n${wiredBody}\n] as const;\n`,
  );

  // Structural non-blueprints — see the doc comment above.
  write('content-system/blueprints/astro/BlueprintFallback.astro', '---\n---\n');
  write('content-system/blueprints/astro/SiteHeader.astro', '---\n---\n');
  write('content-system/blueprints/react/BlueprintFallback.tsx', 'export function BlueprintFallback() { return null; }\n');

  // One component per dispatched key, plus any deliberately-unreachable file.
  for (const k of registry) {
    const name = pascal(k);
    const inner = chained[name];
    write(
      `content-system/blueprints/astro/${name}.astro`,
      `---\n${inner ? `import ${inner} from './${inner}.astro';\n` : ''}---\n`,
    );
  }
  for (const name of orphans.astro ?? []) {
    write(`content-system/blueprints/astro/${name}.astro`, '---\n---\n');
  }

  for (const k of reactKeys) {
    const name = pascal(k);
    const inner = chained[name];
    write(
      `content-system/blueprints/react/${name}.tsx`,
      `${inner ? `import { ${inner} } from './${inner}';\n` : ''}export function ${name}() { return null; }\n`,
    );
    if (noStory.includes(k)) continue;
    const title = badStoryTitle.includes(k) ? `Blocks/${k}` : `Blueprints/${k.replace(/_/g, '-')}`;
    write(
      `content-system/blueprints/react/${name}.stories.tsx`,
      `const meta = { title: '${title}' };\nexport default meta;\n`,
    );
  }
  for (const name of orphans.react ?? []) {
    write(`content-system/blueprints/react/${name}.tsx`, `export function ${name}() { return null; }\n`);
  }
  for (const name of Object.values(chained)) {
    write(`content-system/blueprints/astro/${name}.astro`, '---\n---\n');
    write(`content-system/blueprints/react/${name}.tsx`, `export function ${name}() { return null; }\n`);
  }

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

describe('validate-blueprints on-disk parity (#2304 AC 1)', () => {
  it('fails on a component file no registry reaches', () => {
    // THE planted violation for this axis. `HeroGhost` is on disk on both
    // rails and dispatched by neither — the #2012 shape, invisible to every
    // declaration-vs-declaration check above.
    const root = plant({
      active: ['hero_a'],
      registry: ['hero_a'],
      wired: ['hero_a'],
      orphans: { astro: ['HeroGhost'], react: ['HeroGhost'] },
    });
    const { status, output } = run(root);

    expect(status).toBe(1);
    expect(output).toContain('HeroGhost');
    expect(output).toContain('reachable from no BLUEPRINT_REGISTRY entry');
  });

  it('does not fire on a component reached only through another component', () => {
    // Reachability is transitive by design. Since #2302 the rails are two
    // layers deep — the registry dispatches an adapter, the adapter composes a
    // block — so a direct-dispatch rule would call eleven correctly-wired
    // files orphans on `main` and could only be greened with an allowlist.
    const root = plant({
      active: ['hero_a'],
      registry: ['hero_a'],
      wired: ['hero_a'],
      chained: { HeroA: 'HeroInner' },
    });
    const { status } = run(root);
    expect(status).toBe(0);
  });

  it('fails when a NON_BLUEPRINT_COMPONENTS name no longer exists on disk', () => {
    // The exclusion list is a category, not cover. If an entry stops resolving
    // the gate says so, rather than letting a dead name sit there ready to
    // widen the rule the next time someone reads it as an allowlist.
    const root = plant({ active: ['hero_a'], registry: ['hero_a'], wired: ['hero_a'] });
    rmSync(join(root, 'content-system', 'blueprints', 'astro', 'SiteHeader.astro'));
    const { status, output } = run(root);

    expect(status).toBe(1);
    expect(output).toContain('SiteHeader');
    expect(output).toContain('no longer on disk');
  });
});

describe('validate-blueprints story coverage (#2304 AC 2)', () => {
  it('fails on a wired blueprint with no story', () => {
    const root = plant({
      active: ['hero_a', 'hero_b'],
      registry: ['hero_a', 'hero_b'],
      wired: ['hero_a', 'hero_b'],
      noStory: ['hero_b'],
    });
    const { status, output } = run(root);

    expect(status).toBe(1);
    expect(output).toContain('hero_b');
    expect(output).toContain('no Storybook story');
  });

  it('fails on a story that sits outside the Blueprints bucket', () => {
    const root = plant({
      active: ['hero_a'],
      registry: ['hero_a'],
      wired: ['hero_a'],
      badStoryTitle: ['hero_a'],
    });
    const { status, output } = run(root);

    expect(status).toBe(1);
    expect(output).toContain('not under `Blueprints/`');
  });

  it('keys off the React registry, not the Astro one', () => {
    // Storybook here is @storybook/react-vite and its globs match
    // .stories.{js,jsx,mjs,ts,tsx} only, so an Astro block cannot carry a
    // story until #2339 gives the rail a framework integration. A key declared
    // astro-only therefore owes no story — asserting otherwise would fail every
    // Astro block by construction, which is a blocked build, not a gate.
    const root = plant({
      active: ['hero_a', 'hero_astro_only'],
      registry: ['hero_a', 'hero_astro_only'],
      reactRegistry: ['hero_a'],
      wired: ['hero_a', 'hero_astro_only'],
      rails: { hero_astro_only: ['astro'] },
    });
    const { status } = run(root);
    expect(status).toBe(0);
  });
});

describe('validate-blueprints rails declaration (#2304 AC 3)', () => {
  it('accepts a declared astro-only key with no React entry', () => {
    const root = plant({
      active: ['hero_a', 'hero_astro_only'],
      registry: ['hero_a', 'hero_astro_only'],
      reactRegistry: ['hero_a'],
      wired: ['hero_a', 'hero_astro_only'],
      rails: { hero_astro_only: ['astro'] },
    });
    const { status } = run(root);
    expect(status).toBe(0);
  });

  it('fails a declared react-only key that is still in the Astro registry', () => {
    // The declaration is checked, not trusted. `rails: ['react']` beside a live
    // Astro entry is drift wearing a rails field — the field would otherwise be
    // a way to silence the parity gate without changing anything.
    const root = plant({
      active: ['hero_a'],
      registry: ['hero_a'],
      wired: ['hero_a'],
      rails: { hero_a: ['react'] },
    });
    const { status, output } = run(root);

    expect(status).toBe(1);
    expect(output).toContain('declares rails without "astro"');
  });

  it('fails a declared rail the key does not actually dispatch on', () => {
    const root = plant({
      active: ['hero_a', 'hero_ghost'],
      registry: ['hero_a'],
      wired: ['hero_a'],
      rails: { hero_ghost: ['react'] },
    });
    const { status, output } = run(root);

    expect(status).toBe(1);
    expect(output).toContain('declares the "react" rail but has no React BLUEPRINT_REGISTRY entry');
  });

  it('rejects rails that lists every rail', () => {
    // "Both" is the default. Spelling it out adds a second place to update when
    // a third rail appears, and reads as a decision where none was made.
    const root = plant({
      active: ['hero_a'],
      registry: ['hero_a'],
      wired: ['hero_a'],
      rails: { hero_a: ['astro', 'react'] },
    });
    const { status, output } = run(root);

    expect(status).toBe(1);
    expect(output).toContain('omit the field');
  });

  it('rejects an unknown rail value', () => {
    const root = plant({
      active: ['hero_a'],
      registry: ['hero_a'],
      wired: ['hero_a'],
      rails: { hero_a: ['svelte'] },
    });
    const { status, output } = run(root);

    expect(status).toBe(1);
    expect(output).toContain('Unknown rail "svelte"');
  });
});
