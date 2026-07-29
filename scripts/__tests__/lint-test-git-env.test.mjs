/**
 * Locks the git-environment gate for bash tests (scripts/lint-test-git-env.mjs).
 *
 * brik-bds#1548, enforcing #1539. The case that must never pass is the last one:
 * a file that only *discusses* GIT_DIR in a comment — because the compliant tests
 * in this directory all carry a paragraph about GIT_DIR in their headers, so a
 * substring search would call an unprotected test compliant.
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { missingGitEnvUnsets, GIT_ENV_VARS } from '../lint-test-git-env.mjs';

const FULL_UNSET = `unset ${GIT_ENV_VARS.slice(0, 4).join(' ')} \\
      ${GIT_ENV_VARS.slice(4).join(' ')}`;

describe('missingGitEnvUnsets', () => {
  it('accepts the multi-line unset the existing tests use', () => {
    expect(missingGitEnvUnsets(`set -u\n${FULL_UNSET}\necho hi\n`)).toEqual([]);
  });

  it('accepts a single-line unset', () => {
    expect(missingGitEnvUnsets(`unset ${GIT_ENV_VARS.join(' ')}`)).toEqual([]);
  });

  it('accepts one unset statement per variable', () => {
    expect(missingGitEnvUnsets(GIT_ENV_VARS.map((v) => `unset ${v}`).join('\n'))).toEqual([]);
  });

  it('reports a file with no unset at all', () => {
    expect(missingGitEnvUnsets('set -u\ngit -C "$REPO" init\n')).toEqual(GIT_ENV_VARS);
  });

  it('reports the famous-two-only case — one exported variable from the incident', () => {
    expect(missingGitEnvUnsets('unset GIT_DIR GIT_WORK_TREE')).toEqual(
      GIT_ENV_VARS.filter((v) => v !== 'GIT_DIR' && v !== 'GIT_WORK_TREE'),
    );
  });

  it('does NOT count a variable that is only mentioned in a comment', () => {
    // Every compliant test in this repo has a header paragraph about GIT_DIR.
    const source = `# a test invoked from a git hook inherits GIT_DIR, and GIT_DIR beats\n` +
      `# directory discovery — see GIT_WORK_TREE, GIT_INDEX_FILE, GIT_COMMON_DIR,\n` +
      `# GIT_NAMESPACE, GIT_OBJECT_DIRECTORY, GIT_ALTERNATE_OBJECT_DIRECTORIES\n` +
      `set -u\ngit -C "$REPO" init\n`;
    expect(missingGitEnvUnsets(source)).toEqual(GIT_ENV_VARS);
  });

  it('does NOT count an unset commented out', () => {
    expect(missingGitEnvUnsets(`# ${FULL_UNSET}`)).toEqual(GIT_ENV_VARS);
  });

  it('ignores a trailing comment after a real unset', () => {
    expect(missingGitEnvUnsets(`unset ${GIT_ENV_VARS.join(' ')}  # per #1539`)).toEqual([]);
  });

  it('tolerates leading whitespace and `unset -v`', () => {
    expect(missingGitEnvUnsets(`    unset -v ${GIT_ENV_VARS.join(' ')}`)).toEqual([]);
  });

  it('does not credit an assignment or an export', () => {
    expect(missingGitEnvUnsets('GIT_DIR=\nexport GIT_WORK_TREE=')).toEqual(GIT_ENV_VARS);
  });

  it('survives empty and nullish input', () => {
    expect(missingGitEnvUnsets('')).toEqual(GIT_ENV_VARS);
    expect(missingGitEnvUnsets(undefined)).toEqual(GIT_ENV_VARS);
  });
});

describe('the CLI, against fixture directories', () => {
  const CLI = new URL('../lint-test-git-env.mjs', import.meta.url).pathname;
  const run = (dir) => {
    try {
      return { code: 0, out: execFileSync('node', [CLI, dir], { encoding: 'utf8' }) };
    } catch (err) {
      return { code: err.status, out: (err.stdout || '') + (err.stderr || '') };
    }
  };

  it('fails on a bash test without the unset, and names it', () => {
    const dir = mkdtempSync(join(tmpdir(), 'gitenv-bad-'));
    try {
      writeFileSync(join(dir, 'test-thing.sh'), 'set -u\ngit -C "$REPO" init\n');
      const { code, out } = run(dir);
      expect(code).toBe(1);
      expect(out).toContain('test-thing.sh');
      expect(out).toContain('GIT_DIR');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('passes once the unset is added — the same file, one edit apart', () => {
    const dir = mkdtempSync(join(tmpdir(), 'gitenv-good-'));
    try {
      writeFileSync(join(dir, 'test-thing.sh'), `set -u\n${FULL_UNSET}\ngit -C "$REPO" init\n`);
      const { code, out } = run(dir);
      expect(code).toBe(0);
      expect(out).toContain('unset the git environment');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('ignores non-.sh files', () => {
    const dir = mkdtempSync(join(tmpdir(), 'gitenv-mixed-'));
    try {
      writeFileSync(join(dir, 'thing.test.mjs'), 'process.env.GIT_DIR\n');
      const { code } = run(dir);
      expect(code).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('passes on this repo as it stands — the gate ships with an empty violation set', () => {
    const { code, out } = run('scripts/__tests__');
    expect(code).toBe(0);
    // Guard against a vacuous pass: there must actually be bash tests here.
    const count = readdirSync('scripts/__tests__').filter((f) => f.endsWith('.sh')).length;
    expect(count).toBeGreaterThan(0);
    expect(out).toContain(`${count} bash test(s)`);
  });
});
