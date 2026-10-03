/**
 * Tests for scripts/check-bds-binding.mjs (#2720).
 *
 * Each case plants a throwaway consumer `src/` plus a tiny bridge / tokens / styles trio, then
 * runs the CLI against them — the same seam as scripts/lint-consumer-shadows.test.mjs.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const GATE = join(dirname(fileURLToPath(import.meta.url)), 'check-bds-binding.mjs');

// The CLI refuses a bridge under 500 names, so pad the real ones with filler.
const REAL = ['text-primary', 'background-brand-primary', 'surface-inverse'];
const BRIDGE = [...REAL, ...Array.from({ length: 500 }, (_, i) => `filler-${i}`)]
  .map((body) => `  --${body}: var(--bds-${body});`)
  .join('\n');
const TOKENS = ':root {\n  --bds-text-primary: #000;\n  --bds-background-brand-primary: #e35335;\n}\n';
const STYLES = '.bds-footer { background: var(--bds-footer-surface, var(--bds-surface-inverse)); }\n';

/** @type {string[]} */
const dirs = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** Plant a consumer repo: `files` maps a path under the repo to its body. Returns the repo root. */
function plant(files, bridge = `:root {\n${BRIDGE}\n}\n`) {
  const root = mkdtempSync(join(tmpdir(), 'check-bds-binding-'));
  dirs.push(root);
  const all = { 'bds/prefix-bridge.css': bridge, 'bds/tokens.css': TOKENS, 'bds/styles.css': STYLES, ...files };
  for (const [rel, body] of Object.entries(all)) {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, body, 'utf8');
  }
  return root;
}

/** Run the CLI from the planted repo. Returns `{ status, output }` without throwing on a non-zero exit. */
function run(root, ...args) {
  const inputs = ['--bridge', 'bds/prefix-bridge.css', '--tokens', 'bds/tokens.css', '--styles', 'bds/styles.css'];
  try {
    const output = execFileSync('node', [GATE, 'src', ...inputs, ...args], { cwd: root, encoding: 'utf8' });
    return { status: 0, output };
  } catch (err) {
    return { status: err.status, output: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  }
}

describe('old-name-override in CSS', () => {
  it('fails an old name declared with a value, naming file, line and the --bds- target', () => {
    const root = plant({ 'src/theme.css': '.a {\n  color: red;\n  --text-primary: #123456;\n}\n' });
    const { status, output } = run(root);
    expect(status).toBe(1);
    expect(output).toContain('src/theme.css:3: --text-primary: #123456 — set --bds-text-primary instead');
  });

  it('passes the re-scope alias', () => {
    const root = plant({ 'src/theme.css': '.a { --text-primary: var(--bds-text-primary); }\n' });
    expect(run(root).status).toBe(0);
  });

  it('passes a pair where the same block also sets the --bds- name', () => {
    const root = plant({ 'src/theme.css': '.a {\n  --bds-text-primary: #123456;\n  --text-primary: #123456;\n}\n' });
    expect(run(root).status).toBe(0);
  });

  it('fails a pair split across two blocks', () => {
    const root = plant({ 'src/theme.css': '.a { --bds-text-primary: #123; }\n.b { --text-primary: #123; }\n' });
    expect(run(root).status).toBe(1);
  });

  it('ignores reads, comments and names the bridge does not alias', () => {
    const root = plant({
      'src/theme.css':
        '/* --text-primary: #fff; */\n.a { color: var(--text-primary); --plan-tier-price: 1px; --bds-surface-inverse: #000 }\n',
    });
    expect(run(root).status).toBe(0);
  });

  it('keeps a quoted CSS font stack intact in the message', () => {
    const bridge = `:root {\n${BRIDGE}\n  --font-family-body: var(--bds-font-family-body);\n}\n`;
    const root = plant({ 'src/a.css': ".a { --font-family-body: 'Lato', serif; }\n" }, bridge);
    expect(run(root).output).toContain("--font-family-body: 'Lato', serif — set");
  });
});

describe('old-name-override in inline styles', () => {
  it('fails an inline TSX style key', () => {
    const root = plant({
      'src/page.tsx': "export const P = () => (\n  <div style={{ '--background-brand-primary': tone.bg }} />\n);\n",
    });
    const { status, output } = run(root);
    expect(status).toBe(1);
    expect(output).toContain('src/page.tsx:2: --background-brand-primary: tone.bg');
  });

  it('passes the TSX pair form brikdesigns#1915 ships', () => {
    const root = plant({
      'src/page.tsx':
        "const s = {\n  '--bds-background-brand-primary': tone.bg,\n  '--background-brand-primary': tone.bg,\n};\n",
    });
    expect(run(root).status).toBe(0);
  });

  it('catches an inline style in an .astro file', () => {
    const root = plant({ 'src/Hero.astro': '<div style={{ "--text-primary": color }} />\n' });
    expect(run(root).status).toBe(1);
  });

  it('skips stories and tests', () => {
    const root = plant({ 'src/a.stories.tsx': "const s = { '--text-primary': 'red' };\n" });
    expect(run(root).status).toBe(0);
  });
});

describe('binding-shape (--theme)', () => {
  it('accepts the collapsed System ID bds binding', () => {
    const root = plant({ 'src/theme.css': '.theme { --bds-text-primary: #111; --bds-footer-surface: #000; }\n' });
    expect(run(root, '--theme', 'src/theme.css', '--id', 'bds').status).toBe(0);
  });

  it('fails a --bds- name that is neither a token nor a component hook', () => {
    const root = plant({ 'src/theme.css': '.theme { --bds-text-primray: #111; }\n' });
    const { status, output } = run(root, '--theme', 'src/theme.css', '--id', 'bds');
    expect(status).toBe(1);
    expect(output).toContain('--bds-text-primray is not a BDS token');
  });

  it('requires the § 6 shape for a client System ID', () => {
    const good = plant({ 'src/theme.css': '.t { --tncld-text-primary: #036; --bds-text-primary: var(--tncld-text-primary); }\n' });
    expect(run(good, '--theme', 'src/theme.css', '--id', 'tncld').status).toBe(0);

    const raw = plant({ 'src/theme.css': '.t { --bds-text-primary: #036; }\n' });
    expect(run(raw, '--theme', 'src/theme.css', '--id', 'tncld').output).toContain('expected var(--tncld-text-primary)');

    const dangling = plant({ 'src/theme.css': '.t { --bds-text-primary: var(--tncld-text-primary); }\n' });
    expect(run(dangling, '--theme', 'src/theme.css', '--id', 'tncld').output).toContain('which this block never declares');
  });
});

describe('invocation', () => {
  it('exits 2 on a bridge too small to be the real one', () => {
    const root = plant({ 'src/a.css': '' }, ':root { --text-primary: var(--bds-text-primary); }\n');
    const { status, output } = run(root);
    expect(status).toBe(2);
    expect(output).toContain('read only 1 bridged names');
  });

  it('exits 2 on --id without --theme', () => {
    expect(run(plant({ 'src/a.css': '' }), '--id', 'bds').status).toBe(2);
  });
});
