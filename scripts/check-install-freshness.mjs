#!/usr/bin/env node
/**
 * check-install-freshness.mjs — is the installed tree the one package-lock.json describes?
 *
 * Replaces the mtime comparison the pre-push guard used to make
 * (`[ package-lock.json -nt node_modules/.package-lock.json ]`). That predicate
 * is content-blind: git rewrites package-lock.json on merge, pull, checkout and
 * `worktree add`, moving its mtime ahead of the last install even when the bytes
 * it writes are identical to what is installed. The guard then refused every
 * push until a pointless `npm ci`. It fired three times in one session on
 * 2026-07-29, including on a release tag push. brik-bds#1547.
 *
 * The predicate here compares CONTENT, using npm's own record of what it
 * installed (node_modules/.package-lock.json):
 *
 *   stale ⟺ some lock entry that is NOT optional/platform-gated is absent from
 *           the install record, OR an entry present in both has a different
 *           version.
 *
 * Why the optional/platform exclusion is load-bearing rather than defensive: on
 * this repo 79 of the lock's entries are legitimately not installed (measured
 * 2026-07-29), and every one of them carries `optional`, `os` or `cpu` —
 * @esbuild/android-arm, @emnapi/*, and the rest of the cross-platform matrix. A
 * naive "every lock entry must be installed" check reports stale forever on a
 * perfectly good tree, which is the same always-wrong failure the mtime check
 * had.
 *
 * The absent-and-unmarked half still covers the case the guard was built for
 * (#812): a newly added dependency is in the lock, missing from node_modules,
 * and would otherwise fail later with an opaque MODULE_NOT_FOUND.
 *
 * Note on `npm ci --omit=dev`: dev entries are then absent and unmarked, so this
 * reports stale. That is correct here — validate:full runs tsc and
 * build-storybook, both devDependencies.
 *
 * Usage:
 *   node scripts/check-install-freshness.mjs            # exit 0 fresh, 1 stale/missing
 *   node scripts/check-install-freshness.mjs --quiet
 */

import { readFileSync, existsSync } from 'node:fs';

const LOCK = 'package-lock.json';
const RECORD = 'node_modules/.package-lock.json';

/**
 * Pure predicate. Takes the two parsed lockfiles, returns a verdict object.
 * Exported so a test can exercise it without touching a real node_modules.
 *
 * @param {object} lock   parsed package-lock.json
 * @param {object} record parsed node_modules/.package-lock.json
 * @returns {{fresh: boolean, missing: string[], mismatched: string[]}}
 */
export function installFreshness(lock, record) {
  const lockPkgs = (lock && lock.packages) || {};
  const instPkgs = (record && record.packages) || {};

  const missing = [];
  const mismatched = [];

  for (const [path, entry] of Object.entries(lockPkgs)) {
    // The root ("") entry describes the project, not an installed package.
    if (!path.startsWith('node_modules/')) continue;

    const installed = instPkgs[path];
    if (!installed) {
      // Platform-gated or explicitly optional entries are expected to be absent
      // on any given machine — see the header.
      if (entry.optional || entry.os || entry.cpu) continue;
      missing.push(path);
      continue;
    }
    if (entry.version && installed.version && entry.version !== installed.version) {
      mismatched.push(`${path} (lock ${entry.version} vs installed ${installed.version})`);
    }
  }

  return { fresh: missing.length === 0 && mismatched.length === 0, missing, mismatched };
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function main() {
  const quiet = process.argv.includes('--quiet');
  const say = (msg) => { if (!quiet) console.log(msg); };

  if (!existsSync('node_modules') || !existsSync(RECORD)) {
    say('✗ node_modules is missing or incomplete — no install record at ' + RECORD + '.');
    return 1;
  }
  if (!existsSync(LOCK)) {
    say('⚠  No ' + LOCK + ' — nothing to compare against, treating as fresh.');
    return 0;
  }

  let lock, record;
  try {
    lock = readJson(LOCK);
    record = readJson(RECORD);
  } catch (err) {
    // An unreadable record must not block a push on a guess; the gates
    // downstream (tsc, build) fail loudly on a genuinely broken tree.
    say('⚠  Could not parse the lockfiles (' + err.message + ') — treating as fresh.');
    return 0;
  }

  const { fresh, missing, mismatched } = installFreshness(lock, record);
  if (fresh) {
    say('✓ node_modules matches package-lock.json.');
    return 0;
  }

  say('✗ node_modules does not match package-lock.json.');
  if (missing.length) {
    say(`    ${missing.length} package(s) in the lock are not installed, e.g.:`);
    missing.slice(0, 5).forEach((p) => say(`      ${p}`));
  }
  if (mismatched.length) {
    say(`    ${mismatched.length} version mismatch(es), e.g.:`);
    mismatched.slice(0, 5).forEach((p) => say(`      ${p}`));
  }
  say('  Fix: run `npm ci`, then push again.');
  return 1;
}

// Only run the CLI when invoked directly, so the test can import the predicate.
if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main());
}
