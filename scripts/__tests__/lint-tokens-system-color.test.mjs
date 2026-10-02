import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

// brik-bds#2689. `system` colours are messaging-only; a component reads the
// Semantic (`--bds-text-error`), never `--bds-color-system-*` directly.

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const LINTER = resolve(REPO_ROOT, 'scripts', 'lint-tokens.js');

function lint(css) {
  const dir = mkdtempSync(join(tmpdir(), 'bds-system-color-'));
  try {
    const file = join(dir, 'Sample.css');
    writeFileSync(file, css);
    const result = spawnSync('node', [LINTER, '--json', '--css-files', file], { cwd: REPO_ROOT, encoding: 'utf8' });
    return JSON.parse(result.stdout).violations.filter((v) => v.rule === 'system-color-direct-read');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('lint-tokens Rule 18 (system-color-direct-read)', () => {
  it('flags a component reading --bds-color-system-red', () => {
    const v = lint('.x { color: var(--bds-color-system-red); }');
    expect(v).toHaveLength(1);
    expect(v[0].severity).toBe('error');
    expect(v[0].message).toContain('--bds-color-system-red');
  });

  it('passes the Semantic that aliases it', () => {
    expect(lint('.x { color: var(--bds-text-error); }')).toHaveLength(0);
  });

  it('does not flag the social family', () => {
    expect(lint('.x { color: var(--bds-color-social-youtube); }')).toHaveLength(0);
  });

  it('ships no component reading a system colour', () => {
    const result = spawnSync('node', [LINTER, '--json'], { cwd: REPO_ROOT, encoding: 'utf8' });
    const hits = JSON.parse(result.stdout).violations.filter((v) => v.rule === 'system-color-direct-read');
    expect(hits).toEqual([]);
  });
});
