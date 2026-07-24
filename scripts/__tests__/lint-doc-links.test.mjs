import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(__dirname, '..', 'lint-doc-links.js');

// A hermetic fixture: its own docs tree + Storybook index, so the test runs in
// the `scripts` vitest project (node, no Storybook build) exactly like CI's
// Test Suite workflow. `--docs-root` / `--index` point the checker at it.
let dir;
let docsRoot;
let indexPath;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'doc-links-'));
  docsRoot = join(dir, 'docs');
  indexPath = join(dir, 'index.json');
  mkdirSync(join(docsRoot, 'components'), { recursive: true });

  // A real page the good link resolves to. Its headings back the anchor tests:
  // `## Usage` → #usage, and a compound heading whose Fumadocs slug keeps the
  // double hyphen from the dropped em-dash (`#modes--orthogonal-axes`).
  writeFileSync(
    join(docsRoot, 'components', 'button.mdx'),
    '# Button\n\n## Usage\n\nBody.\n\n## Modes — orthogonal axes\n\nBody.\n'
  );
  // A real Storybook ID set.
  writeFileSync(
    indexPath,
    JSON.stringify({ v: 5, entries: { 'components-button--overview': {} } })
  );
});

afterAll(() => rmSync(dir, { recursive: true, force: true }));

function run(mdx) {
  const file = join(dir, 'case.mdx');
  writeFileSync(file, mdx);
  return runFile(file);
}

// Run the checker over an arbitrary file. `runDoc` writes the file *inside* the
// fixture docs-root so in-page `#anchor` validation applies (the checker only
// validates in-page anchors for docs-site pages).
function runDoc(name, mdx) {
  const file = join(docsRoot, name);
  writeFileSync(file, mdx);
  return runFile(file);
}

function runFile(file) {
  try {
    const stdout = execFileSync(
      process.execPath,
      [SCRIPT, '--files', file, '--docs-root', docsRoot, '--index', indexPath],
      { encoding: 'utf8' }
    );
    return { code: 0, stdout };
  } catch (err) {
    return { code: err.status ?? 1, stdout: (err.stdout || '') + (err.stderr || '') };
  }
}

describe('lint-doc-links', () => {
  it('passes when every doc + storybook link resolves', () => {
    const { code, stdout } = run(
      'See [Button](/docs/components/button) and ' +
        '[playground](https://storybook.brikdesigns.com/?path=/docs/components-button--overview).\n'
    );
    expect(code).toBe(0);
    expect(stdout).toMatch(/All doc \+ anchor \+ storybook links resolve/);
  });

  it('fails on a dead internal /docs cross-link', () => {
    const { code, stdout } = run('Broken [link](/docs/components/does-not-exist).\n');
    expect(code).toBe(1);
    expect(stdout).toContain('/docs/components/does-not-exist');
    expect(stdout).toMatch(/no docs-site page/);
  });

  it('fails on a dead Storybook story ID', () => {
    const { code, stdout } = run(
      'Broken [story](https://storybook.brikdesigns.com/?path=/docs/components-ghost--overview).\n'
    );
    expect(code).toBe(1);
    expect(stdout).toContain('components-ghost--overview');
    expect(stdout).toMatch(/not in Storybook index/);
  });

  it('resolves a valid #anchor on the target page', () => {
    const { code } = run('Anchored [link](/docs/components/button#usage).\n');
    expect(code).toBe(0);
  });

  it('fails on a #anchor that does not exist on the target page', () => {
    const { code, stdout } = run('Anchored [link](/docs/components/button#ghost).\n');
    expect(code).toBe(1);
    expect(stdout).toMatch(/no heading anchor "#ghost"/);
    expect(stdout).toContain('button.mdx');
  });

  it('matches the Fumadocs slug for a compound heading (no whitespace collapse)', () => {
    // The em-dash is dropped and each surrounding space becomes a hyphen, so the
    // real slug is `modes--orthogonal-axes`. The collapsed single-hyphen form is
    // NOT a valid anchor — this is the load-bearing github-slugger detail.
    expect(run('[ok](/docs/components/button#modes--orthogonal-axes).\n').code).toBe(0);
    const bad = run('[bad](/docs/components/button#modes-orthogonal-axes).\n');
    expect(bad.code).toBe(1);
    expect(bad.stdout).toMatch(/no heading anchor/);
  });

  it('validates in-page #anchor links within a docs page', () => {
    expect(
      runDoc('components/self-ok.mdx', '# Self\n\n## Section one\n\nSee [it](#section-one).\n').code
    ).toBe(0);
    const bad = runDoc(
      'components/self-bad.mdx',
      '# Self\n\n## Section one\n\nSee [it](#section-two).\n'
    );
    expect(bad.code).toBe(1);
    expect(bad.stdout).toMatch(/no heading anchor "#section-two" in this page/);
  });

  it('ignores anchors inside fenced code blocks when deriving slugs', () => {
    // A `#` line inside a code fence is not a heading, so linking to it fails.
    const { code, stdout } = runDoc(
      'components/fenced.mdx',
      '# Real\n\n```md\n## Not a heading\n```\n\nSee [x](#not-a-heading).\n'
    );
    expect(code).toBe(1);
    expect(stdout).toMatch(/no heading anchor "#not-a-heading"/);
  });

  it('skips a link with an empty #fragment', () => {
    // `/docs/components/button#` resolves the page; there is no anchor to check.
    expect(run('Bare hash [link](/docs/components/button#).\n').code).toBe(0);
  });

  it('is case-sensitive on anchors (slugs are always lowercase)', () => {
    const { code, stdout } = run('Anchored [link](/docs/components/button#Usage).\n');
    expect(code).toBe(1);
    expect(stdout).toMatch(/no heading anchor "#Usage"/);
  });

  it('does not validate in-page anchors outside the docs tree', () => {
    // case.mdx lives outside --docs-root, so its own `#anchor` is not a
    // Fumadocs page anchor (mirrors Storybook MDX under components/ui) — skipped.
    expect(run('# Case\n\nSee [x](#nonexistent-heading).\n').code).toBe(0);
  });

  it('resolves the -1 suffix of a duplicated heading (per-file slugger state)', () => {
    const { code } = runDoc(
      'components/dupes.mdx',
      '# Dupes\n\n## Notes\n\nA.\n\n## Notes\n\nB.\n\nSee [second](#notes-1).\n'
    );
    expect(code).toBe(0);
  });

  it('fails on a ComponentLinks slug with no docs-site page', () => {
    const { code, stdout } = run('<ComponentLinks slug="brand-new-widget" />\n');
    expect(code).toBe(1);
    expect(stdout).toContain('slug="brand-new-widget"');
    expect(stdout).toMatch(/no docs-site page/);
  });

  it('tolerates a ComponentLinks slug on the acknowledged-debt allowlist', () => {
    // `service-tag` is a known docless component; the fixture docs-root has no
    // page for it, so this passes only because it is allowlisted.
    const { code } = run('<ComponentLinks slug="service-tag" />\n');
    expect(code).toBe(0);
  });
});
