import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';

// The script is a CLI, so every test shells out. Its whole purpose is a
// boundary check — an MCP tool result is capped at 20 KB and the Brand Kit
// serializes to ~68 KB, so the pull arrives in slices and a missing slice is
// indistinguishable from a deletion by the time sync-figma-mcp.js sees it
// (it prunes any leaf a touched set did not produce, brik-bds#754). These
// tests pin the refusal, not the happy path.

const SCRIPT = resolve(import.meta.dirname, '..', 'pull-variables-headless.mjs');

const run = (args) => spawnSync('node', [SCRIPT, ...args], { encoding: 'utf8' });

const tmp = () => mkdtempSync(join(tmpdir(), 'pull-headless-'));

const COLLECTIONS = [
  { name: 'primitives', modes: [{ modeId: 'm0', name: 'value' }] },
  { name: 'color', modes: [{ modeId: 'm1', name: 'light' }, { modeId: 'm2', name: 'dark' }] },
];

// Two primitives and one two-mode semantic that aliases the first — the
// smallest shape that exercises collections, modes, and alias resolution.
const VARS = [
  { id: 'VariableID:1', name: 'color/poppy/500', resolvedType: 'COLOR', collection: 'primitives',
    description: '', scopes: ['ALL_SCOPES'], valuesByMode: { m0: '#e35335' } },
  { id: 'VariableID:2', name: 'color/poppy/700', resolvedType: 'COLOR', collection: 'primitives',
    description: '', scopes: ['ALL_SCOPES'], valuesByMode: { m0: '#b0351b' } },
  { id: 'VariableID:3', name: 'background/brand', resolvedType: 'COLOR', collection: 'color',
    description: '', scopes: ['ALL_SCOPES'], valuesByMode: {
      m1: { type: 'VARIABLE_ALIAS', id: 'VariableID:1' },
      m2: { type: 'VARIABLE_ALIAS', id: 'VariableID:2' },
    } },
];

const chunk = (start, end, vars, total = VARS.length) => ({
  totalVariables: total,
  sliceStart: start,
  sliceEnd: end,
  collections: COLLECTIONS,
  variables: vars,
});

// Write chunks to a fresh dir and return the argv paths, in the order given —
// the script must sort them itself, so a test may pass them out of order.
function chunkFiles(...chunks) {
  const dir = tmp();
  return chunks.map((c, i) => {
    const p = join(dir, `chunk-${i}.json`);
    writeFileSync(p, JSON.stringify(c));
    return p;
  });
}

describe('pull-variables-headless --emit-code', () => {
  it('emits extraction JS carrying the requested start and budget', () => {
    const r = run(['--emit-code', '--start=76', '--budget=9000']);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('const START = 76;');
    expect(r.stdout).toContain('const BUDGET = 9000;');
    // The slice envelope is what the merge step keys on; without these three
    // fields a chunk cannot be checked for gaps at all.
    expect(r.stdout).toContain('sliceStart');
    expect(r.stdout).toContain('sliceEnd');
    expect(r.stdout).toContain('totalVariables');
  });

  it('defaults to a budget under the 20 KB MCP result cap', () => {
    const budget = Number(run(['--emit-code']).stdout.match(/const BUDGET = (\d+);/)[1]);
    expect(budget).toBeLessThan(20000);
  });

  it('rejects a nonsense start', () => {
    expect(run(['--emit-code', '--start=-3']).status).toBe(1);
  });
});

describe('pull-variables-headless merge', () => {
  it('merges complete chunks into a pull-shaped dump', () => {
    const files = chunkFiles(chunk(0, 2, VARS.slice(0, 2)), chunk(2, 3, VARS.slice(2)));
    const out = join(tmp(), 'dump.json');
    const r = run([...files, '-o', out]);
    expect(r.status).toBe(0);

    const dump = JSON.parse(readFileSync(out, 'utf8'));
    expect(dump.totalVariables).toBe(3);
    expect(dump.totalCollections).toBe(2);
    expect(dump.variables.map((v) => v.name)).toEqual([
      'color/poppy/500', 'color/poppy/700', 'background/brand',
    ]);
    // Values must land keyed by mode NAME, not modeId: the Library file's sets
    // are `{collection}/{modeName}` (sync-figma-mcp.js:26), so a modeId-keyed
    // dump would silently create `color/m1` sets nothing consumes.
    expect(Object.keys(dump.variables[2].valuesByMode).sort()).toEqual(['dark', 'light']);
  });

  it('accepts chunks in any argv order', () => {
    const files = chunkFiles(chunk(2, 3, VARS.slice(2)), chunk(0, 2, VARS.slice(0, 2)));
    const r = run(files);
    expect(r.status).toBe(0);
    expect(JSON.parse(r.stdout).variables[0].name).toBe('color/poppy/500');
  });

  it('accepts a chunk saved as the raw JSON string use_figma returns', () => {
    const dir = tmp();
    const p = join(dir, 'c.json');
    // `use_figma` returns the extraction's return value, which is itself a
    // JSON string — so a pasted result is double-encoded.
    writeFileSync(p, JSON.stringify(JSON.stringify(chunk(0, 3, VARS))));
    expect(run([p]).status).toBe(0);
  });

  it('REFUSES a gap between chunks', () => {
    const files = chunkFiles(chunk(0, 1, VARS.slice(0, 1)), chunk(2, 3, VARS.slice(2)));
    const r = run(files);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/gap/i);
    expect(r.stderr).toContain('--start=1');
  });

  it('REFUSES a short final chunk — the truncation case', () => {
    const r = run(chunkFiles(chunk(0, 2, VARS.slice(0, 2))));
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/cover 2 of 3/);
  });

  it('REFUSES a chunk whose variables do not match its own slice bounds', () => {
    // Claims [0,3) but carries 2 — what a truncated tool result looks like.
    const r = run(chunkFiles(chunk(0, 3, VARS.slice(0, 2))));
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/TRUNCATED/);
  });

  it('REFUSES chunks from two different pulls', () => {
    const files = chunkFiles(chunk(0, 2, VARS.slice(0, 2)), chunk(2, 3, VARS.slice(2), 99));
    const r = run(files);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/different pulls/);
  });

  it('REFUSES a variable missing a mode its collection declares', () => {
    const half = { ...VARS[2], valuesByMode: { m1: { type: 'VARIABLE_ALIAS', id: 'VariableID:1' } } };
    const r = run(chunkFiles(chunk(0, 3, [...VARS.slice(0, 2), half])));
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/no value for mode m2/);
  });

  it('WARNS but succeeds on an alias into a subscribed library', () => {
    // The Brand Kit subscribes to Foundations, so cross-file aliases are the
    // normal case; `getLocalVariablesAsync()` cannot return their targets and
    // failing here would make a correct pull unusable.
    const ext = { ...VARS[2], valuesByMode: {
      m1: { type: 'VARIABLE_ALIAS', id: 'VariableID:abc123/26883:90' },
      m2: { type: 'VARIABLE_ALIAS', id: 'VariableID:abc123/26883:90' },
    } };
    const r = run(chunkFiles(chunk(0, 3, [...VARS.slice(0, 2), ext])));
    expect(r.status).toBe(0);
    expect(r.stderr).toMatch(/subscribed library/);
  });

  it('WARNS but succeeds on an alias to a deleted local variable', () => {
    // A local id with no slash that the pull did not return is a variable
    // deleted out from under a live alias — reportable, but sync-figma-mcp.js
    // already skips the token rather than corrupting it.
    const gone = { ...VARS[2], valuesByMode: {
      m1: { type: 'VARIABLE_ALIAS', id: 'VariableID:999' },
      m2: { type: 'VARIABLE_ALIAS', id: 'VariableID:999' },
    } };
    const r = run(chunkFiles(chunk(0, 3, [...VARS.slice(0, 2), gone])));
    expect(r.status).toBe(0);
    expect(r.stderr).toMatch(/deleted in Figma/);
  });
});
