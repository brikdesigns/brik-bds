/**
 * Regression tests for the standards-ingest splitter (#1645).
 *
 * `brik-rag remember` hard-caps a lesson at 32,000 chars. Before this splitter,
 * a standard that crossed the cap failed `.husky/pre-commit` — the gate
 * rejecting content on length rather than correctness. These tests exercise the
 * bash splitter directly (no brik-rag calls, so they run offline in CI).
 */
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LIB = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'ingest-standard.sh',
);

/** Run `_split_into_parts` over `body` and return each emitted part's text. */
function split(body: string, cap: number): string[] {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ingest-split-'));
  try {
    const count = Number(
      execFileSync(
        'bash',
        [
          '-c',
          `source "$1"; _split_into_parts "$2" "$3"`,
          '_',
          LIB,
          dir,
          String(cap),
        ],
        { input: body, encoding: 'utf8' },
      ).trim(),
    );
    return Array.from({ length: count }, (_, i) =>
      fs.readFileSync(path.join(dir, `part-${i + 1}`), 'utf8'),
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** A document of `sections` `## ` sections, each roughly `sectionChars` long. */
function doc(sections: number, sectionChars: number): string {
  let out = '# Title\n\nPreamble before the first heading.\n';
  for (let i = 1; i <= sections; i++) {
    out += `\n## Section ${i}\n\n${'x'.repeat(sectionChars)}\n`;
  }
  return out;
}

describe('standards ingest splitter', () => {
  it('emits a single part when the body fits under the cap', () => {
    const body = doc(3, 100);
    const parts = split(body, 30000);

    expect(parts).toHaveLength(1);
    expect(parts.join('')).toBe(body);
  });

  it('splits an over-cap body into parts that each fit', () => {
    const cap = 5000;
    const body = doc(10, 2000);
    const parts = split(body, cap);

    expect(parts.length).toBeGreaterThan(1);
    for (const part of parts) {
      expect(part.length).toBeLessThanOrEqual(cap);
    }
  });

  it('loses nothing — concatenated parts equal the original body', () => {
    const body = doc(10, 2000);
    expect(split(body, 5000).join('')).toBe(body);
  });

  it('splits only on `## ` boundaries, never mid-section', () => {
    const parts = split(doc(10, 2000), 5000);

    // Part 1 opens on the preamble; every continuation opens on a heading.
    for (const part of parts.slice(1)) {
      expect(part.startsWith('## ')).toBe(true);
    }
  });

  it('leaves an over-cap part when a single section cannot be split', () => {
    const cap = 1000;
    const body = doc(1, 5000);
    const parts = split(body, cap);

    // A `## ` section bigger than the cap has no legal split point inside it,
    // so it lands whole and over-cap. The guard in ingest_standard turns that
    // into a hard error telling the author to break the section up — it must
    // never be silently truncated, so the content still round-trips.
    expect(parts.some((p) => p.length > cap)).toBe(true);
    expect(parts.join('')).toBe(body);
  });
});
