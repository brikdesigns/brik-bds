/**
 * Proof that lint-token-shadowing actually fails.
 *
 * `assertions-must-be-proven-to-fail`: an assertion that has never failed is
 * decoration. These cases plant a shadow, confirm non-zero, remove it, confirm
 * zero — the sabotage step the gate's own AC requires, wired so it re-runs on
 * every change instead of living in one session's shell history.
 *
 * Two of these were written because the hand-run sabotage caught real bugs:
 *   - `no trailing newline` — the block regex keyed `}:root` as a scope
 *     distinct from `:root`, hiding any shadow appended to a file that did not
 *     end in a newline.
 *   - `fixture must be valid` — the first sabotage attempt used a token that is
 *     not declared anywhere, so it created no shadow and the gate correctly
 *     passed. A green run against an invalid fixture proves nothing.
 */

import { describe, it, expect } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GATE = path.join(HERE, '..', 'lint-token-shadowing.mjs');

/** Run the gate over `css`; return { code, out }. */
function run(css, { trailingNewline = true } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'token-shadow-'));
  const file = path.join(dir, 'tokens.css');
  fs.writeFileSync(file, trailingNewline ? css : css.replace(/\n+$/, ''));
  try {
    // The gate reports progress + findings on stderr (stderr-for-progress, per
    // brik-script-standards), so stdout alone is empty on a passing run.
    const res = spawnSync('node', [GATE, file], { encoding: 'utf8' });
    if (res.error) throw res.error;
    return { code: res.status, out: `${res.stdout ?? ''}${res.stderr ?? ''}` };
  } catch (err) {
    return { code: err.status, out: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const CLEAN = `:root {
  --text-primary: #111;
  --spacing-md: 16px;
}
`;

describe('lint-token-shadowing', () => {
  it('passes a registry with no shadowed tokens', () => {
    const { code } = run(CLEAN);
    expect(code).toBe(0);
  });

  it('FAILS when a token is redeclared in the same scope with a different value', () => {
    const { code, out } = run(`${CLEAN}:root {\n  --text-primary: #222;\n}\n`);
    expect(code).toBe(1);
    expect(out).toContain('--text-primary');
    expect(out).toContain('UNDISPOSED');
  });

  it('passes when the winning declaration carries a bds-lint-ignore reason', () => {
    const { code } = run(`${CLEAN}:root {\n  --text-primary: #222; /* bds-lint-ignore — deliberate */\n}\n`);
    expect(code).toBe(0);
  });

  it('still FAILS when the file has no trailing newline', () => {
    // Regression: the block regex once keyed this second block as `}:root`,
    // a phantom scope, so the shadow was never compared against `:root`.
    const { code } = run(`${CLEAN}:root {\n  --text-primary: #222;\n}\n`, { trailingNewline: false });
    expect(code).toBe(1);
  });

  it('does NOT flag the same value declared twice', () => {
    const { code } = run(`${CLEAN}:root {\n  --text-primary: #111;\n}\n`);
    expect(code).toBe(0);
  });

  it('does NOT flag a declaration inside @media, which is conditional', () => {
    const { code } = run(`${CLEAN}@media (prefers-reduced-motion: reduce) {\n  :root {\n    --text-primary: #333;\n  }\n}\n`);
    expect(code).toBe(0);
  });

  it('does NOT flag the same token in two DIFFERENT scopes', () => {
    const { code } = run(`${CLEAN}:root[data-theme="dark"] {\n  --text-primary: #eee;\n}\n`);
    expect(code).toBe(0);
  });

  it('exits 2 — not 0 — when the scan parses nothing', () => {
    // A broken scan must never read as clean (gate-scanned-nothing-reports-clean).
    const { code, out } = run('/* no rules at all */\n');
    expect(code).toBe(2);
    expect(out).toContain('SCAN FAILED');
  });

  it('exits 2 when the target file is missing', () => {
    let code = 0;
    try {
      execFileSync('node', [GATE, path.join(os.tmpdir(), 'definitely-not-here.css')], { stdio: 'pipe' });
    } catch (err) {
      code = err.status;
    }
    expect(code).toBe(2);
  });

  it('reports the denominator it scanned', () => {
    const { out } = run(CLEAN);
    expect(out).toMatch(/1 scope\(s\), 2 declaration\(s\) checked/);
  });
});
