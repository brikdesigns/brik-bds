#!/usr/bin/env node
/**
 * lint-test-git-env.mjs — every bash test must unset the inherited git
 * environment, and must sandbox-assert before it writes a git identity.
 *
 * brik-llm#1672, enforcing the lesson from #1539.
 * brik-llm#3155 (parent #1861) added the identity-write rule below; #3156 then
 * adopted it across all 14 pre-existing fixtures, so it now applies to
 * scripts/test/ unconditionally rather than to everything off a ratchet list.
 *
 * `git -C "$FIXTURE"` does NOT isolate a test. `-C` only changes directory, and
 * GIT_DIR overrides directory discovery — so a test invoked from a git hook (git
 * exports GIT_DIR to every hook) drives all of its fixture `git` calls against
 * the LIVE repository. Wiring test-overlap-filters.sh into pre-push proved it:
 * `git init --bare` set core.bare=true on the live repo, a fixture commit landed
 * on the checked-out task branch and orphaned its real commit, `main` moved to a
 * tree that deleted the repository, and two fixture refs were pushed to GitHub.
 * Recoverable only because `main` on the remote happened not to move.
 *
 * Both bash tests carry the unset today; nothing required it, and the gate slices
 * under brikdesigns/brik-llm#1485 keep adding tests to scripts/test/ wired
 * into validate-all.js — which IS the pre-push path that fired the incident.
 *
 * A static read, deliberately: this check must not run the tests it inspects, so
 * it can never touch a repository itself.
 *
 * The second rule is the same shape one rung down. `unset GIT_DIR` keeps a
 * fixture's `git -C "$FIXTURE"` calls pointed at the fixture; it does not prove
 * the fixture path is a throwaway. `git -C "" config user.email` is a no-op on
 * the path argument and writes to whatever repo is current, and a leaked git env
 * makes a correct `-C` argument resolve elsewhere. `assert_throwaway_repo`
 * (scripts/lib/identity-guard.sh, #1841) closes both by checking the RESOLVED
 * git-dir — so an identity write with no prior call to it is unguarded.
 *
 * Usage:
 *   node scripts/lint-test-git-env.mjs                 # exit 1 on any violation
 *   node scripts/lint-test-git-env.mjs <dir>           # lint another directory
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The variables that redirect git away from the directory a test thinks it is
 * operating on. GIT_DIR and GIT_WORK_TREE are the dangerous pair; the rest can
 * still retarget objects, the index, or the ref namespace, and a test that
 * unsets only the famous two is one exported variable away from the incident.
 */
export const GIT_ENV_VARS = [
  'GIT_DIR',
  'GIT_WORK_TREE',
  'GIT_INDEX_FILE',
  'GIT_COMMON_DIR',
  'GIT_NAMESPACE',
  'GIT_OBJECT_DIRECTORY',
  'GIT_ALTERNATE_OBJECT_DIRECTORIES',
];

/**
 * Which required variables a script fails to unset. Pure — exported for the test.
 *
 * Matches `unset` statements only, allowing them to span lines with a trailing
 * backslash (how the existing tests are written). A mention of the variable name
 * anywhere else does not count: the header comments of these very tests discuss
 * GIT_DIR at length, so a naive substring search would pass a file that only
 * talks about the problem.
 *
 * @param {string} source
 * @returns {string[]} missing variable names, in canonical order
 */
export function missingGitEnvUnsets(source) {
  const unset = new Set();

  // Join continuation lines, then take each `unset ...` statement's arguments.
  const joined = String(source ?? '').replace(/\\\r?\n/g, ' ');
  for (const line of joined.split(/\r?\n/)) {
    const stripped = line.replace(/#.*$/, '').trim();
    const m = /^unset\s+(-[fv]\s+)?(.*)$/.exec(stripped);
    if (!m) continue;
    for (const token of m[2].split(/\s+/)) {
      if (token) unset.add(token.replace(/[;&|].*$/, ''));
    }
  }

  return GIT_ENV_VARS.filter((v) => !unset.has(v));
}

/**
 * Fixtures the guard cannot apply to, permanently.
 *
 * #3155 shipped alongside a second registry, `KNOWN_UNGUARDED`, holding the 14
 * fixtures that pre-dated the guard; #3156 adopted all 14 and deleted it, so
 * the rule now applies unconditionally to everything except the entries here.
 *
 * Empty is the expected size. An entry is a claim that `assert_throwaway_repo`
 * would be WRONG in the file, not merely absent — so it needs the reason, and
 * it is NOT a parking space for a fixture nobody has got round to guarding.
 */
export const GUARD_INAPPLICABLE = {
  'test-identity-guard.sh':
    'writes identity into $HOME/.brik-identity-guard-outside-$$ ON PURPOSE (:55) — ' +
    'check_commit_identity stays quiet inside a throwaway repo, so the out-of-sandbox ' +
    'repo IS the subject. assert_throwaway_repo would refuse it and delete the coverage.',
};

/**
 * Split a comment-stripped line into its statements, so a write and a guard
 * sharing one line are read in the order they execute.
 *
 * Crude on purpose, matching missingGitEnvUnsets above: a `;` inside a quoted
 * string would split early. That can only invent an extra statement boundary,
 * never hide one, so it cannot turn a violation into a pass.
 */
function statementsOf(line) {
  return line
    .replace(/#.*$/, '')
    .split(/;|&&|\|\||\|/)
    .map((s) => s.replace(/^[\s({]+/, '').trim())
    .filter(Boolean);
}

/**
 * Identity writes that execute before any `assert_throwaway_repo` call. Pure —
 * exported for the test.
 *
 * Keys on the WRITE, not on a substring. A file that only mentions the guard in
 * a comment is unguarded (comments are stripped), and a file with no identity
 * write is never required to call it — the same contract missingGitEnvUnsets
 * holds, and for the same reason: every compliant fixture here discusses the
 * hazard in its header.
 *
 * Both real command shapes are covered, plus the bare one:
 *   git -C "$D" config user.email …    the common form
 *   g -C "$D" config user.name …       the g() wrapper (test-sweep-*)
 *   g "$d" config user.email …         the g() wrapper's path-first form
 *   git config user.email …            bare, inside a `cd "$D"` subshell
 *
 * Textual order is what a static read can see: a guard called at runtime before
 * a write that appears earlier in the file reads as unguarded here. That is the
 * conservative direction, and no fixture in this repo has that shape.
 *
 * @param {string} source
 * @returns {{line: number, statement: string}[]} unguarded write sites, in file order
 */
export function unguardedIdentityWrites(source) {
  // The optional middle is ONE path argument, not "any tokens" — a loose
  // `(\s+\S+)*?` also matches `git commit -m "… config user.email …"`, and a
  // rule that fires on prose about itself is a rule people delete.
  const IDENTITY_WRITE =
    /^(?:git|g)(?:\s+-C\s+\S+|\s+"[^"]*"|\s+\$\{?[A-Za-z_]\S*)?\s+config\s+(?:--\S+\s+)*user\.(?:email|name)\b/;
  const lines = String(source ?? '').split(/\r?\n/);
  const sites = [];
  let guarded = false;

  for (let i = 0; i < lines.length; i += 1) {
    for (const statement of statementsOf(lines[i])) {
      if (/^assert_throwaway_repo\b/.test(statement)) {
        guarded = true;
        continue;
      }
      if (!guarded && IDENTITY_WRITE.test(statement)) {
        sites.push({ line: i + 1, statement });
      }
    }
  }

  return sites;
}

/**
 * GUARD_INAPPLICABLE entries that no longer describe the tree: a listed file
 * that is gone, or one that has adopted the guard and should have been
 * de-listed with it.
 *
 * It outlived KNOWN_UNGUARDED on purpose. The permanent list needs the stale
 * check MORE than the temporary one did — nothing else will ever come back to
 * it, so without this an entry survives the file it describes and reads as a
 * live exemption forever.
 *
 * `strict` is false when linting a directory other than the repo's own
 * scripts/test — the gate's contract suite points it at temp dirs holding one
 * file, where a listed file being absent is the expected state, not rot.
 *
 * @param {Set<string>} present  .sh basenames found in the linted directory
 * @param {Set<string>} clean    basenames with no unguarded write
 * @param {boolean} strict
 * @returns {{file: string, why: string}[]}
 */
export function reconcileRegistry(present, clean, strict) {
  const stale = [];
  for (const file of Object.keys(GUARD_INAPPLICABLE)) {
    if (!present.has(file)) {
      if (strict) stale.push({ file, why: 'listed but not in the directory' });
    } else if (clean.has(file)) {
      stale.push({ file, why: 'listed but now calls the guard — de-list it' });
    }
  }
  return stale;
}

function main() {
  const dir = process.argv[2] || 'scripts/test';

  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    console.log(`⚠  ${dir} does not exist — nothing to lint.`);
    return 0;
  }

  const scripts = entries.filter((f) => f.endsWith('.sh')).sort();
  if (scripts.length === 0) {
    console.log(`⚠  No bash tests in ${dir} — nothing to lint.`);
    return 0;
  }

  const violations = [];
  const unguarded = [];
  const present = new Set();
  const clean = new Set();

  for (const file of scripts) {
    const path = join(dir, file);
    if (!statSync(path).isFile()) continue;
    present.add(file);

    const source = readFileSync(path, 'utf8');

    const missing = missingGitEnvUnsets(source);
    if (missing.length) violations.push({ path, missing });

    const sites = unguardedIdentityWrites(source);
    if (sites.length === 0) clean.add(file);
    else if (!(file in GUARD_INAPPLICABLE)) unguarded.push({ path, sites });
  }

  // Strict only for the repo's own directory: the gate's contract suite points
  // it at temp dirs holding a single file, where a listed file being absent is
  // the expected state rather than registry rot.
  const stale = reconcileRegistry(present, clean, !process.argv[2]);

  if (violations.length === 0 && unguarded.length === 0 && stale.length === 0) {
    console.log(
      `✓ ${scripts.length} bash test(s) in ${dir} unset the git environment ` +
        'and sandbox-assert before writing a git identity.',
    );
    const inapplicable = Object.keys(GUARD_INAPPLICABLE).filter((f) => present.has(f)).length;
    if (inapplicable) console.log(`  ${inapplicable} fixture(s) where the guard cannot apply.`);
    return 0;
  }

  if (violations.length) {
    console.error(`✗ ${violations.length} bash test(s) do not unset the inherited git environment:`);
    for (const { path, missing } of violations) {
      console.error(`    ${path}`);
      console.error(`      missing: ${missing.join(' ')}`);
    }
    console.error('');
    console.error('  A test invoked from a git hook inherits GIT_DIR, and GIT_DIR beats');
    console.error('  directory discovery — every `git -C "$FIXTURE"` call then operates on');
    console.error('  the live repository. That is brikdesigns/brik-bds#1539: fixture refs pushed to');
    console.error('  origin and `main` moved to a tree that deleted the repo.');
    console.error('');
    console.error('  Add near the top of the test, after `set -u`:');
    console.error(`    unset ${GIT_ENV_VARS.slice(0, 4).join(' ')} \\`);
    console.error(`          ${GIT_ENV_VARS.slice(4).join(' ')}`);
  }

  if (unguarded.length) {
    if (violations.length) console.error('');
    console.error(
      `✗ ${unguarded.length} bash test(s) write a git identity without calling assert_throwaway_repo:`,
    );
    for (const { path, sites } of unguarded) {
      for (const { line, statement } of sites) {
        console.error(`    ${path}:${line}`);
        console.error(`      ${statement}`);
      }
    }
    console.error('');
    console.error('  `unset GIT_DIR` keeps the fixture pointed at the fixture; it does not prove');
    console.error('  the fixture is a throwaway. `git -C "" config user.email` is a no-op on the');
    console.error('  path and writes to whatever repo is current (#1841).');
    console.error('');
    console.error('  Source the guard and call it AFTER `git init`, before the first write:');
    console.error('    source "$(cd "$(dirname "$0")/.." && pwd)/lib/identity-guard.sh"');
    console.error('    assert_throwaway_repo "$REPO" "<what this fixture is>"');
  }

  if (stale.length) {
    if (violations.length || unguarded.length) console.error('');
    console.error(`✗ ${stale.length} GUARD_INAPPLICABLE entr(ies) no longer describe the tree:`);
    for (const { file, why } of stale) console.error(`    ${file} — ${why}`);
    console.error('');
    console.error('  De-list it. Adding an entry to match a fixture that COULD call the');
    console.error('  guard re-opens the hole #1861 was filed about — the list is for files');
    console.error('  where the guard would be wrong, not for ones nobody has guarded yet.');
  }

  return 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main());
}
