import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(__dirname, '..', 'lint-token-self-reference.mjs');
const REPO_ROOT = join(__dirname, '..', '..');

// Hermetic: each case writes one fixture CSS in a temp dir and passes it as an
// explicit target, so nothing depends on tokens/ contents.
let dir;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'token-self-ref-'));
});

afterAll(() => rmSync(dir, { recursive: true, force: true }));

/** Run the linter over one CSS body; return { code, json }. */
function run(css) {
  const file = join(dir, 'fixture.css');
  writeFileSync(file, css);
  let code = 0;
  let stdout = '';
  try {
    stdout = execFileSync('node', [SCRIPT, '--json', file], { encoding: 'utf8' });
  } catch (err) {
    code = err.status ?? 1;
    stdout = err.stdout?.toString() ?? '';
  }
  return { code, json: JSON.parse(stdout) };
}

describe('lint-token-self-reference', () => {
  it('passes an alias that points at a different primitive', () => {
    const { code, json } = run(':root { --border-radius-md: var(--border-radius-400); }');
    expect(code).toBe(0);
    expect(json.cycles).toBe(0);
  });

  it('passes a literal value', () => {
    const { code, json } = run(':root { --box-shadow-none: none; --blur-radius-sm: 8px; }');
    expect(code).toBe(0);
    expect(json.cycles).toBe(0);
  });

  // The AC: plant a self-reference and require a non-zero exit.
  it('FAILS on a direct self-reference', () => {
    const { code, json } = run(':root { --box-shadow-md: var(--box-shadow-md); }');
    expect(code).toBe(1);
    expect(json.cycles).toBe(1);
    expect(json.findings[0].token).toBe('--box-shadow-md');
    expect(json.findings[0].direct).toBe(true);
  });

  it('FAILS on an indirect A -> B -> A cycle', () => {
    const { code, json } = run(':root { --a: var(--b); --b: var(--a); }');
    expect(code).toBe(1);
    expect(json.cycles).toBe(1);
    expect(json.findings[0].direct).toBe(false);
    expect(json.findings[0].cycle.sort()).toEqual(['--a', '--b']);
  });

  it('FAILS on the exact #1919 shape — a good value upstream, poisoned later', () => {
    // The reason this shipped: read in isolation the second block looks like
    // harmless re-aliasing. The cascade picks it, then the cycle unsets it.
    const { code, json } = run(
      ':root { --border-width-md: 3px; }\n:root { --border-width-md: var(--border-width-md); }\n',
    );
    expect(code).toBe(1);
    expect(json.findings[0].token).toBe('--border-width-md');
  });

  it('reports the line number of the poisoned declaration', () => {
    const { json } = run('/* header */\n:root {\n  --x: var(--y);\n  --y: var(--y);\n}\n');
    const y = json.findings.find((f) => f.token === '--y');
    expect(y.line).toBe(4);
  });

  it('does not flag a composite value that names itself nowhere', () => {
    const { code } = run(':root { --shadow: 0 2px var(--blur) var(--tint); }');
    expect(code).toBe(0);
  });

  it('ignores a self-reference inside a comment', () => {
    const { code, json } = run(
      ':root {\n  /* was --a: var(--a); before #1919 */\n  --a: var(--b);\n}\n',
    );
    expect(code).toBe(0);
    expect(json.cycles).toBe(0);
  });

  // gate-scanned-nothing-reports-clean: an empty parse must not read as clean.
  it('exits 2 when it parses no declarations', () => {
    const file = join(dir, 'empty.css');
    writeFileSync(file, '/* nothing here */\n');
    let code = 0;
    try {
      execFileSync('node', [SCRIPT, '--json', file], { encoding: 'utf8', stdio: 'pipe' });
    } catch (err) {
      code = err.status ?? 1;
    }
    expect(code).toBe(2);
  });

  it('the real tokens/ tree is clean', () => {
    let code = 0;
    try {
      execFileSync('node', [SCRIPT], { cwd: REPO_ROOT, encoding: 'utf8', stdio: 'pipe' });
    } catch (err) {
      code = err.status ?? 1;
    }
    expect(code).toBe(0);
  });
});
