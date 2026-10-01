/**
 * The generated System ID bridge (ADR-043, #2670): old names alias to `--bds-`
 * names in EVERY selector block where the new name is declared, word steps live
 * only in the bridge, and the committed bridge matches its generator.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateBridge } from '../lib/token-bridge.mjs';
import { buildBridgeFromWorkingTree, BRIDGE_PATH } from '../build-token-bridge.mjs';
import { RENAMED_KNOBS, declarationMap, parseCustomProps, readLegacy, buildRenameMap } from '../lib/bds-prefix.mjs';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const legacy = {
  names: ['--text-primary', '--color-poppy-500', '--color-poppy-dark', '--bds-slider-thumb-size'],
  wordSteps: { '--color-poppy-dark': '--color-poppy-700' },
};

const canonical = `
:root {
  --bds-color-poppy-500: #e35335;
  --bds-color-poppy-700: #b0351b;
  --bds-text-primary: #111;
  --bds-slider-thumb-size: 20px;
}
:root[data-theme="dark"] {
  --bds-text-primary: #eee;
}
.theme-brand-brik {
  --bds-text-primary: #000;
  --bds-color-poppy-700: #a00;
}
[data-mode-spacing="compact"] {
  --bds-text-primary: #222;
}
`;

describe('generateBridge', () => {
  const { css, aliasCount, missing } = generateBridge(canonical, legacy);
  const bridge = declarationMap(css);

  it('re-declares an alias in every selector block where the new name is declared', () => {
    for (const ctx of [':root', ':root[data-theme="dark"]', '.theme-brand-brik', '[data-mode-spacing="compact"]']) {
      expect(bridge.get(ctx)?.get('--text-primary'), ctx).toBe('var(--bds-text-primary)');
    }
  });

  it('does not alias a name into a block that never declared the new name', () => {
    expect(bridge.get(':root[data-theme="dark"]')?.has('--color-poppy-500')).toBe(false);
  });

  it('aliases a word step to its numeric target, in every block that declares the target', () => {
    expect(bridge.get(':root').get('--color-poppy-dark')).toBe('var(--bds-color-poppy-700)');
    expect(bridge.get('.theme-brand-brik').get('--color-poppy-dark')).toBe('var(--bds-color-poppy-700)');
  });

  it('skips Component-tier names that already lead with --bds-', () => {
    expect([...bridge.values()].some((m) => m.has('--bds-slider-thumb-size'))).toBe(false);
  });

  it('carries the renamed component knobs and counts them', () => {
    for (const [oldName, newName] of Object.entries(RENAMED_KNOBS)) {
      expect(bridge.get(':root').get(oldName)).toBe(`var(${newName})`);
    }
    expect(aliasCount).toBe(3 + Object.keys(RENAMED_KNOBS).length);
    expect(missing).toEqual([]);
  });

  it('reports a legacy name whose --bds- target is not declared (a dropped token)', () => {
    const { missing: gone } = generateBridge(canonical.replace('--bds-text-primary: #111;', ''), {
      names: ['--text-primary'],
      wordSteps: {},
    });
    // still declared in the dark/brand/mode blocks, so only a fully-removed name is missing
    expect(gone).toEqual([]);
    const { missing: fullyGone } = generateBridge(':root { --bds-other: 1px; }', { names: ['--text-primary'], wordSteps: {} });
    expect(fullyGone).toEqual(['--text-primary -> --bds-text-primary']);
  });

  it('documents the read-only limit (ADR-043 section 6)', () => {
    expect(css).toMatch(/READS of the old[\s*]+names/);
    expect(css).toMatch(/OVERRIDES/);
  });
});

describe('committed bridge', () => {
  it('matches what the generator produces from the working tree (no hand edits, not stale)', () => {
    const { css } = buildBridgeFromWorkingTree();
    expect(fs.readFileSync(BRIDGE_PATH, 'utf8')).toBe(css);
  });

  it('aliases every legacy name except already-prefixed Component names', () => {
    const { missing } = buildBridgeFromWorkingTree();
    expect(missing).toEqual([]);
    const aliased = new Set(parseCustomProps(fs.readFileSync(BRIDGE_PATH, 'utf8')).flatMap((r) => r.decls.map((d) => d.name)));
    for (const name of readLegacy().names) {
      if (!name.startsWith('--bds-')) expect(aliased.has(name), name).toBe(true);
    }
  });

  it('carries no word-step name in the canonical sources', () => {
    const { canonical: built } = buildBridgeFromWorkingTree();
    for (const word of Object.keys(readLegacy().wordSteps)) expect(built.includes(`${word}:`), word).toBe(false);
  });

  it('rename map: every legacy word step maps to a prefixed numeric step', () => {
    const map = buildRenameMap();
    expect(map.get('--color-poppy-dark')).toBe('--bds-color-poppy-700');
    expect(map.get('--text-primary')).toBe('--bds-text-primary');
    expect(map.get('--bds-page-padding-inline')).toBe('--bds-gutter-padding-inline');
  });
});

describe('published surface', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO, 'package.json'), 'utf8'));
  it('exports the standalone bridge', () => {
    expect(pkg.exports['./prefix-bridge.css']).toBe('./dist/prefix-bridge.css');
  });
});
