/**
 * Sibling-issue detection (#1663).
 *
 * The number-keyed claim gate is blind to two sessions each filing their OWN
 * issue for one problem — both claims succeed, the work is duplicated. These
 * tests pin the scoring against a stubbed `gh`, using the real titles from the
 * collision that motivated it: #1645 "Standards ingest is 51 chars from
 * breaking the pre-commit gate" and #1648 "Chunk standards ingest — story-shape
 * is at the 32k ceiling".
 */
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const LIB = path.join(REPO_ROOT, 'scripts/lib/issue-overlap.sh');

/**
 * Run `_io_similar_open_issues` with `gh issue list` stubbed to return `issues`.
 * Returns the emitted candidate rows.
 */
function similar({ self, title, issues }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'title-overlap-'));
  const stub = path.join(dir, 'gh');
  fs.writeFileSync(
    stub,
    `#!/usr/bin/env bash\ncat ${JSON.stringify(path.join(dir, 'issues.json'))}\n`,
    { mode: 0o755 },
  );
  fs.writeFileSync(path.join(dir, 'issues.json'), JSON.stringify(issues));

  const script = `
    export PATH=${JSON.stringify(dir)}:"$PATH"
    source ${JSON.stringify(LIB)}
    _io_similar_open_issues brikdesigns brik-bds "$1" "$2"
  `;
  const out = execFileSync(
    'bash',
    ['-c', script, 'bash', String(self), title],
    { encoding: 'utf8' },
  );
  fs.rmSync(dir, { recursive: true, force: true });

  return out
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [number, score, shared, ...rest] = line.split('\t');
      return {
        number: Number(number),
        score: Number(score),
        shared: shared.split('+'),
        title: rest.join('\t'),
      };
    });
}

/** Titles that were open in brik-bds when #1648 was filed, plus #1645 itself. */
const CORPUS = [
  { number: 1645, title: 'Standards ingest is 51 chars from breaking the pre-commit gate' },
  { number: 1648, title: 'Chunk standards ingest — story-shape is at the 32k ceiling' },
  { number: 1321, title: 'Extend story-shape lint to structural rules' },
  { number: 1316, title: 'Align blueprint stories with the story-shape standard' },
  { number: 1314, title: 'Story-shape: TaskConsole, EmptyState, Icons +5' },
  { number: 1308, title: 'Storybook story-shape audit follow-ups' },
  { number: 1474, title: 'Add a neutral filled panel variant to Card' },
  { number: 1503, title: 'FilterButton disabled state renders an invisible label' },
];

describe('_io_similar_open_issues', () => {
  it('surfaces the real duplicate that the number-keyed gate missed', () => {
    const hits = similar({
      self: 1648,
      title: 'Chunk standards ingest — story-shape is at the 32k ceiling',
      issues: CORPUS,
    });

    expect(hits[0].number).toBe(1645);
    expect(hits[0].shared).toEqual(expect.arrayContaining(['standards', 'ingest']));
  });

  it('ranks a rare token pair above a common domain phrase', () => {
    // Four other issues share "story"+"shape". IDF must keep them below the
    // "standards"+"ingest" hit, or the signal drowns in domain vocabulary.
    const hits = similar({
      self: 1648,
      title: 'Chunk standards ingest — story-shape is at the 32k ceiling',
      issues: CORPUS,
    });

    const storyShape = hits.filter((h) => h.shared.includes('shape'));
    for (const h of storyShape) {
      expect(h.score).toBeLessThan(hits[0].score);
    }
  });

  it('never reports the issue being claimed', () => {
    const hits = similar({
      self: 1645,
      title: 'Standards ingest is 51 chars from breaking the pre-commit gate',
      issues: CORPUS,
    });

    expect(hits.map((h) => h.number)).not.toContain(1645);
  });

  it('stays quiet on an unrelated ticket', () => {
    const hits = similar({
      self: 1474,
      title: 'Add a neutral filled panel variant to Card',
      issues: CORPUS,
    });

    expect(hits).toEqual([]);
  });

  it('needs more than one shared token — a single word is not a duplicate', () => {
    const hits = similar({
      self: 9001,
      title: 'Standards for something entirely different',
      issues: CORPUS,
    });

    expect(hits).toEqual([]);
  });
});
