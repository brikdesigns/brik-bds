#!/usr/bin/env node
/**
 * lint-deleted-token-consumers — fail when a PR deletes a published token name
 * that a consumer repo still references.
 *
 * `dist/tokens.css` is the org-wide allowlist, and deleting a name from it is a
 * BREAKING change for every repo that already shipped a `var()` at that name.
 * The break is silent in the worst way: per CSS Custom Properties §3, a `var()`
 * whose custom property is not defined and has no fallback makes the *whole
 * declaration* invalid at computed-value time. `border: var(--border-width-x)
 * solid` does not fall back to a default width — the border disappears.
 *
 * ── Why this gate exists (#2271) ────────────────────────────────────────────
 *
 * #2229 deleted `--border-width-{thin,standard,bold}` on the stated grounds
 * that they had zero consumers. That was true *in this repo* and false
 * downstream: two of the three had five call-sites across three brikdesigns
 * marketing routes. v0.181.0 shipped, and `.about-pillar-row` went from
 * `border-bottom: 2px solid` to `0px none`. Nothing here caught it. It was
 * caught by brikdesigns#1209's visual-regression gate, four repos away, on all
 * six `about` variants in both themes at every viewport.
 *
 * The defect was never the deletion — it was that "zero-consumer" was an
 * assertion an author made by hand, in a repo that cannot see its consumers.
 * This gate makes it a measurement.
 *
 * ── What it asserts ─────────────────────────────────────────────────────────
 *
 * For every custom-property name whose declaration this PR removes from
 * `tokens/**`, and which is consequently absent from the built
 * `dist/tokens.css`: no consumer repo may still reference it.
 *
 * The two-part test is deliberate. A name moved between `tokens/*.css` files,
 * or re-declared as a DEPRECATED alias, is still present in the built registry
 * — consumers are unaffected and the gate stays quiet. Only a name that leaves
 * `dist/tokens.css` entirely is a deletion.
 *
 * That is also how the deprecate-for-one-minor rule (#2271 AC3) is enforced
 * rather than merely documented: the sanctioned way past this gate on a
 * consumed token is to ship the old name as a deprecated alias, which by
 * construction keeps it in `dist/tokens.css`.
 *
 * ── Sibling gates, and why this is none of them ─────────────────────────────
 *   - canonical-check           → a consumer INVENTS a name BDS never shipped.
 *   - cascade-contract-check    → a consumer REDEFINES a canonical name.
 *   - lint-token-shadowing      → one name declared twice in dist, earlier dead.
 *   - lint-token-self-reference → a name defined in terms of itself, in source.
 *   - this                      → BDS REMOVES a name a consumer still uses.
 *
 * Every gate above reads one repo. This one is the only gate in brik-bds that
 * reads the consumers, which is why it needs a cross-repo token.
 *
 * ── CLI ─────────────────────────────────────────────────────────────────────
 *   node scripts/lint-deleted-token-consumers.mjs --base <ref> [--head <ref>]
 *   node scripts/lint-deleted-token-consumers.mjs --base main --local
 *   node scripts/lint-deleted-token-consumers.mjs --base main --json
 *   node scripts/lint-deleted-token-consumers.mjs --base main \
 *     --consumer brikdesigns/brik-client-portal@staging
 *
 * `--local` greps existing checkouts under the Github group dirs instead of
 * cloning — the dev path. CI clones, because a runner has no checkouts.
 *
 * `--consumer owner/repo[@branch]` (repeatable) REPLACES the default consumer
 * set with the ones named — a scoped sweep, and what the test suite uses to
 * stay hermetic.
 *
 * Exit 0 = no deleted name is consumed (including: nothing was deleted).
 * Exit 1 = a deleted name is still referenced downstream.
 * Exit 2 = the check itself could not run.
 *
 * Exit 2 is load-bearing. A sweep that reached zero consumer repos must never
 * read as "no consumers affected" — that is the exact shape of the failure this
 * gate exists to prevent, reintroduced one level up. An unreachable consumer is
 * an error, never a pass.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

/**
 * Repos that declare `@brikdesigns/bds`, measured 2026-09-09 by reading each
 * default branch's package.json. Version shown is what that repo pinned then;
 * it is context for the reader, not something this script checks.
 *
 * Retired repos (renew-pms, freedom-client-portal) are absent on purpose —
 * canonical list: brik-llm/operations/retired-repos.txt. Sites with no BDS
 * dependency (treehouse-pediatric-dentistry, memphis-dental,
 * seniorhomeessentials) are absent for the same reason: nothing to break.
 *
 * A client site pinned to an old minor still belongs here. The break does not
 * land when BDS deletes the name, it lands when that site bumps — and by then
 * the deletion is many releases back and nobody connects the two. That is the
 * #2271 timeline exactly.
 */
const CONSUMERS = [
  { repo: 'brikdesigns/brikdesigns', branch: 'staging' }, // bds 0.187.0
  { repo: 'brikdesigns/brik-client-portal', branch: 'staging' }, // bds ^0.187.0
  { repo: 'brikdesigns/tncld', branch: 'main' }, // bds ^0.158.0
  { repo: 'brikdesigns/vale-partners', branch: 'main' }, // bds ^0.129.0
  { repo: 'brikdesigns/birdwell-mutlak', branch: 'main' }, // bds ^0.58.0
];

/** Where a token declaration can live. Mirrors build-dist-tokens.js's inputs. */
const TOKEN_SOURCE_PATHSPEC = 'tokens';

/** Extensions a `var(--x)` reference can appear in. */
const CONSUMER_GLOBS = ['*.css', '*.scss', '*.ts', '*.tsx', '*.js', '*.jsx', '*.astro', '*.mdx', '*.html'];

const DIST_TOKENS = 'dist/tokens.css';

// ─── Arg parsing ─────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const opts = { base: '', head: 'HEAD', local: false, json: false, consumers: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--base') opts.base = argv[++i] ?? '';
    else if (a === '--head') opts.head = argv[++i] ?? 'HEAD';
    else if (a === '--local') opts.local = true;
    else if (a === '--json') opts.json = true;
    else if (a === '--consumer') {
      const spec = argv[++i] ?? '';
      const m = /^([^/]+\/[^@]+)(?:@(.+))?$/.exec(spec);
      if (!m) die(2, `--consumer expects owner/repo[@branch], got: ${spec || '(nothing)'}`);
      opts.consumers.push({ repo: m[1], branch: m[2] || 'main' });
    } else die(2, `unknown argument: ${a}`);
  }
  if (!opts.base) die(2, 'missing required --base <ref>');
  // An explicit --consumer REPLACES the default set rather than adding to it,
  // so a scoped sweep ("just the portal") is one flag. The exit-2 completeness
  // check below then measures against what was asked for, not the constant.
  if (opts.consumers.length === 0) opts.consumers = CONSUMERS;
  return opts;
}

function die(code, msg) {
  console.error(`✗ lint-deleted-token-consumers: ${msg}`);
  process.exit(code);
}

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
}

// ─── Step 1 — names this diff removed from tokens/ ───────────────────────────

/**
 * A removed declaration is a `-` line opening `--name:` at the start of a
 * declaration. Anchoring on the colon keeps `var(--name)` *usages* out: this
 * step is about a name ceasing to be DEFINED, not ceasing to be referenced.
 */
function removedTokenNames(base, head) {
  let diff;
  try {
    diff = run('git', ['diff', '--unified=0', `${base}`, `${head}`, '--', TOKEN_SOURCE_PATHSPEC]);
  } catch (err) {
    die(2, `git diff ${base}..${head} -- ${TOKEN_SOURCE_PATHSPEC} failed: ${err.stderr?.toString().trim() || err.message}`);
  }
  const names = new Set();
  for (const line of diff.split('\n')) {
    if (!line.startsWith('-') || line.startsWith('---')) continue;
    const m = /^-\s*(--[A-Za-z0-9_-]+)\s*:/.exec(line);
    if (m) names.add(m[1]);
  }
  return names;
}

// ─── Step 2 — of those, which left the built registry ────────────────────────

function namesInDist() {
  if (!fs.existsSync(DIST_TOKENS)) {
    die(2, `${DIST_TOKENS} not found — run \`npm run build:dist-tokens\` before this gate`);
  }
  const css = fs.readFileSync(DIST_TOKENS, 'utf8');
  const names = new Set();
  for (const m of css.matchAll(/(^|[;{\s])(--[A-Za-z0-9_-]+)\s*:/g)) names.add(m[2]);
  if (names.size === 0) {
    die(2, `${DIST_TOKENS} parsed to zero declarations — refusing to report clean`);
  }
  return names;
}

// ─── Step 3 — sweep the consumers ────────────────────────────────────────────

/**
 * Find a consumer's local checkout, for `--local`.
 *
 * Two things make this more than `path.resolve('..', short)`:
 *
 *  1. Task work runs in `brik-bds-worktrees/{slug}/`, so `..` is the worktrees
 *     directory, not the repo group. `--git-common-dir` resolves to the PRIMARY
 *     `.git` even from a linked worktree, which sidesteps that entirely.
 *  2. Checkouts are grouped by kind, not flat — `Github/brik/`, `Github/product/`,
 *     `Github/web/`. brik-bds is under `brik/` and brik-client-portal under
 *     `product/`, so no single parent holds them both.
 *
 * So: walk up to the Github root and look for the repo in each group.
 */
let _groupRoot;
function localCheckout(short) {
  if (!_groupRoot) {
    const commonDir = run('git', ['rev-parse', '--path-format=absolute', '--git-common-dir']).trim();
    // …/Github/brik/brik-bds/.git → …/Github
    _groupRoot = path.dirname(path.dirname(path.dirname(commonDir)));
  }
  const groups = fs
    .readdirSync(_groupRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  for (const g of groups) {
    const dir = path.join(_groupRoot, g, short);
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
  }
  throw new Error(`no checkout of ${short} under ${_groupRoot}/*/ (--local)`);
}

/**
 * Returns the directory to grep for a consumer, cloning when not local.
 * Throws rather than returning null: an unreachable consumer must reach the
 * exit-2 path, never be quietly skipped.
 */
function consumerCheckout(consumer, { local, tmpRoot }) {
  const short = consumer.repo.split('/')[1];
  if (local) return localCheckout(short);
  const dir = path.join(tmpRoot, short);
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GH_TOKEN is unset — a cross-repo read needs CONSUMER_DRIFT_TOKEN');
  const url = `https://x-access-token:${token}@github.com/${consumer.repo}.git`;
  run('git', ['clone', '--depth', '1', '--single-branch', '--branch', consumer.branch, '--quiet', url, dir]);
  return dir;
}

/**
 * Every reference to `name` in `dir`, as `relpath:line` strings.
 *
 * `git grep`, not `grep -r`, for two reasons. It searches only TRACKED files,
 * so a stale `node_modules/@brikdesigns/bds` in a consumer checkout cannot
 * report BDS's own definitions back as consumer usage — that false positive
 * would fire on every run. And its flags are the same on macOS and Linux;
 * BSD grep rejects `--no-color`, so the dev path and the CI path would have
 * diverged.
 */
function referencesIn(dir, name) {
  // `-e` is required, not stylistic: every token name starts with `--`, so a
  // bare pattern is parsed as an unknown long option and the search never runs.
  const args = ['grep', '--no-color', '-n', '-F', '-I', '-e', name, '--', ...CONSUMER_GLOBS];
  let out = '';
  try {
    out = run('git', args, { cwd: dir, maxBuffer: 32 * 1024 * 1024 });
  } catch (err) {
    // git grep exits 1 on "no match" — the clean case, not a failure.
    if (err.status === 1) return [];
    throw new Error(`git grep failed in ${dir}: ${err.stderr?.toString().trim() || err.message}`);
  }
  // A token name is a prefix of longer names (`--border-width-1` of
  // `--border-width-100`), so the fixed-string match above over-matches.
  // Require a non-name character (or EOL) after it. Token names are
  // `--[A-Za-z0-9_-]+`, so no character in one is a regex metacharacter.
  const bounded = new RegExp(`${name}(?![A-Za-z0-9_-])`);
  return out
    .split('\n')
    .filter(Boolean)
    .filter((l) => bounded.test(l))
    .map((l) => l.replace(/^\.\//, ''));
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const opts = parseArgs(process.argv.slice(2));

  const removed = removedTokenNames(opts.base, opts.head);
  if (removed.size === 0) {
    report(opts, { deleted: [], findings: [], swept: [], removedFromSource: 0 });
    return 0;
  }

  const dist = namesInDist();
  const deleted = [...removed].filter((n) => !dist.has(n)).sort();

  if (deleted.length === 0) {
    report(opts, { deleted: [], findings: [], swept: [], removedFromSource: removed.size });
    return 0;
  }

  const tmpRoot = opts.local ? '' : fs.mkdtempSync(path.join(os.tmpdir(), 'bds-consumer-sweep-'));
  const findings = [];
  const swept = [];
  try {
    for (const consumer of opts.consumers) {
      let dir;
      try {
        dir = consumerCheckout(consumer, { local: opts.local, tmpRoot });
      } catch (err) {
        die(2, `could not reach ${consumer.repo}: ${err.message}`);
      }
      swept.push(consumer.repo);
      for (const name of deleted) {
        let hits;
        try {
          hits = referencesIn(dir, name);
        } catch (err) {
          // A search that failed is not a search that found nothing.
          die(2, `${consumer.repo}: ${err.message}`);
        }
        for (const hit of hits) findings.push({ repo: consumer.repo, token: name, at: hit });
      }
    }
  } finally {
    if (tmpRoot) fs.rmSync(tmpRoot, { recursive: true, force: true });
  }

  if (swept.length !== opts.consumers.length) {
    die(2, `swept ${swept.length}/${opts.consumers.length} consumers — refusing to report clean`);
  }

  report(opts, { deleted, findings, swept, removedFromSource: removed.size });
  return findings.length > 0 ? 1 : 0;
}

function report(opts, result) {
  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  const { deleted, findings, swept, removedFromSource } = result;

  if (deleted.length === 0) {
    const note =
      removedFromSource > 0
        ? `${removedFromSource} declaration(s) left tokens/, all still present in ${DIST_TOKENS} (moved or deprecated-aliased)`
        : `no token declaration removed in ${opts.base}..${opts.head}`;
    console.log(`✓ no published token name was deleted — ${note}.`);
    return;
  }

  console.log(`Deleted from ${DIST_TOKENS}: ${deleted.join(', ')}`);
  console.log(`Swept ${swept.length} consumer repo(s): ${swept.join(', ')}\n`);

  if (findings.length === 0) {
    console.log(`✓ no consumer references ${deleted.length === 1 ? 'it' : 'them'}. Deletion is safe.`);
    return;
  }

  console.error(`✗ ${findings.length} live consumer reference(s) to ${deleted.length} deleted token name(s):\n`);
  for (const f of findings) console.error(`    ${f.token}  ${f.repo}  ${f.at}`);
  console.error(`
A var() at a name that no longer exists invalidates the whole declaration —
the property is unset, not defaulted. Shipping this deletes those styles.

Two sanctioned ways forward:
  1. Keep the name in ${DIST_TOKENS} as a DEPRECATED alias for one minor, then
     delete it after the consumers above have migrated.
  2. Land the consumer-side migration FIRST, then delete here.
`);
}

process.exit(main());
