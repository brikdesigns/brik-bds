/**
 * `lightException` mirrors `darkException` (#1742).
 *
 * `contrast-pairings.json` could only track a DARK-mode failure. A faded pairing
 * that fails in LIGHT (brand label on a brand fill at 0.5 opacity is 1.93:1)
 * therefore had two choices: fail the gate, or go unmeasured. `lightException`
 * is the third — reported, linked to its issue, not failing — and must behave
 * exactly like its dark twin: same shape, same issue-ref requirement, same
 * reporting, and scoped to ITS theme only.
 */

import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require_ = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(HERE, '..', 'validate-themes.js');
const DATASET = require_(path.join(HERE, '..', '..', 'tokens', 'contrast-pairings.json'));
const { exceptionFor } = require_(SCRIPT);

const tracked = { issue: 3016, reason: 'fails at the declared opacity' };

describe('exceptionFor — a tracked exception applies to its own theme only', () => {
  it('returns lightException in light and nothing in dark', () => {
    const p = { label: 'x', lightException: tracked };
    expect(exceptionFor(p, 'light')).toBe(tracked);
    expect(exceptionFor(p, 'dark')).toBeUndefined();
  });

  it('returns darkException in dark and nothing in light', () => {
    const p = { label: 'x', darkException: tracked };
    expect(exceptionFor(p, 'dark')).toBe(tracked);
    expect(exceptionFor(p, 'light')).toBeUndefined();
  });

  it('keeps the two independent when a pairing carries both', () => {
    const dark = { issue: 1741, reason: 'dark' };
    const p = { label: 'x', lightException: tracked, darkException: dark };
    expect(exceptionFor(p, 'light').issue).toBe(3016);
    expect(exceptionFor(p, 'dark').issue).toBe(1741);
  });
});

describe('exceptionFor — an exception without an issue ref is refused', () => {
  it.each([
    ['no issue', { reason: 'r' }],
    ['a non-numeric issue', { issue: 'soon', reason: 'r' }],
    ['no reason', { issue: 3016 }],
    ['an empty reason', { issue: 3016, reason: '  ' }],
  ])('throws on %s', (_name, bad) => {
    expect(() => exceptionFor({ label: 'x', lightException: bad }, 'light')).toThrow(/lightException/);
    expect(() => exceptionFor({ label: 'x', darkException: bad }, 'dark')).toThrow(/darkException/);
  });
});

describe('the shipped dataset', () => {
  it('every tracked exception carries an issue number and a reason', () => {
    for (const p of DATASET.pairings) {
      for (const key of ['lightException', 'darkException']) {
        if (!p[key]) continue;
        expect(Number.isInteger(p[key].issue), `${p.label} ${key}.issue`).toBe(true);
        expect(String(p[key].reason ?? '').trim(), `${p.label} ${key}.reason`).not.toBe('');
      }
    }
  });

  it('the gate reports a light exception as tracked, not as a failure', () => {
    // Redirect stdout to a FILE, not a pipe: the gate calls process.exit() right
    // after console.log, and a pipe truncates the ~100 KB JSON at 64 KiB.
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'contrast-json-')), 'out.json');
    const fd = fs.openSync(file, 'w');
    const run = spawnSync('node', [SCRIPT, '--json'], { stdio: ['ignore', fd, 'pipe'], encoding: 'utf8' });
    fs.closeSync(fd);
    // Exit 0 is the proof the gate did not fail on the light-mode rows.
    expect(run.status, run.stderr).toBe(0);
    const out = JSON.parse(fs.readFileSync(file, 'utf8'));
    const light = out.results.filter((r) => r.theme === 'light' && r.status === 'exception');
    expect(light.length).toBeGreaterThan(0);
    for (const r of light) expect(Number.isInteger(r.exception.issue)).toBe(true);
    expect(out.results.filter((r) => r.status === 'fail')).toEqual([]);
    expect(out.exceptions).toBeGreaterThanOrEqual(light.length);
  });
});
