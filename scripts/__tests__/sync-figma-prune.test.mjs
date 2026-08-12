import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
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

// A fake source root for the reference guard (brik-bds#1797). `files` maps a
// repo-relative path → contents; the guard scans components/**.{css,ts,tsx} and
// tokens/**.{ts,tsx} beneath the root it is pointed at.
function sourceRoot(base, name, files) {
  const root = join(base, name);
  for (const [rel, contents] of Object.entries(files)) {
    const full = join(root, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, contents);
  }
  // Guarantee both scan dirs exist even when a fixture only populates one.
  for (const d of ['components', 'tokens']) mkdirSync(join(root, d), { recursive: true });
  return root;
}

describe('sync-figma-mcp prune (brik-bds#754)', () => {
  let tmpDir;
  // An empty source root keeps the #754 cases hermetic: the reference guard
  // (#1797) finds nothing to protect, so they exercise prune behavior alone.
  let emptyRoot;

  beforeAll(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'bds-sync-prune-'));
    emptyRoot = sourceRoot(tmpDir, 'src-empty', {});
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

    const res = runSync([dump, `--target=${lib}`, `--source-root=${emptyRoot}`], tmpDir);
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

    const res = runSync([dump, `--target=${lib}`, `--source-root=${emptyRoot}`], tmpDir);
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

    const res = runSync([dump, `--target=${lib}`, `--source-root=${emptyRoot}`, '--dry-run'], tmpDir);
    expect(res.status).toBe(0);
    expect(res.stdout).toMatch(/Removed \(1\)/);
    expect(res.stdout).toContain('theme/brik/poppy-red');
    expect(res.stdout).toMatch(/no files written/);
    // File untouched.
    expect(readFileSync(lib, 'utf8')).toBe(before);
  });

  it('--no-prune adds/updates but never deletes (intentionally partial dump)', () => {
    const lib = join(tmpDir, 'lib-noprune.json');
    const dump = join(tmpDir, 'dump-noprune.json');
    writeFileSync(lib, JSON.stringify(libraryFile({
      'color/poppy/light': '#e35335',
      'theme/brik/poppy-red': '#e35335', // omitted from the dump on purpose
    })));
    // Partial dump: only color/poppy/light + a new sibling. theme/brik/poppy-red
    // is deliberately absent and must survive under --no-prune.
    writeFileSync(dump, JSON.stringify(pullDump([
      { name: 'color/poppy/light', value: '#000000' },
      { name: 'color/poppy/dark', value: '#7a1c0c' },
    ])));

    const res = runSync([dump, `--target=${lib}`, `--source-root=${emptyRoot}`, '--no-prune'], tmpDir);
    expect(res.status).toBe(0);

    const out = JSON.parse(readFileSync(lib, 'utf8'))['primitives/value'];
    expect(out.color.poppy.light.$value).toBe('#000000');      // updated
    expect(out.color.poppy.dark.$value).toBe('#7a1c0c');       // added
    expect(out.theme.brik['poppy-red'].$value).toBe('#e35335'); // NOT pruned
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

    const res = runSync([dump, `--target=${lib}`, `--source-root=${emptyRoot}`], tmpDir);
    expect(res.status).toBe(0);

    const out = JSON.parse(readFileSync(lib, 'utf8'))['primitives/value'];
    expect(out.color.poppy.light.$value).toBe('#abcdef'); // updated
    expect(out.theme.brik['poppy-red'].$value).toBe('#e35335'); // NOT pruned
  });
});

// Reference guard for brik-bds#1797. The #754 prune above is correct for a
// token Figma really retired, and wrong for one that shipped code still uses —
// `--font-weight-heading` was dropped by a pull and had to be restored (#1748).
// canonical-check cannot see it: it validates references against an allowlist
// regenerated from the same pull, so the removal validates itself.
describe('sync-figma-mcp prune reference guard (brik-bds#1797)', () => {
  let tmpDir;

  beforeAll(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'bds-sync-refguard-'));
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  // A library holding one survivor plus `font-weight/heading`, against a dump
  // that no longer carries the latter — the #1748 shape exactly.
  function fontWeightFixture(name) {
    const lib = join(tmpDir, `lib-${name}.json`);
    const dump = join(tmpDir, `dump-${name}.json`);
    writeFileSync(lib, JSON.stringify(libraryFile({
      'color/poppy/light': '#e35335',
      'font-weight/heading': '#000000',
    })));
    writeFileSync(dump, JSON.stringify(pullDump([
      { name: 'color/poppy/light', value: '#e35335' },
    ])));
    return { lib, dump };
  }

  it('refuses to prune a token still referenced in component CSS', () => {
    const { lib, dump } = fontWeightFixture('ref-css');
    const before = readFileSync(lib, 'utf8');
    const root = sourceRoot(tmpDir, 'src-css', {
      'components/ui/ContentBlock/ContentBlock.css':
        '.bds-content-block__heading { font-weight: var(--font-weight-heading); }\n',
    });

    const res = runSync([dump, `--target=${lib}`, `--source-root=${root}`], tmpDir);

    expect(res.status).toBe(1);
    expect(res.stderr).toContain('--font-weight-heading');
    expect(res.stderr).toContain('components/ui/ContentBlock/ContentBlock.css');
    // Refusal is terminal and pre-write — the library must be untouched.
    expect(readFileSync(lib, 'utf8')).toBe(before);
  });

  it('refuses on a reference from the TS token surface', () => {
    const { lib, dump } = fontWeightFixture('ref-ts');
    const root = sourceRoot(tmpDir, 'src-ts', {
      'tokens/index.ts': "export const weight = { heading: 'var(--font-weight-heading)' };\n",
    });

    const res = runSync([dump, `--target=${lib}`, `--source-root=${root}`], tmpDir);

    expect(res.status).toBe(1);
    expect(res.stderr).toContain('tokens/index.ts');
  });

  it('ignores generated token CSS, so a self-declaration is not a reference', () => {
    const { lib, dump } = fontWeightFixture('ref-generated');
    // tokens/figma-tokens.css is build output: every token declares itself
    // there. Counting that as a reference would refuse every prune and disable
    // deletion-propagation (#754) outright.
    const root = sourceRoot(tmpDir, 'src-generated', {
      'tokens/figma-tokens.css': ':root { --font-weight-heading: var(--font-weight-semibold); }\n',
    });

    const res = runSync([dump, `--target=${lib}`, `--source-root=${root}`], tmpDir);

    expect(res.status).toBe(0);
    const out = JSON.parse(readFileSync(lib, 'utf8'))['primitives/value'];
    expect(out['font-weight']).toBeUndefined(); // pruned
  });

  it('--allow-prune deletes the token and says so', () => {
    const { lib, dump } = fontWeightFixture('allow');
    const root = sourceRoot(tmpDir, 'src-allow', {
      'components/ui/ContentBlock/ContentBlock.css':
        '.bds-content-block__heading { font-weight: var(--font-weight-heading); }\n',
    });

    const res = runSync(
      [dump, `--target=${lib}`, `--source-root=${root}`, '--allow-prune=--font-weight-heading'],
      tmpDir
    );

    expect(res.status).toBe(0);
    expect(res.stdout).toContain('--allow-prune: deleting --font-weight-heading');
    const out = JSON.parse(readFileSync(lib, 'utf8'))['primitives/value'];
    expect(out['font-weight']).toBeUndefined();
    expect(out.color.poppy.light.$value).toBe('#e35335');
  });

  it('--allow-prune accepts the bare name without the leading dashes', () => {
    const { lib, dump } = fontWeightFixture('allow-bare');
    const root = sourceRoot(tmpDir, 'src-allow-bare', {
      'components/ui/ContentBlock/ContentBlock.css':
        '.x { font-weight: var(--font-weight-heading); }\n',
    });

    const res = runSync(
      [dump, `--target=${lib}`, `--source-root=${root}`, '--allow-prune=font-weight-heading'],
      tmpDir
    );

    expect(res.status).toBe(0);
  });

  it('--dry-run refuses identically and still writes nothing', () => {
    const { lib, dump } = fontWeightFixture('dry');
    const before = readFileSync(lib, 'utf8');
    const root = sourceRoot(tmpDir, 'src-dry', {
      'components/ui/ContentBlock/ContentBlock.css':
        '.x { font-weight: var(--font-weight-heading); }\n',
    });

    const res = runSync([dump, `--target=${lib}`, `--source-root=${root}`, '--dry-run'], tmpDir);

    expect(res.status).toBe(1);
    expect(res.stderr).toContain('--font-weight-heading');
    expect(readFileSync(lib, 'utf8')).toBe(before);
  });

  it('does not refuse an unreferenced token — #754 prune still fires', () => {
    const lib = join(tmpDir, 'lib-unref.json');
    const dump = join(tmpDir, 'dump-unref.json');
    writeFileSync(lib, JSON.stringify(libraryFile({
      'color/poppy/light': '#e35335',
      'theme/brik/poppy-red': '#e35335',
    })));
    writeFileSync(dump, JSON.stringify(pullDump([
      { name: 'color/poppy/light', value: '#e35335' },
    ])));
    // Source references a DIFFERENT token — the orphan is genuinely unused.
    const root = sourceRoot(tmpDir, 'src-unref', {
      'components/ui/Card/Card.css': '.bds-card { color: var(--color-poppy-light); }\n',
    });

    const res = runSync([dump, `--target=${lib}`, `--source-root=${root}`], tmpDir);

    expect(res.status).toBe(0);
    expect(JSON.parse(readFileSync(lib, 'utf8'))['primitives/value'].theme).toBeUndefined();
  });

  it('leaves the #936 cross-collection guard in front of it', () => {
    // A primitive whose Figma home is a different collection than the set it
    // lands in is spared by `seenAnywhere` BEFORE the reference guard runs, so
    // it neither prunes nor refuses — even with no source reference at all.
    const lib = join(tmpDir, 'lib-moved.json');
    const dump = join(tmpDir, 'dump-moved.json');
    writeFileSync(lib, JSON.stringify(libraryFile({
      'color/poppy/light': '#e35335',
      'blur-radius/sm': '8px',
    })));
    // `blur-radius/sm` is absent from `primitives` but present under the
    // `elevation` collection — the cross-collection move from #936.
    const moved = pullDump([{ name: 'color/poppy/light', value: '#e35335' }]);
    moved.totalCollections = 2;
    moved.collections.push({
      name: 'elevation',
      modes: [{ name: 'flat', modeId: 'm2' }],
      variables: [{
        id: 'VariableID:moved',
        name: 'blur-radius/sm',
        resolvedType: 'FLOAT',
        valuesByMode: { m2: 8 },
        description: '',
        scopes: [],
      }],
    });
    writeFileSync(dump, JSON.stringify(moved));
    const root = sourceRoot(tmpDir, 'src-moved', {});

    const res = runSync([dump, `--target=${lib}`, `--source-root=${root}`], tmpDir);

    expect(res.status).toBe(0);
    const out = JSON.parse(readFileSync(lib, 'utf8'))['primitives/value'];
    expect(out['blur-radius'].sm.$value).toBe('8px'); // survived, not pruned
  });
});
