import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

// brik-bds#2670 (ADR-043, AC3). Every Primitive / Semantic name leads with
// `--bds-`. Component CSS that still reads a bare name only works through the
// compat bridge, so lint-tokens flags it.

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const LINTER = resolve(REPO_ROOT, 'scripts', 'lint-tokens.js');

function lint(css) {
  const dir = mkdtempSync(join(tmpdir(), 'bds-unprefixed-'));
  try {
    const file = join(dir, 'Sample.css');
    writeFileSync(file, css);
    const result = spawnSync('node', [LINTER, '--json', '--css-files', file], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    });
    return JSON.parse(result.stdout).violations.filter((v) => v.rule === 'unprefixed-token');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('lint-tokens unprefixed-token rule (ADR-043)', () => {
  it('flags a bare semantic name and names the prefixed replacement', () => {
    const violations = lint('.x { color: var(--text-primary); }');
    expect(violations).toHaveLength(1);
    expect(violations[0].severity).toBe('error');
    expect(violations[0].message).toContain('--text-primary');
    expect(violations[0].message).toContain('--bds-text-primary');
  });

  it('flags a bare primitive name', () => {
    expect(lint('.x { gap: var(--space-400); }')).toHaveLength(1);
  });

  it('flags a bare name used as a var() fallback anchor', () => {
    expect(lint('.x { padding: var(--bds-card-pad, var(--padding-md)); }')).toHaveLength(1);
  });

  it('passes the prefixed spelling', () => {
    expect(lint('.x { color: var(--bds-text-primary); gap: var(--bds-space-400); }')).toHaveLength(0);
  });

  it('does not flag a component-local custom property it declares itself', () => {
    expect(lint('.x { --card-gap: 4px; margin: var(--card-gap); }')).toHaveLength(0);
  });

  it('flags the pre-rename knob spellings', () => {
    expect(lint('.x { min-width: var(--bds-text-area-min-width); }')).toHaveLength(1);
  });

  it('does not let a mistyped Primitive hide as a component knob', () => {
    const res = (css) => {
      const dir = mkdtempSync(join(tmpdir(), 'bds-unknown-'));
      try {
        const file = join(dir, 'Sample.css');
        writeFileSync(file, css);
        const r = spawnSync('node', [LINTER, '--json', '--css-files', file], { cwd: REPO_ROOT, encoding: 'utf8' });
        return JSON.parse(r.stdout).violations.filter((v) => v.rule === 'unknown-token');
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    };
    expect(res('.x { gap: var(--bds-space-99999); }')).toHaveLength(1);
    expect(res('.x { gap: var(--bds-card-gap); }')).toHaveLength(0);
  });
});
