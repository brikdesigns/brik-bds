/**
 * Tests for scripts/check-unknown-blueprint-keys.mjs (#2496).
 *
 * Each case writes a throwaway directory of rendered HTML and runs the gate
 * against it with `--root`, so no real output is touched — the same seam and
 * shape as `scripts/validate-blueprints.test.mjs`. AC3: a fixture with an
 * unwired key fails; a fully-wired fixture passes.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';
import { UNKNOWN_KEY_ATTR } from './check-unknown-blueprint-keys.mjs';

const GATE = join(dirname(fileURLToPath(import.meta.url)), 'check-unknown-blueprint-keys.mjs');

/** @type {string[]} */
const dirs = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A rendered page. `unknownKey` plants the BlueprintFallback marker. */
function page({ unknownKey = false } = {}) {
  const body = unknownKey
    ? `<section class="bp-fallback" ${UNKNOWN_KEY_ATTR}="mystery_block">fell back</section>`
    : `<section class="bds-hero" data-blueprint-key="hero_split">rendered</section>`;
  return `<!doctype html><html><body>${body}</body></html>\n`;
}

/** Plant a dir of HTML files. `files` maps a relative path to its page opts. */
function plant(files) {
  const root = mkdtempSync(join(tmpdir(), 'check-unknown-keys-'));
  dirs.push(root);
  for (const [rel, opts] of Object.entries(files)) {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, page(opts), 'utf8');
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

describe('check-unknown-blueprint-keys', () => {
  it('passes on a fully-wired render (no fallback marker)', () => {
    const root = plant({ 'index.html': {}, 'about/index.html': {} });
    const { status } = run(root);
    expect(status).toBe(0);
  });

  it('fails when a page carries the unknown-key marker', () => {
    const root = plant({ 'index.html': {}, 'services/index.html': { unknownKey: true } });
    const { status, output } = run(root);

    expect(status).toBe(1);
    expect(output).toContain(UNKNOWN_KEY_ATTR);
    expect(output).toContain('services/index.html');
  });

  it('scans recursively, not just the root level', () => {
    const root = plant({ 'a/b/c/deep.html': { unknownKey: true } });
    const { status } = run(root);
    expect(status).toBe(1);
  });

  it('errors (exit 2) on a missing --root flag', () => {
    let status = 0;
    try {
      execFileSync('node', [GATE], { encoding: 'utf8' });
    } catch (err) {
      status = err.status;
    }
    expect(status).toBe(2);
  });

  it('passes (exit 0) on a directory that does not exist', () => {
    const { status } = run(join(tmpdir(), 'check-unknown-keys-nonexistent-xyz'));
    expect(status).toBe(0);
  });
});
