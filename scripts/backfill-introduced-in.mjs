#!/usr/bin/env node
/**
 * Backfill `introduced_in` versions into scripts/inspector-overrides.json
 * via git archaeology.
 *
 * Algorithm:
 *   1. Parse the history for release commits `chore(release): vX.Y.Z` to
 *      build an ordered list of (version, date).
 *   2. For each component dir, find the first-add commit date.
 *   3. Match: the introduced_in version = the earliest release whose date
 *      is >= the component's first-add date. If the component was added
 *      after the latest release (i.e. still sitting on trunk awaiting
 *      release), use the current package.json version.
 *
 * This is a one-shot script — run it when onboarding existing components.
 * New components added after this initial pass should have their
 * introduced_in set manually in inspector-overrides.json at merge time.
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const COMPONENTS_DIR = join(REPO_ROOT, 'components/ui');
const OVERRIDES_PATH = join(__dirname, 'inspector-overrides.json');
const PKG_JSON = join(REPO_ROOT, 'package.json');

const pkg = JSON.parse(readFileSync(PKG_JSON, 'utf8'));
const currentVersion = pkg.version;

function sh(cmd) {
  return execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
}

// ── Release history ─────────────────────────────────────────────────────

/**
 * Returns a sorted array of { version, date } for every release commit,
 * oldest first. Release commit convention: "chore(release): vX.Y.Z …"
 */
function getReleases() {
  const log = sh(`git log --all --format='%aI|%s' | grep -E 'chore\\(release\\): v[0-9]+\\.[0-9]+\\.[0-9]+' || true`);
  if (!log) return [];
  const releases = [];
  for (const line of log.split('\n')) {
    if (!line) continue;
    const [date, subject] = line.split('|', 2);
    const match = subject.match(/chore\(release\): v(\d+\.\d+\.\d+)/);
    if (!match) continue;
    releases.push({ version: match[1], date: new Date(date).getTime() });
  }
  return releases.sort((a, b) => a.date - b.date);
}

function pickVersionForDate(releases, componentDateMs) {
  // Earliest release whose timestamp is >= component first-add timestamp.
  for (const r of releases) {
    if (r.date >= componentDateMs) return r.version;
  }
  return currentVersion; // still on trunk, not yet released
}

// ── Component first-add dates ───────────────────────────────────────────

function firstAddedDate(relPath) {
  // %aI = author ISO date. --diff-filter=A = commits that added the path.
  // --follow doesn't help for directories; we use git log on the dir.
  const out = sh(
    `git log --all --reverse --diff-filter=A --format=%aI -- "${relPath}" | head -n 1`,
  );
  return out ? new Date(out).getTime() : null;
}

// ── Assemble + write overrides ──────────────────────────────────────────

function main() {
  if (!existsSync(COMPONENTS_DIR)) {
    console.error('Components dir not found:', COMPONENTS_DIR);
    process.exit(1);
  }
  const releases = getReleases();
  console.log(`Found ${releases.length} release commits in history.`);

  const existingOverrides = existsSync(OVERRIDES_PATH)
    ? JSON.parse(readFileSync(OVERRIDES_PATH, 'utf8'))
    : { components: {} };
  existingOverrides.components ??= {};

  let updated = 0;
  let skipped = 0;

  for (const entry of readdirSync(COMPONENTS_DIR)) {
    const dir = join(COMPONENTS_DIR, entry);
    if (!statSync(dir).isDirectory()) continue;
    if (!/^[A-Z]/.test(entry)) continue;

    const current = existingOverrides.components[entry] ?? {};
    // Respect hand-set introduced_in values.
    if (current.introduced_in) {
      skipped++;
      continue;
    }

    const relPath = `components/ui/${entry}`;
    const addedAt = firstAddedDate(relPath);
    if (!addedAt) {
      skipped++;
      continue;
    }

    const version = pickVersionForDate(releases, addedAt);
    existingOverrides.components[entry] = {
      ...current,
      introduced_in: version,
    };
    updated++;
  }

  writeFileSync(OVERRIDES_PATH, JSON.stringify(existingOverrides, null, 2) + '\n');
  console.log(`✓ Updated ${updated} components, skipped ${skipped} (pre-set or untracked).`);
  console.log(`  Wrote ${OVERRIDES_PATH}`);
}

main();
