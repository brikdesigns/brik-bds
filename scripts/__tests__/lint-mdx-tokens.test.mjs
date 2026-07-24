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
      '  --text-primary: #000;\n' +
      '  --text-status-info: #06c;\n' +
      '  --surface-positive: #0a0;\n' +
      '  --background-brand-primary: #e35335;\n' +
      '  --size-400: 16px;\n' +
      '  --border-muted: #ccc;\n' +
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
    const { code, json } = run(fence('color: var(--text-primary);'));
    expect(code).toBe(0);
    expect(json.violations).toHaveLength(0);
  });

  it('passes a real token in a table', () => {
    const { code } = run(table('`--surface-positive`'));
    expect(code).toBe(0);
  });

  it('FAILS on a phantom token in a code fence (the AC)', () => {
    const { code, json } = run(fence('color: var(--surface-success);'));
    expect(code).toBe(1);
    expect(json.violations.map((v) => v.token)).toContain('--surface-success');
  });

  it('FAILS on a phantom token in a table', () => {
    const { code, json } = run(table('`--text-info`'));
    expect(code).toBe(1);
    expect(json.violations.map((v) => v.token)).toContain('--text-info');
  });

  it('reports every phantom with file + line + token', () => {
    const { json } = run(fence('a: var(--padding-button);\nb: var(--size-tiny);'));
    const tokens = json.violations.map((v) => v.token).sort();
    expect(tokens).toEqual(['--padding-button', '--size-tiny']);
    for (const v of json.violations) {
      expect(v.file).toMatch(/page\.mdx$/);
      expect(v.line).toBeGreaterThan(0);
    }
  });

  it('ignores interpolation placeholders (--surface-{role})', () => {
    const { code } = run(table('`--surface-{role}`, `--text-service-{line}-on-light`'));
    expect(code).toBe(0);
  });

  it('ignores glob patterns (--text-*)', () => {
    const { code } = run(table('`--text-*`, `--background-*`'));
    expect(code).toBe(0);
  });

  it('ignores ranges (--size-0…2200) and dangling stubs (--text-)', () => {
    const { code } = run(fence('/* --size-0…2200, prefix --text- */'));
    expect(code).toBe(0);
  });

  it('ignores out-of-family names (--font-*, --space-*)', () => {
    // Not in FAMILIES, so unknown-ness is out of scope even inside a fence.
    const { code } = run(fence('--font-family-fictional: x;\n--space-nope: y;'));
    expect(code).toBe(0);
  });

  it('does NOT scan prose inline-code (scope = fenced code + tables)', () => {
    const { code } = run('A sentence mentioning `--surface-success` in prose.\n');
    expect(code).toBe(0);
  });

  it('honors a line-level lint-mdx-tokens-ignore', () => {
    const { code } = run(fence('color: var(--surface-success); /* lint-mdx-tokens-ignore */'));
    expect(code).toBe(0);
  });

  it('honors a lint-mdx-tokens-ignore-start/end block', () => {
    const mdx =
      '{/* lint-mdx-tokens-ignore-start */}\n' +
      table('`--surface-warm`, `--text-on-ink`') +
      '{/* lint-mdx-tokens-ignore-end */}\n';
    const { code } = run(mdx);
    expect(code).toBe(0);
  });

  it('resumes flagging after an ignore block closes', () => {
    const mdx =
      '{/* lint-mdx-tokens-ignore-start */}\n' +
      fence('a: var(--surface-warm);') +
      '{/* lint-mdx-tokens-ignore-end */}\n' +
      fence('b: var(--surface-success);');
    const { code, json } = run(mdx);
    expect(code).toBe(1);
    const tokens = json.violations.map((v) => v.token);
    expect(tokens).toContain('--surface-success');
    expect(tokens).not.toContain('--surface-warm');
  });
});
