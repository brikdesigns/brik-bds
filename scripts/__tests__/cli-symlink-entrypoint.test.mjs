import { describe, it, expect, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// npm's `bin` mechanism always invokes a published CLI through a
// node_modules/.bin symlink, never by a direct `node scripts/*.mjs` call.
// Node's ESM loader resolves symlinks for import.meta.url but not for
// argv[1], so a naive entry-point check (comparing the two unresolved) is
// always false on that path and main() silently never runs — a `--check`
// gate wired to the published bin passes while doing nothing (brik-bds#2663).
// This reproduces the real invocation shape rather than the direct call
// every other test in this directory uses.

const SCRIPTS_DIR = fileURLToPath(new URL('..', import.meta.url));

const tmpDirs = [];
function runThroughSymlink(scriptName, args) {
  const binDir = mkdtempSync(join(tmpdir(), 'cli-symlink-test-'));
  tmpDirs.push(binDir);
  const link = join(binDir, scriptName);
  symlinkSync(join(SCRIPTS_DIR, scriptName), link);
  return execFileSync('node', [link, ...args], { encoding: 'utf8' });
}

afterEach(() => {
  while (tmpDirs.length) rmSync(tmpDirs.pop(), { recursive: true, force: true });
});

describe('CLI entry-point detection through an npm-style bin symlink', () => {
  it('gen-icon-collection --help runs main() and prints usage', () => {
    const stdout = runThroughSymlink('gen-icon-collection.mjs', ['--help']);
    expect(stdout).toContain('gen-icon-collection — curated offline Phosphor subset');
  });

  it('lint-icon-weight-parity --help runs main() and prints usage', () => {
    const stdout = runThroughSymlink('lint-icon-weight-parity.mjs', ['--help']);
    expect(stdout).toContain('lint-icon-weight-parity — bundled-collection coverage');
  });

  // brik-bds#2732: three more bins had the same compare. Each printed 0 bytes and
  // exited 0 through a symlink, so a gate wired to the bin passed having checked
  // nothing. A non-empty usage text is the proof main() ran; an empty one fails.
  it.each([
    ['cascade-contract-check.mjs', 'cascade-contract-check — enforce the BDS token adoption contract'],
    ['canonical-check.mjs', 'canonical-check — Canonical token-name enforcement'],
    ['canonical-class-check.mjs', 'canonical-class-check — Canonical CSS-class enforcement'],
  ])('%s --help runs main() and prints usage', (bin, usage) => {
    const stdout = runThroughSymlink(bin, ['--help']);
    expect(stdout.length).toBeGreaterThan(0);
    expect(stdout).toContain(usage);
  });
});
