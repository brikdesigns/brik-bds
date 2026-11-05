/**
 * dist/retired-token-names.json (#2711) replaced the ADR-043 prefix bridge. The
 * old names no longer resolve; the map is read by guard tooling only, to learn
 * the old-name set and the `--bds-` name that replaced each.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildRenameMap, buildRetiredNames, RENAMED_KNOBS } from '../lib/bds-prefix.mjs';

const ROOT = resolve(import.meta.dirname, '..', '..');
const DIST_TOKENS = resolve(ROOT, 'dist', 'tokens.css');
const DIST_MAP = resolve(ROOT, 'dist', 'retired-token-names.json');
const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));

describe('package surface', () => {
  it('exports retired-token-names.json and no longer exports the bridge', () => {
    expect(pkg.exports['./retired-token-names.json']).toBe('./dist/retired-token-names.json');
    expect(pkg.exports['./prefix-bridge.css']).toBeUndefined();
  });
});

describe('buildRetiredNames', () => {
  const css = ':root { --bds-text-primary: #000; }';
  const legacy = { names: ['--text-primary', '--gone-token'], wordSteps: {} };

  it('maps declared targets, sorted, and reports the undeclared ones', () => {
    const { map, missing } = buildRetiredNames(css, legacy);
    expect(map['--text-primary']).toBe('--bds-text-primary');
    expect(map['--gone-token']).toBeUndefined();
    expect(missing).toEqual(['--gone-token -> --bds-gone-token']);
  });

  it('keeps renamed knobs though their targets are not declared in dist', () => {
    const { map } = buildRetiredNames(css, { names: [], wordSteps: {} });
    for (const [oldName, newName] of Object.entries(RENAMED_KNOBS)) expect(map[oldName]).toBe(newName);
  });
});

describe.skipIf(!existsSync(DIST_TOKENS) || !existsSync(DIST_MAP))('built dist', () => {
  const retired = existsSync(DIST_MAP) ? JSON.parse(readFileSync(DIST_MAP, 'utf8')) : {};
  const tokens = existsSync(DIST_TOKENS) ? readFileSync(DIST_TOKENS, 'utf8') : '';

  it('carries no prefix-bridge section', () => {
    expect(tokens).not.toContain('BEGIN BDS PREFIX BRIDGE');
  });

  it('keys equal the rename map', () => {
    expect(Object.keys(retired)).toEqual([...Object.keys(retired)].sort());
    expect(new Set(Object.keys(retired))).toEqual(new Set(buildRenameMap().keys()));
  });

  it('every value is a --bds- name declared in dist/tokens.css (knobs excepted)', () => {
    const knobs = new Set(Object.keys(RENAMED_KNOBS));
    for (const [oldName, newName] of Object.entries(retired)) {
      expect(newName.startsWith('--bds-'), oldName).toBe(true);
      if (!knobs.has(oldName)) expect(tokens.includes(`${newName}:`), `${oldName} -> ${newName}`).toBe(true);
    }
  });

  it('no old name is still declared in dist/tokens.css', () => {
    for (const oldName of Object.keys(retired)) expect(new RegExp(`(^|[{;\\s])${oldName}\\s*:`).test(tokens), oldName).toBe(false);
  });
});
