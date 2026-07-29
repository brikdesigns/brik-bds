/**
 * Locks the lock-vs-installed predicate behind the pre-push dependency guard.
 *
 * brik-bds#1547. The guard used to compare mtimes, so a `git merge` that rewrote
 * package-lock.json byte-identically blocked every push until a pointless
 * `npm ci` — three times in one session on 2026-07-29, once on a release tag
 * push. The first test below is that exact case: same content, and the verdict
 * must be fresh. There is no mtime anywhere in the predicate, which is the point.
 *
 * The optional/platform exclusion is measured, not defensive: on this repo 79 of
 * the lock's entries are legitimately not installed, and all 79 carry
 * `optional`, `os` or `cpu`. Without the exclusion the guard would report stale
 * on a perfectly good tree — the same always-wrong behaviour it replaced.
 */

import { describe, it, expect } from 'vitest';
import { installFreshness } from '../check-install-freshness.mjs';

const lock = (packages) => ({ lockfileVersion: 3, packages });
const record = (packages) => ({ lockfileVersion: 3, packages });

describe('installFreshness', () => {
  it('is fresh when the installed tree matches the lock (mtime is irrelevant)', () => {
    const pkgs = {
      '': { name: 'bds', version: '0.138.0' },
      'node_modules/react': { version: '19.0.0' },
      'node_modules/vitest': { version: '4.1.10' },
    };
    const v = installFreshness(lock(pkgs), record(pkgs));
    expect(v.fresh).toBe(true);
    expect(v.missing).toEqual([]);
    expect(v.mismatched).toEqual([]);
  });

  it('ignores the root "" entry — it describes the project, not a package', () => {
    const v = installFreshness(
      lock({ '': { name: 'bds', version: '0.138.0' }, 'node_modules/react': { version: '19.0.0' } }),
      // npm's record carries its own root entry shape; only node_modules/* matter.
      record({ 'node_modules/react': { version: '19.0.0' } }),
    );
    expect(v.fresh).toBe(true);
  });

  it('is stale when a lock entry is absent and NOT platform-gated (the #812 case)', () => {
    const v = installFreshness(
      lock({ 'node_modules/react': { version: '19.0.0' }, 'node_modules/zod': { version: '3.0.0' } }),
      record({ 'node_modules/react': { version: '19.0.0' } }),
    );
    expect(v.fresh).toBe(false);
    expect(v.missing).toEqual(['node_modules/zod']);
  });

  it('is stale when a version differs, even though nothing is missing', () => {
    const v = installFreshness(
      lock({ 'node_modules/react': { version: '19.1.0' } }),
      record({ 'node_modules/react': { version: '19.0.0' } }),
    );
    expect(v.fresh).toBe(false);
    expect(v.mismatched).toHaveLength(1);
    expect(v.mismatched[0]).toContain('lock 19.1.0 vs installed 19.0.0');
  });

  it('tolerates absent entries marked optional / os / cpu (79 of them on this repo)', () => {
    const v = installFreshness(
      lock({
        'node_modules/react': { version: '19.0.0' },
        'node_modules/@esbuild/android-arm': { version: '0.25.0', optional: true, os: ['android'], cpu: ['arm'] },
        'node_modules/@emnapi/core': { version: '1.0.0', optional: true },
        'node_modules/fsevents': { version: '2.3.3', os: ['darwin'] },
        'node_modules/@rollup/rollup-linux-x64-gnu': { version: '4.0.0', cpu: ['x64'] },
      }),
      record({ 'node_modules/react': { version: '19.0.0' } }),
    );
    expect(v.fresh).toBe(true);
  });

  it('an installed package absent from the lock does not make it stale', () => {
    // A leftover from a previous install is not a reason to refuse a push; the
    // gates downstream (tsc, build) fail loudly on a genuinely broken tree.
    const v = installFreshness(
      lock({ 'node_modules/react': { version: '19.0.0' } }),
      record({ 'node_modules/react': { version: '19.0.0' }, 'node_modules/leftover': { version: '1.0.0' } }),
    );
    expect(v.fresh).toBe(true);
  });

  it('reports every offender, not just the first', () => {
    const v = installFreshness(
      lock({
        'node_modules/a': { version: '1.0.0' },
        'node_modules/b': { version: '2.0.0' },
        'node_modules/c': { version: '3.0.0' },
      }),
      record({ 'node_modules/c': { version: '9.9.9' } }),
    );
    expect(v.missing).toEqual(['node_modules/a', 'node_modules/b']);
    expect(v.mismatched).toHaveLength(1);
  });

  it('an empty install record is stale rather than silently fresh', () => {
    const v = installFreshness(lock({ 'node_modules/react': { version: '19.0.0' } }), record({}));
    expect(v.fresh).toBe(false);
  });

  it('an empty lock is fresh — nothing is required, so nothing can be missing', () => {
    expect(installFreshness(lock({}), record({ 'node_modules/react': { version: '19.0.0' } })).fresh).toBe(true);
  });

  it('survives malformed input without throwing', () => {
    expect(installFreshness({}, {}).fresh).toBe(true);
    expect(installFreshness(null, null).fresh).toBe(true);
  });

  it('a missing version on either side is not treated as a mismatch', () => {
    // npm omits `version` for link/workspace entries; comparing undefined would
    // report a phantom mismatch on every install.
    const v = installFreshness(
      lock({ 'node_modules/@brikdesigns/bds': { resolved: '../bds', link: true } }),
      record({ 'node_modules/@brikdesigns/bds': { resolved: '../bds', link: true } }),
    );
    expect(v.fresh).toBe(true);
  });
});
