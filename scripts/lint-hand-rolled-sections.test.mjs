/**
 * Tests for scripts/lint-hand-rolled-sections.mjs (#2495).
 *
 * Each case plants a throwaway `.astro` tree and runs the gate against it with
 * `--root`, the same seam and shape as `scripts/validate-blueprints.test.mjs`.
 * AC: a section that hand-rolls style/motion fails; one that uses only blueprint
 * props + tokens passes.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const GATE = join(dirname(fileURLToPath(import.meta.url)), 'lint-hand-rolled-sections.mjs');

/** @type {string[]} */
const dirs = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A blueprint-composed page — the passing shape. */
const COMPOSED = `---
import { BlueprintDispatcher } from '@brikdesigns/bds/blueprints-astro';
const { sections, clientFacts, theme } = Astro.props;
---
<main>
  <BlueprintDispatcher sections={sections} clientFacts={clientFacts} theme={theme} />
</main>
`;

/** Plant a dir of `.astro` files. `files` maps a relative path to its body. */
function plant(files) {
  const root = mkdtempSync(join(tmpdir(), 'lint-hand-rolled-'));
  dirs.push(root);
  for (const [rel, body] of Object.entries(files)) {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, body, 'utf8');
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

describe('lint-hand-rolled-sections', () => {
  it('passes a blueprint-composed page (props + tokens only)', () => {
    const root = plant({ 'home.astro': COMPOSED, 'about.astro': COMPOSED });
    const { status } = run(root);
    expect(status).toBe(0);
  });

  it('passes an empty / absent scan root', () => {
    const { status } = run(join(tmpdir(), 'lint-hand-rolled-nonexistent-xyz'));
    expect(status).toBe(0);
  });

  it('fails a <style> block', () => {
    const root = plant({
      'bespoke.astro': `---\n---\n<section><style>.x { color: red; }</style></section>\n`,
    });
    const { status, output } = run(root);
    expect(status).toBe(1);
    expect(output).toContain('style-block');
  });

  it('fails an @keyframes rule', () => {
    const root = plant({ 'anim.astro': `---\n---\n<div>@keyframes spin { to { transform: none; } }</div>\n` });
    const { status, output } = run(root);
    expect(status).toBe(1);
    expect(output).toContain('keyframes');
  });

  it('fails an inline transition:/animation:', () => {
    const root = plant({ 'motion.astro': `---\n---\n<div style="transition: transform 200ms ease">x</div>\n` });
    const { status, output } = run(root);
    expect(status).toBe(1);
    expect(output).toContain('inline-motion');
  });

  it('fails a raw hex / px / duration in an inline style', () => {
    const root = plant({ 'raw.astro': `---\n---\n<div style="color: #ff5500; padding: 12px">x</div>\n` });
    const { status, output } = run(root);
    expect(status).toBe(1);
    expect(output).toContain('raw-value');
  });

  it('does not read href="#anchor" or id="fade" as a raw hex', () => {
    const root = plant({
      'links.astro': `---\n---\n<a href="#contact" id="fade">Contact</a>\n`,
    });
    const { status } = run(root);
    expect(status).toBe(0);
  });

  it('a reasoned bds-lint-ignore exempts the line', () => {
    const root = plant({
      'hatched.astro': `---\n---\n<div style="transition: opacity 120ms"><!-- bds-lint-ignore hand-rolled-section — runtime-only overlay -->x</div>\n`,
    });
    const { status } = run(root);
    expect(status).toBe(0);
  });

  it('a bare bds-lint-ignore is rejected', () => {
    const root = plant({
      'bare.astro': `---\n---\n<div style="transition: opacity 120ms"><!-- bds-lint-ignore -->x</div>\n`,
    });
    const { status, output } = run(root);
    expect(status).toBe(1);
    expect(output).toContain('suppression must state why');
  });
});
