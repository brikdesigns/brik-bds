import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(__dirname, '..', 'lint-mdx-tokens.mjs');

// Hermetic: a tiny explicit registry (`--tokens`) so the test never builds
// dist/tokens.css nor scans component CSS. `--files` points the scanner at one
// fixture MDX. Exactly the pattern lint-doc-links.test.mjs uses.
let dir;
let registry;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'mdx-tokens-'));
  registry = join(dir, 'tokens.css');
  // The known-name set for every case below.
  writeFileSync(
    registry,
    ':root {\n' +
      '  --bds-text-primary: #000;\n' +
      '  --bds-text-status-info: #06c;\n' +
      '  --bds-surface-positive: #0a0;\n' +
      '  --bds-background-brand-primary: #e35335;\n' +
      '  --bds-size-400: 16px;\n' +
      '  --bds-border-muted: #ccc;\n' +
      '  --bds-color-poppy-500: #e35335;\n' +
      '  --bds-color-poppy-light: var(--bds-color-poppy-500); /** DEPRECATED — use color.poppy.500 (brik-bds#1739) */\n' +
      '  --bds-color-poppy-800: #9e2f18;\n' +
      '}\n' +
      // The compat bridge shape (#2670): pure-prefix aliases + a retired word step.
      ':root {\n' +
      '  --text-primary: var(--bds-text-primary);\n' +
      '  --color-poppy-light: var(--bds-color-poppy-light);\n' +
      '  --color-poppy-darker: var(--bds-color-poppy-800);\n' +
      '}\n',
  );
});

afterAll(() => rmSync(dir, { recursive: true, force: true }));

// Run the linter over one MDX body; return { code, json }.
function run(mdx) {
  const file = join(dir, 'page.mdx');
  writeFileSync(file, mdx);
  let code = 0;
  let stdout = '';
  try {
    stdout = execFileSync(
      'node',
      [SCRIPT, '--json', '--tokens', registry, '--files', file],
      { encoding: 'utf8' },
    );
  } catch (err) {
    code = err.status ?? 1;
    stdout = err.stdout?.toString() ?? '';
  }
  return { code, json: JSON.parse(stdout) };
}

const fence = (body) => '```css\n' + body + '\n```\n';
const table = (cell) => `| Token | Note |\n|---|---|\n| ${cell} | x |\n`;

describe('lint-mdx-tokens', () => {
  it('passes a real token in a code fence', () => {
    const { code, json } = run(fence('color: var(--bds-text-primary);'));
    expect(code).toBe(0);
    expect(json.violations).toHaveLength(0);
  });

  it('passes a real token in a table', () => {
    const { code } = run(table('`--bds-surface-positive`'));
    expect(code).toBe(0);
  });

  it('FAILS on a phantom token in a code fence (the AC)', () => {
    const { code, json } = run(fence('color: var(--bds-surface-success);'));
    expect(code).toBe(1);
    expect(json.violations.map((v) => v.token)).toContain('--bds-surface-success');
  });

  it('FAILS on a phantom token in a table', () => {
    const { code, json } = run(table('`--bds-text-info`'));
    expect(code).toBe(1);
    expect(json.violations.map((v) => v.token)).toContain('--bds-text-info');
  });

  it('reports every phantom with file + line + token', () => {
    const { json } = run(fence('a: var(--bds-padding-button);\nb: var(--bds-size-tiny);'));
    const tokens = json.violations.map((v) => v.token).sort();
    expect(tokens).toEqual(['--bds-padding-button', '--bds-size-tiny']);
    for (const v of json.violations) {
      expect(v.file).toMatch(/page\.mdx$/);
      expect(v.line).toBeGreaterThan(0);
    }
  });

  it('ignores interpolation placeholders (--bds-surface-{role})', () => {
    const { code } = run(table('`--bds-surface-{role}`, `--bds-text-service-{line}-on-light`'));
    expect(code).toBe(0);
  });

  it('ignores glob patterns (--bds-text-*)', () => {
    const { code } = run(table('`--bds-text-*`, `--bds-background-*`'));
    expect(code).toBe(0);
  });

  it('ignores ranges (--bds-size-0…2200) and dangling stubs (--bds-text-)', () => {
    const { code } = run(fence('/* --bds-size-0…2200, prefix --bds-text- */'));
    expect(code).toBe(0);
  });

  it('ignores out-of-family names (--bds-font-*, --bds-space-*)', () => {
    // Not in FAMILIES, so unknown-ness is out of scope even inside a fence.
    const { code } = run(fence('--bds-font-family-fictional: x;\n--space-nope: y;'));
    expect(code).toBe(0);
  });

  it('does NOT scan prose inline-code (scope = fenced code + tables)', () => {
    const { code } = run('A sentence mentioning `--bds-surface-success` in prose.\n');
    expect(code).toBe(0);
  });

  it('honors a line-level lint-mdx-tokens-ignore', () => {
    const { code } = run(fence('color: var(--bds-surface-success); /* lint-mdx-tokens-ignore */'));
    expect(code).toBe(0);
  });

  it('honors a lint-mdx-tokens-ignore-start/end block', () => {
    const mdx =
      '{/* lint-mdx-tokens-ignore-start */}\n' +
      table('`--bds-surface-warm`, `--bds-text-on-ink`') +
      '{/* lint-mdx-tokens-ignore-end */}\n';
    const { code } = run(mdx);
    expect(code).toBe(0);
  });

  it('FAILS on a deprecated alias in a code fence (#1753)', () => {
    const { code, json } = run(fence('background: var(--bds-color-poppy-light);'));
    expect(code).toBe(1);
    expect(json.violations).toHaveLength(1);
    expect(json.violations[0]).toMatchObject({
      token: '--bds-color-poppy-light',
      kind: 'deprecated',
      replacement: '--bds-color-poppy-500',
    });
  });

  it('FAILS on a deprecated alias in a table', () => {
    const { code, json } = run(table('`--bds-color-poppy-light`'));
    expect(code).toBe(1);
    expect(json.violations.map((v) => v.kind)).toEqual(['deprecated']);
  });

  it('passes the numeric stop the alias points at', () => {
    const { code } = run(fence('background: var(--bds-color-poppy-500);'));
    expect(code).toBe(0);
  });

  it('does not flag a deprecated alias in prose (same scope as rule 1)', () => {
    const { code } = run('The retired `--bds-color-poppy-light` alias.\n');
    expect(code).toBe(0);
  });

  it('honors the ignore hatch for a deliberate deprecated-alias mapping table', () => {
    const mdx =
      '{/* lint-mdx-tokens-ignore-start */}\n' +
      table('`--bds-color-poppy-light`') +
      '{/* lint-mdx-tokens-ignore-end */}\n';
    const { code } = run(mdx);
    expect(code).toBe(0);
  });

  it('separates deprecated from phantom in one file', () => {
    const { code, json } = run(
      fence('a: var(--bds-color-poppy-light);\nb: var(--bds-surface-success);'),
    );
    expect(code).toBe(1);
    const byKind = Object.fromEntries(json.violations.map((v) => [v.token, v.kind]));
    expect(byKind).toEqual({
      '--bds-color-poppy-light': 'deprecated',
      '--bds-surface-success': 'phantom',
    });
  });

  it('passes a bare name the compat bridge still serves (#2670)', () => {
    const { code } = run(fence('color: var(--text-primary);'));
    expect(code).toBe(0);
  });

  it('FAILS on a bare phantom (#2670)', () => {
    const { code, json } = run(fence('color: var(--surface-success);'));
    expect(code).toBe(1);
    expect(json.violations[0]).toMatchObject({ token: '--surface-success', kind: 'phantom' });
  });

  it('FAILS on a retired word step served by the bridge (#2670)', () => {
    const { code, json } = run(table('`--color-poppy-darker`'));
    expect(code).toBe(1);
    expect(json.violations[0]).toMatchObject({
      token: '--color-poppy-darker',
      kind: 'deprecated',
      replacement: '--bds-color-poppy-800',
    });
  });

  it('carries a DEPRECATED name onto its bare bridge alias (#2670)', () => {
    const { json } = run(fence('a: var(--color-poppy-light);'));
    expect(json.violations[0]).toMatchObject({
      token: '--color-poppy-light',
      kind: 'deprecated',
      replacement: '--bds-color-poppy-500',
    });
  });

  it('resumes flagging after an ignore block closes', () => {
    const mdx =
      '{/* lint-mdx-tokens-ignore-start */}\n' +
      fence('a: var(--bds-surface-warm);') +
      '{/* lint-mdx-tokens-ignore-end */}\n' +
      fence('b: var(--bds-surface-success);');
    const { code, json } = run(mdx);
    expect(code).toBe(1);
    const tokens = json.violations.map((v) => v.token);
    expect(tokens).toContain('--bds-surface-success');
    expect(tokens).not.toContain('--bds-surface-warm');
  });
});
