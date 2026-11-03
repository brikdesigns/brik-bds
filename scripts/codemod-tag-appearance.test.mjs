/**
 * Tests for scripts/codemod-tag-appearance.mjs (brik-bds#2943).
 *
 * The rename is a swap — old `subtle` → `outline` AND old `muted` → `subtle` —
 * so the ordering case is the one that matters: a sequential find/replace turns
 * every `muted` Tag into `outline`. The remaining cases pin the "only <Tag>"
 * boundary and the CLI's `--dry-run` / path arguments.
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';
import { rewrite } from './codemod-tag-appearance.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'codemod-tag-appearance.mjs');

/** @type {string[]} */
const dirs = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('swap ordering', () => {
  it('moves subtle → outline and muted → subtle in one pass', () => {
    const src = '<Tag appearance="subtle">A</Tag>\n<Tag appearance="muted">B</Tag>\n';
    const { next, count } = rewrite(src);
    expect(next).toBe('<Tag appearance="outline">A</Tag>\n<Tag appearance="subtle">B</Tag>\n');
    expect(count).toBe(2);
  });

  it('never turns a muted Tag into outline', () => {
    expect(rewrite('<Tag appearance="muted">B</Tag>').next).toBe('<Tag appearance="subtle">B</Tag>');
  });

  it('leaves solid and unknown values alone', () => {
    const src = '<Tag appearance="solid">A</Tag><Tag appearance="outline">B</Tag><Tag>C</Tag>';
    expect(rewrite(src)).toMatchObject({ next: src, count: 0 });
  });
});

describe('attribute spellings', () => {
  it.each([
    ['appearance="subtle"', 'appearance="outline"'],
    ["appearance='muted'", "appearance='subtle'"],
    ['appearance={"subtle"}', 'appearance={"outline"}'],
    ["appearance={ 'muted' }", "appearance={ 'subtle' }"],
  ])('%s → %s', (from, to) => {
    expect(rewrite(`<Tag ${from} size="sm" />`).next).toBe(`<Tag ${to} size="sm" />`);
  });

  it('reads past a `=>` and a multi-line opening tag', () => {
    const src = '<Tag\n  onRemove={() => drop(id)}\n  size="sm"\n  appearance="muted"\n>\n  x\n</Tag>';
    expect(rewrite(src).next).toBe(src.replace('"muted"', '"subtle"'));
  });
});

describe('only <Tag> elements', () => {
  it('does not touch Badge', () => {
    const src = '<Badge appearance="subtle" tone="info">A</Badge><Badge appearance="muted">B</Badge>';
    expect(rewrite(src)).toMatchObject({ next: src, count: 0 });
  });

  it.each(['TagGroup', 'ServiceTag', 'Tags', 'AddableTagList', 'Chip'])('does not touch <%s>', (name) => {
    const src = `<${name} appearance="subtle">A</${name}>`;
    expect(rewrite(src)).toMatchObject({ next: src, count: 0 });
  });

  it('does not rewrite an element nested inside a Tag attribute', () => {
    const src = '<Tag icon={<Badge appearance="subtle" />} appearance="subtle">A</Tag>';
    expect(rewrite(src).next).toBe('<Tag icon={<Badge appearance="subtle" />} appearance="outline">A</Tag>');
  });

  it('does not rewrite a Badge sitting in a Tag’s children', () => {
    const src = '<Tag>x <Badge appearance="subtle">y</Badge></Tag>';
    expect(rewrite(src)).toMatchObject({ next: src, count: 0 });
  });
});

describe('dynamic appearance', () => {
  it('leaves it alone and reports its line for review', () => {
    const src = 'a\n<Tag appearance={on ? "subtle" : "muted"}>A</Tag>';
    expect(rewrite(src)).toEqual({ next: src, count: 0, review: [2] });
  });
});

describe('CLI', () => {
  const plant = () => {
    const dir = mkdtempSync(join(tmpdir(), 'codemod-tag-'));
    dirs.push(dir);
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'src', 'a.tsx'), '<Tag appearance="subtle">A</Tag>\n<Tag appearance="muted">B</Tag>\n');
    writeFileSync(join(dir, 'src', 'b.tsx'), '<Badge appearance="subtle">A</Badge>\n');
    writeFileSync(join(dir, 'other.tsx'), '<Tag appearance="subtle">A</Tag>\n');
    return dir;
  };
  const run = (cwd, ...args) => execFileSync('node', [SCRIPT, ...args], { cwd, encoding: 'utf8' });

  it('--dry-run reports and writes nothing', () => {
    const dir = plant();
    const out = run(dir, '--dry-run', 'src');
    expect(out).toContain('would rewrite 2 Tag appearance value(s) in 1 file(s)');
    expect(readFileSync(join(dir, 'src', 'a.tsx'), 'utf8')).toContain('appearance="muted"');
  });

  it('rewrites only the given paths, and only Tag', () => {
    const dir = plant();
    run(dir, 'src');
    expect(readFileSync(join(dir, 'src', 'a.tsx'), 'utf8')).toBe(
      '<Tag appearance="outline">A</Tag>\n<Tag appearance="subtle">B</Tag>\n',
    );
    expect(readFileSync(join(dir, 'src', 'b.tsx'), 'utf8')).toBe('<Badge appearance="subtle">A</Badge>\n');
    expect(readFileSync(join(dir, 'other.tsx'), 'utf8')).toBe('<Tag appearance="subtle">A</Tag>\n');
  });
});
