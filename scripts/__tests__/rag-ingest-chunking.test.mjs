import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LIB = path.join(REPO_ROOT, 'scripts/lib/rag-ingest.sh');

/**
 * H2 chunking for oversized standards (#1648).
 *
 * The cap is enforced by brik-rag, which these tests can't call, so they pin
 * the part this repo owns: the split is lossless, respects the limit, and only
 * ever cuts at an H2 boundary. A split that silently drops a rule would be far
 * worse than the failing commit it replaces.
 */

/** Run `_rag_split_h2 <body> <limit>` and return the chunks. */
function split(body, limit) {
  const script = `
    source ${JSON.stringify(LIB)}
    _rag_split_h2 "$1" "$2"
  `;
  const out = execFileSync('bash', ['-c', script, 'bash', body, String(limit)], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  const chunks = out.split('\0');
  if (chunks.at(-1) === '') chunks.pop(); // trailing NUL terminator
  return chunks;
}

const section = (h, size, fill) => `## ${h}\n${fill.repeat(size)}\n`;

describe('_rag_split_h2', () => {
  it('returns a single chunk when the body already fits', () => {
    const body = `preamble\n\n${section('A', 10, 'a')}\n${section('B', 10, 'b')}`;
    expect(split(body, 100_000)).toHaveLength(1);
  });

  it('splits into multiple chunks when the body exceeds the limit', () => {
    const body = `preamble\n\n${section('A', 100, 'a')}\n${section('B', 100, 'b')}\n${section('C', 100, 'c')}`;
    expect(split(body, 150).length).toBeGreaterThan(1);
  });

  it('is lossless — chunks rejoin to the original content', () => {
    const body = `preamble\n\n${section('A', 100, 'a')}\n${section('B', 100, 'b')}\n${section('C', 100, 'c')}`;
    const rejoined = split(body, 150).join('');
    // Chunk boundaries normalise trailing newlines; compare content, not padding.
    expect(rejoined.replace(/\n/g, '')).toBe(body.replace(/\n/g, ''));
  });

  it('only ever cuts at an H2 boundary', () => {
    const body = `preamble\n\n${section('A', 100, 'a')}\n${section('B', 100, 'b')}\n${section('C', 100, 'c')}`;
    // Every chunk after the first must open with an H2 — never mid-rule.
    for (const chunk of split(body, 150).slice(1)) {
      expect(chunk.startsWith('## ')).toBe(true);
    }
  });

  it('keeps the pre-H2 preamble with the first chunk', () => {
    const body = `preamble marker\n\n${section('A', 100, 'a')}\n${section('B', 100, 'b')}`;
    expect(split(body, 150)[0]).toContain('preamble marker');
  });

  it('emits an oversized single section whole rather than truncating it', () => {
    // One H2 bigger than the limit has no legal cut point. Emitting it intact
    // lets brik-rag reject it loudly; truncating would silently lose canon.
    const body = section('Huge', 500, 'x');
    const chunks = split(body, 100);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].replace(/\n/g, '')).toBe(body.replace(/\n/g, ''));
  });

  it('splits the real story-shape standard losslessly', () => {
    const standard = path.join(REPO_ROOT, '.claude/standards/storybook-story-shape.md');
    const body = execFileSync(
      'bash',
      ['-c', `awk 'BEGIN{c=0} /^---$/{c++; next} c>=2' ${JSON.stringify(standard)}`],
      { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
    );
    const chunks = split(body, 28_000);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(28_000);
    expect(chunks.join('').replace(/\n/g, '')).toBe(body.replace(/\n/g, ''));
  });
});
