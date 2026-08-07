import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

// brik-bds#1747. design-tokens/tokens-studio.json is GENERATED but committed,
// so it reads like a source file — #1717 added
// `typography/default.font-weight.heading` straight to it, neither Library got
// the token, and the next regeneration dropped `--font-weight-heading` from
// every Style Dictionary output. Nothing failed, because nothing compared the
// merge against its own sources. `--check` is that comparison; these tests
// exercise it in both directions.

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const MERGE = resolve(REPO_ROOT, 'scripts', 'merge-tokens-studio.js');
const FOUNDATIONS = resolve(REPO_ROOT, 'design-tokens', 'foundations.json');
const MERGED = resolve(REPO_ROOT, 'design-tokens', 'tokens-studio.json');

const runCheck = () =>
  spawnSync('node', [MERGE, '--check'], { cwd: REPO_ROOT, encoding: 'utf8' });

let restore = null;
afterEach(() => {
  if (restore) {
    writeFileSync(restore.path, restore.content);
    restore = null;
  }
});

describe('merge-tokens-studio --check', () => {
  it('passes on the committed tree', () => {
    const result = runCheck();
    expect(result.stdout).toContain('in sync');
    expect(result.status).toBe(0);
  });

  it('fails when a token exists only in the merged file, not in a Library', () => {
    // The exact #1747 shape: the generated file keeps a token its sources
    // don't have. Deleting it from foundations.json reproduces the state the
    // repo was actually in before this fix.
    const content = readFileSync(FOUNDATIONS, 'utf8');
    restore = { path: FOUNDATIONS, content };

    const foundations = JSON.parse(content);
    expect(foundations['typography/default']['font-weight'].heading.$value).toBe(
      '{font-weight.semibold}',
    );
    delete foundations['typography/default']['font-weight'];
    writeFileSync(FOUNDATIONS, `${JSON.stringify(foundations, null, 2)}\n`);

    const result = runCheck();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('does not match a fresh merge');
    // The message has to point at the Library, not at the generated file —
    // "regenerate it" would have re-deleted the token and looked like a pass.
    expect(result.stderr).toContain('never to edit it');
  });

  it('fails when the merged file is hand-edited', () => {
    const content = readFileSync(MERGED, 'utf8');
    restore = { path: MERGED, content };

    writeFileSync(MERGED, content.replace('{font-weight.semibold}', '{font-weight.bold}'));

    const result = runCheck();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('does not match a fresh merge');
  });
});
