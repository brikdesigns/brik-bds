import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
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

/**
 * Stale-part reaper (#1652).
 *
 * Runs `rag_ingest_standard` against a stub `brik-rag` on PATH, so nothing
 * touches the real corpus. The stub reports `forgotten` for parts up to
 * FAKE_PARTS and `not-found` beyond, which is exactly the shape of a standard
 * that shrank.
 */
function ingestWithStubbedRag({ body, fakeParts }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rag-reap-'));
  const log = path.join(dir, 'calls.log');
  const stub = path.join(dir, 'brik-rag');

  // Args arrive as `forget --project P --name NAME-part-N`; echo the payload
  // shape the real CLI returns so the reaper's `case` matches.
  fs.writeFileSync(
    stub,
    `#!/usr/bin/env bash
echo "$@" >> ${JSON.stringify(log)}
if [ "$1" = "forget" ]; then
  name=""
  while [ $# -gt 0 ]; do
    [ "$1" = "--name" ] && name="$2"
    shift
  done
  n="\${name##*-part-}"
  if [ "$n" -le ${fakeParts} ] 2>/dev/null; then
    echo '{ "status": "forgotten", "deleted": 1 }'
  else
    echo '{ "status": "not-found", "deleted": 0 }'
  fi
  exit 0
fi
echo '{ "status": "updated" }'
exit 0
`,
    { mode: 0o755 },
  );

  const script = `
    export PATH=${JSON.stringify(dir)}:"$PATH"
    source ${JSON.stringify(LIB)}
    rag_ingest_standard test-standard "desc" reference brik-bds "$1"
  `;
  const stdout = execFileSync('bash', ['-c', script, 'bash', body], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  const calls = fs.existsSync(log)
    ? fs.readFileSync(log, 'utf8').trim().split('\n').filter(Boolean)
    : [];
  fs.rmSync(dir, { recursive: true, force: true });

  const reaped = calls
    .filter((c) => c.startsWith('forget '))
    .map((c) => Number(c.match(/-part-(\d+)/)?.[1]))
    .filter((n) => Number.isFinite(n));
  return { stdout, reaped };
}

describe('_rag_reap_stale_parts', () => {
  it('reaps on the single-chunk path — shrink-to-fit is the risky case', () => {
    // The body fits, so this exercises the early-return branch that used to
    // skip the reaper entirely, stranding every part from when it was oversized.
    const { reaped, stdout } = ingestWithStubbedRag({
      body: '# Small\n\n## One\n\nstill fits.\n',
      fakeParts: 3,
    });

    expect(reaped).toEqual([2, 3, 4, 5, 6]);
    expect(stdout).toContain('Reaped 2 stale part chunk(s)');
  });

  it('probes the whole window even when the sequence has holes', () => {
    // brik-rag dedupes identical chunks, so parts can be missing in the middle.
    // The window must not stop at the first gap — that is where a
    // stop-after-N-misses sweep stranded the tail.
    const { reaped } = ingestWithStubbedRag({
      body: '# Small\n\n## One\n\nfits.\n',
      fakeParts: 0,
    });

    expect(reaped).toEqual([2, 3, 4, 5, 6]);
  });

  it('says nothing when there was nothing to reap', () => {
    const { stdout } = ingestWithStubbedRag({
      body: '# Small\n\n## One\n\nfits.\n',
      fakeParts: 0,
    });

    expect(stdout).not.toContain('Reaped');
  });
});
