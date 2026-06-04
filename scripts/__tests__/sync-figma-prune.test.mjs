import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

// Regression tests for brik-bds#754: sync-figma-mcp.js must propagate Figma
// DELETIONS — a leaf present in a touched set but absent from the pull dump was
// removed in Figma and should be pruned from the Library file. The legacy
// flat-map shape (partial paste-in) must never prune. We drive the CLI against
// temp-dir fixtures via the --target override, mirroring the lint-tokens tests.

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const SYNC = resolve(REPO_ROOT, 'scripts', 'sync-figma-mcp.js');

// A pull-shape dump (nested collections[].variables[]) covering one collection
// (`primitives`) + mode (`value`), listing only the variables passed in.
function pullDump(varNames) {
  return {
    totalCollections: 1,
    collections: [
      {
        name: 'primitives',
        modes: [{ name: 'value', modeId: 'm1' }],
        variables: varNames.map(({ name, value }, i) => ({
          id: `VariableID:${i}`,
          name,
          resolvedType: 'COLOR',
          valuesByMode: { m1: value },
          description: '',
          scopes: [],
        })),
      },
    ],
  };
}

// A Library file with one set (`primitives/value`) holding the given leaves.
// Leaves are keyed by slash-path → hex value.
function libraryFile(leaves) {
  const set = {};
  for (const [path, value] of Object.entries(leaves)) {
    const parts = path.split('/');
    let node = set;
    for (let i = 0; i < parts.length - 1; i++) {
      node[parts[i]] ??= {};
      node = node[parts[i]];
    }
    node[parts[parts.length - 1]] = { $type: 'color', $value: value };
  }
  return {
    $metadata: { tokenSetOrder: ['primitives/value'] },
    'primitives/value': set,
  };
}

function runSync(args, cwd) {
  return spawnSync('node', [SYNC, ...args], { cwd, encoding: 'utf8' });
}

describe('sync-figma-mcp prune (brik-bds#754)', () => {
  let tmpDir;

  beforeAll(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'bds-sync-prune-'));
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('prunes a leaf deleted in Figma and removes the now-empty parent groups', () => {
    const lib = join(tmpDir, 'lib-prune.json');
    const dump = join(tmpDir, 'dump-prune.json');
    writeFileSync(lib, JSON.stringify(libraryFile({
      'color/poppy/light': '#e35335',
      'theme/brik/poppy-red': '#e35335', // orphan — not in the dump anymore
    })));
    writeFileSync(dump, JSON.stringify(pullDump([
      { name: 'color/poppy/light', value: '#e35335' },
    ])));

    const res = runSync([dump, `--target=${lib}`], tmpDir);
    expect(res.status).toBe(0);

    const out = JSON.parse(readFileSync(lib, 'utf8'))['primitives/value'];
    // Survivor kept.
    expect(out.color.poppy.light.$value).toBe('#e35335');
    // Orphan leaf pruned, and the empty theme/ + theme.brik/ groups collapsed.
    expect(out.theme).toBeUndefined();
  });

  it('preserves add + update behavior while pruning (criterion 3)', () => {
    const lib = join(tmpDir, 'lib-au.json');
    const dump = join(tmpDir, 'dump-au.json');
    writeFileSync(lib, JSON.stringify(libraryFile({
      'color/poppy/light': '#e35335',
    })));
    writeFileSync(dump, JSON.stringify(pullDump([
      { name: 'color/poppy/light', value: '#000000' }, // updated value
      { name: 'color/poppy/dark', value: '#7a1c0c' },  // new
    ])));

    const res = runSync([dump, `--target=${lib}`], tmpDir);
    expect(res.status).toBe(0);

    const out = JSON.parse(readFileSync(lib, 'utf8'))['primitives/value'];
    expect(out.color.poppy.light.$value).toBe('#000000'); // updated
    expect(out.color.poppy.dark.$value).toBe('#7a1c0c');  // added
  });

  it('--dry-run prints the delete set and writes nothing', () => {
    const lib = join(tmpDir, 'lib-dry.json');
    const dump = join(tmpDir, 'dump-dry.json');
    const before = JSON.stringify(libraryFile({
      'color/poppy/light': '#e35335',
      'theme/brik/poppy-red': '#e35335',
    }));
    writeFileSync(lib, before);
    writeFileSync(dump, JSON.stringify(pullDump([
      { name: 'color/poppy/light', value: '#e35335' },
    ])));

    const res = runSync([dump, `--target=${lib}`, '--dry-run'], tmpDir);
    expect(res.status).toBe(0);
    expect(res.stdout).toMatch(/Removed \(1\)/);
    expect(res.stdout).toContain('theme/brik/poppy-red');
    expect(res.stdout).toMatch(/no files written/);
    // File untouched.
    expect(readFileSync(lib, 'utf8')).toBe(before);
  });

  it('never prunes for the legacy flat-map shape (shape 2)', () => {
    const lib = join(tmpDir, 'lib-legacy.json');
    const dump = join(tmpDir, 'dump-legacy.json');
    writeFileSync(lib, JSON.stringify(libraryFile({
      'color/poppy/light': '#e35335',
      'theme/brik/poppy-red': '#e35335',
    })));
    // Flat map (no collections[]) → shape 2. Change a value so the file writes.
    writeFileSync(dump, JSON.stringify({ 'color/poppy/light': '#abcdef' }));

    const res = runSync([dump, `--target=${lib}`], tmpDir);
    expect(res.status).toBe(0);

    const out = JSON.parse(readFileSync(lib, 'utf8'))['primitives/value'];
    expect(out.color.poppy.light.$value).toBe('#abcdef'); // updated
    expect(out.theme.brik['poppy-red'].$value).toBe('#e35335'); // NOT pruned
  });
});
