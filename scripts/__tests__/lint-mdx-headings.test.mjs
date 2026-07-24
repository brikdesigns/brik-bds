import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(__dirname, '..', 'lint-mdx-headings.mjs');

// Hermetic: `--files` points the scanner at one fixture MDX in a temp dir.
// Same pattern as lint-mdx-tokens.test.mjs.
let dir;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'mdx-headings-'));
});

afterAll(() => rmSync(dir, { recursive: true, force: true }));

// Run the linter over one MDX body; return { code, json }.
function run(mdx) {
  const file = join(dir, 'page.mdx');
  writeFileSync(file, mdx);
  let code = 0;
  let stdout = '';
  try {
    stdout = execFileSync('node', [SCRIPT, '--json', '--files', file], { encoding: 'utf8' });
  } catch (err) {
    code = err.status ?? 1;
    stdout = err.stdout?.toString() ?? '';
  }
  return { code, json: JSON.parse(stdout) };
}

const rules = (json) => json.violations.flatMap((v) => v.rules);

describe('lint-mdx-headings', () => {
  it('passes a clean scannable heading', () => {
    const { code, json } = run('## Token cascade\n\nBody.\n');
    expect(code).toBe(0);
    expect(json.violations).toHaveLength(0);
  });

  it('FAILS on an em dash in a heading (the AC)', () => {
    const { code, json } = run('## Modes — orthogonal axes\n');
    expect(code).toBe(1);
    expect(rules(json)).toContain('em dash');
  });

  it('FAILS on a backtick in a heading', () => {
    const { code, json } = run('### The `useTheme` hook\n');
    expect(code).toBe(1);
    expect(rules(json)).toContain('backtick');
  });

  it('FAILS on a parenthetical in a heading', () => {
    const { code, json } = run('## Horizontal (default)\n');
    expect(code).toBe(1);
    expect(rules(json)).toContain('parenthetical');
  });

  it('FAILS on a slash in a heading', () => {
    const { code, json } = run('### Fonts via next/font\n');
    expect(code).toBe(1);
    expect(rules(json)).toContain('slash');
  });

  it('FAILS on an arrow in a heading', () => {
    const { code, json } = run('## Figma → tokens\n');
    expect(code).toBe(1);
    expect(rules(json)).toContain('arrow');
  });

  it('reports every banned construct on a heading', () => {
    const { json } = run('## A `b` / c (d) → e\n');
    const r = json.violations[0].rules.sort();
    expect(r).toEqual(['arrow', 'backtick', 'parenthetical', 'slash']);
  });

  it('checks the frontmatter title', () => {
    const { code, json } = run('---\ntitle: Real Estate — Commercial Brokerage\ndescription: x\n---\n\n## Clean\n');
    expect(code).toBe(1);
    expect(json.violations[0].kind).toBe('title');
    expect(json.violations[0].rules).toContain('em dash');
  });

  it('handles a quoted frontmatter title', () => {
    const { code, json } = run('---\ntitle: "Fonts (advanced)"\ndescription: x\n---\n\n## Clean\n');
    expect(code).toBe(1);
    expect(json.violations[0].rules).toContain('parenthetical');
  });

  it('allows one trailing self-closing badge component', () => {
    const { code } = run('## Parallax <TierBadge tier="gsap" />\n');
    expect(code).toBe(0);
  });

  it('flags a second badge via the leftover slash', () => {
    const { code, json } = run('## Parallax <A /> <B />\n');
    expect(code).toBe(1);
    expect(rules(json)).toContain('slash');
  });

  it('ignores headings inside a fenced code block', () => {
    const { code } = run('## Clean\n\n```md\n## Example — with em dash\n```\n');
    expect(code).toBe(0);
  });

  it('does NOT check `#` (H1) or `####`+ depth — separate rules', () => {
    const { code } = run('# Title — em dash\n\n#### Deep (paren)\n');
    expect(code).toBe(0);
  });

  it('honors a line-level lint-mdx-headings-ignore', () => {
    const { code } = run('## Fonts via next/font {/* lint-mdx-headings-ignore */}\n');
    expect(code).toBe(0);
  });

  it('honors a lint-mdx-headings-ignore-start/end block', () => {
    const mdx =
      '{/* lint-mdx-headings-ignore-start */}\n' +
      '## Legacy — heading\n' +
      '{/* lint-mdx-headings-ignore-end */}\n';
    const { code } = run(mdx);
    expect(code).toBe(0);
  });

  it('resumes flagging after an ignore block closes', () => {
    const mdx =
      '{/* lint-mdx-headings-ignore-start */}\n' +
      '## Legacy — heading\n' +
      '{/* lint-mdx-headings-ignore-end */}\n' +
      '## Fresh — heading\n';
    const { code, json } = run(mdx);
    expect(code).toBe(1);
    expect(json.violations).toHaveLength(1);
    expect(json.violations[0].text).toContain('Fresh');
  });
});
