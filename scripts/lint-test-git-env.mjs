#!/usr/bin/env node
/**
 * lint-test-git-env.mjs — every bash test must unset the inherited git environment.
 *
 * brik-bds#1548, enforcing the lesson from #1539.
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
 * under brikdesigns/brik-llm#1485 keep adding tests to scripts/__tests__/ wired
 * into validate-all.js — which IS the pre-push path that fired the incident.
 *
 * A static read, deliberately: this check must not run the tests it inspects, so
 * it can never touch a repository itself.
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

function main() {
  const dir = process.argv[2] || 'scripts/__tests__';

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
  for (const file of scripts) {
    const path = join(dir, file);
    if (!statSync(path).isFile()) continue;
    const missing = missingGitEnvUnsets(readFileSync(path, 'utf8'));
    if (missing.length) violations.push({ path, missing });
  }

  if (violations.length === 0) {
    console.log(`✓ ${scripts.length} bash test(s) in ${dir} unset the git environment.`);
    return 0;
  }

  console.error(`✗ ${violations.length} bash test(s) do not unset the inherited git environment:`);
  for (const { path, missing } of violations) {
    console.error(`    ${path}`);
    console.error(`      missing: ${missing.join(' ')}`);
  }
  console.error('');
  console.error('  A test invoked from a git hook inherits GIT_DIR, and GIT_DIR beats');
  console.error('  directory discovery — every `git -C "$FIXTURE"` call then operates on');
  console.error('  the live repository. That is brik-bds#1539: fixture refs pushed to');
  console.error('  origin and `main` moved to a tree that deleted the repo.');
  console.error('');
  console.error('  Add near the top of the test, after `set -u`:');
  console.error(`    unset ${GIT_ENV_VARS.slice(0, 4).join(' ')} \\`);
  console.error(`          ${GIT_ENV_VARS.slice(4).join(' ')}`);
  return 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main());
}
