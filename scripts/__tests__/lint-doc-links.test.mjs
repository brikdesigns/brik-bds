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

  // A real page the good link resolves to.
  writeFileSync(join(docsRoot, 'components', 'button.mdx'), '# Button\n');
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
    expect(stdout).toMatch(/All doc \+ storybook links resolve/);
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

  it('resolves a link past its #anchor fragment', () => {
    const { code } = run('Anchored [link](/docs/components/button#usage).\n');
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
