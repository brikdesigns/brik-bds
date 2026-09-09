import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(__dirname, '..', 'lint-deleted-token-consumers.mjs');

// Hermetic. The script reads a git diff, a built dist/tokens.css, and a
// consumer checkout — so the fixture is three real git repos in a temp tree,
// not a mocked filesystem. `--consumer` scopes the sweep to the fake consumer
// so no test ever touches the network or a real Brik repo.
//
// Layout mirrors the real one on purpose: the script walks THREE levels up from
// `.git` to find the group root (Github/brik/brik-bds/.git → Github), so a
// flatter fixture would exercise a different code path than production.
//
//   <tmp>/gh/brik/bds/          ← the "BDS" repo, cwd for every run
//   <tmp>/gh/product/consumer/  ← the "consumer" repo
let root;
let bds;
let consumer;

// `core.hooksPath` is set globally by husky, so a fixture repo created inside
// this checkout inherits brik-bds's own pre-commit chain — gitleaks, tsc, the
// anti-slop scan — on every fixture commit. That is minutes of work per test
// and has nothing to do with what is under test. Pin it off per-invocation
// (and HUSKY=0 for the hooks that self-install) rather than mutating any
// global config.
function git(args, cwd) {
  execFileSync('git', ['-c', 'core.hooksPath=/dev/null', ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, HUSKY: '0' },
  });
}

/** Write dist/tokens.css and tokens/gap-fills.css, then commit. */
function commitTokens({ source, dist, message }) {
  writeFileSync(join(bds, 'tokens', 'gap-fills.css'), source);
  writeFileSync(join(bds, 'dist', 'tokens.css'), dist);
  git(['add', '-A'], bds);
  git(['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', message], bds);
}

function run(extraArgs = [], base = 'base') {
  const args = [SCRIPT, '--base', base, '--json', '--local', '--consumer', 'fake/consumer@main', ...extraArgs];
  let code = 0;
  let stdout = '';
  let stderr = '';
  try {
    stdout = execFileSync('node', args, { cwd: bds, encoding: 'utf8' });
  } catch (err) {
    code = err.status ?? 1;
    stdout = err.stdout?.toString() ?? '';
    stderr = err.stderr?.toString() ?? '';
  }
  let json = null;
  try {
    json = JSON.parse(stdout);
  } catch {
    /* exit-2 paths print a message, not JSON */
  }
  return { code, json, stderr };
}

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'deleted-token-consumers-'));

  bds = join(root, 'gh', 'brik', 'bds');
  mkdirSync(join(bds, 'tokens'), { recursive: true });
  mkdirSync(join(bds, 'dist'), { recursive: true });
  git(['init', '-q', '-b', 'main'], bds);
  // dist/ is gitignored in the real repo; the script reads it off disk, not git.
  writeFileSync(join(bds, '.gitignore'), 'dist/\n');

  commitTokens({
    source: ':root {\n  --measure-md: 60ch;\n  --measure-lg: 72ch;\n}\n',
    dist: ':root {\n  --measure-md: 60ch;\n  --measure-lg: 72ch;\n}\n',
    message: 'base',
  });
  git(['branch', 'base'], bds);

  consumer = join(root, 'gh', 'product', 'consumer');
  mkdirSync(join(consumer, 'src'), { recursive: true });
  git(['init', '-q', '-b', 'main'], consumer);
  writeFileSync(join(consumer, 'src', 'page.css'), '.hero { max-width: var(--measure-md); }\n');
  // Untracked files are invisible to `git grep`, which is the point — a stale
  // node_modules copy of BDS must never read as consumer usage.
  writeFileSync(join(consumer, 'src', 'untracked.css'), '.x { width: var(--measure-lg); }\n');
  git(['add', 'src/page.css'], consumer);
  git(['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'consumer'], consumer);
});

afterAll(() => rmSync(root, { recursive: true, force: true }));

// Each case forks `node` and runs several real git commands against the
// fixture repos, so the 5s default is not enough on a loaded machine.
describe('lint-deleted-token-consumers', { timeout: 30_000 }, () => {
  it('passes when the diff removes no declaration', () => {
    commitTokens({
      source: ':root {\n  --measure-md: 60ch;\n  --measure-lg: 72ch;\n  --measure-sm: 44ch;\n}\n',
      dist: ':root {\n  --measure-md: 60ch;\n  --measure-lg: 72ch;\n  --measure-sm: 44ch;\n}\n',
      message: 'add a token',
    });
    const { code, json } = run();
    expect(code).toBe(0);
    expect(json.deleted).toEqual([]);
    expect(json.findings).toEqual([]);
  });

  // The AC: the #2271 shape. Delete a name a consumer still uses.
  it('fails when a deleted name is still referenced downstream', () => {
    commitTokens({
      source: ':root {\n  --measure-lg: 72ch;\n}\n',
      dist: ':root {\n  --measure-lg: 72ch;\n}\n',
      message: 'delete --measure-md',
    });
    const { code, json } = run();
    expect(code).toBe(1);
    expect(json.deleted).toEqual(['--measure-md']);
    expect(json.findings).toHaveLength(1);
    expect(json.findings[0]).toMatchObject({ repo: 'fake/consumer', token: '--measure-md' });
    expect(json.findings[0].at).toContain('src/page.css');
  });

  it('passes when the deleted name ships on as a deprecated alias', () => {
    commitTokens({
      source: ':root {\n  --measure-lg: 72ch;\n  --measure-md: var(--measure-lg); /* DEPRECATED */\n}\n',
      dist: ':root {\n  --measure-lg: 72ch;\n  --measure-md: var(--measure-lg);\n}\n',
      message: 'deprecate rather than delete',
    });
    const { code, json } = run();
    expect(code).toBe(0);
    expect(json.deleted).toEqual([]);
  });

  it('passes when a declaration only MOVES between token files', () => {
    // Removed from gap-fills.css, still in the built registry.
    commitTokens({
      source: ':root {\n  --measure-lg: 72ch;\n}\n',
      dist: ':root {\n  --measure-lg: 72ch;\n  --measure-md: 60ch;\n}\n',
      message: 'move --measure-md to another source file',
    });
    const { code, json } = run();
    expect(code).toBe(0);
    expect(json.deleted).toEqual([]);
  });

  it('does not treat a longer name as a reference to its prefix', () => {
    // `--measure` is a prefix of `--measure-md`; a fixed-string grep matches
    // both, so the boundary filter is what keeps this from a false positive.
    commitTokens({
      source: ':root {\n  --measure-md: 60ch;\n  --measure-lg: 72ch;\n}\n',
      dist: ':root {\n  --measure-md: 60ch;\n  --measure-lg: 72ch;\n}\n',
      message: 'restore',
    });
    commitTokens({
      source: ':root {\n  --measure-md: 60ch;\n  --measure-lg: 72ch;\n  --measure: 50ch;\n}\n',
      dist: ':root {\n  --measure-md: 60ch;\n  --measure-lg: 72ch;\n  --measure: 50ch;\n}\n',
      message: 'add the prefix name',
    });
    commitTokens({
      source: ':root {\n  --measure-md: 60ch;\n  --measure-lg: 72ch;\n}\n',
      dist: ':root {\n  --measure-md: 60ch;\n  --measure-lg: 72ch;\n}\n',
      message: 'delete the prefix name only',
    });
    // Diff the last commit, not the whole branch: `--measure` was added and
    // removed within this test, so against `base` the net change is nothing.
    const { code, json } = run([], 'HEAD~1');
    expect(json.deleted).toEqual(['--measure']);
    // The consumer uses --measure-md, never --measure. No finding, exit 0.
    expect(json.findings).toEqual([]);
    expect(code).toBe(0);
  });

  // The gate-scanned-nothing-reports-clean guard: an unreachable consumer is an
  // error, never a pass. Without this the sweep degrades to the hand-assertion
  // it replaced.
  it('exits 2 rather than clean when a consumer cannot be reached', () => {
    commitTokens({
      source: ':root {\n  --measure-lg: 72ch;\n}\n',
      dist: ':root {\n  --measure-lg: 72ch;\n}\n',
      message: 'delete --measure-md again',
    });
    const { code, stderr } = run(['--consumer', 'fake/does-not-exist@main']);
    expect(code).toBe(2);
    expect(stderr).toMatch(/could not reach fake\/does-not-exist/);
  });

  it('exits 2 when dist/tokens.css parses to nothing', () => {
    commitTokens({ source: ':root {\n}\n', dist: '/* empty */\n', message: 'empty dist' });
    const { code, stderr } = run();
    expect(code).toBe(2);
    expect(stderr).toMatch(/zero declarations/);
  });
});
