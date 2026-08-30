import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

/**
 * Devbar-widget canonical-vs-mirror drift gate.
 *
 * `components/ui/BrikDevBar/widgets/*.js` is the single source of truth for the
 * vanilla devbar widgets (brik-bds#466). `scripts/sync-devbar-widgets.sh`
 * byte-copies each to its consumers — including the Storybook iframe copies in
 * `.storybook/public/`, which are committed to this repo.
 *
 * The failure this gate closes (brik-bds#985): a consumer mirror silently led
 * canonical. Portal authored the pin-completion feature (#1611) and the
 * structured-revision tags (#1381) directly in its `scripts/mockup-shared`
 * mirror; canonical never moved. Any run of the sync then overwrote the newer
 * mirror with the *older* canonical, regressing shipped client behaviour. The
 * fix back-ports the mirror into canonical; this gate keeps canonical the
 * most-advanced copy by failing the moment a committed in-repo mirror diverges.
 *
 * Cross-repo mirrors (portal `scripts/mockup-shared/`, brik-llm cache) live in
 * other repos and are gated in their own CI; this test covers the mirrors this
 * repo commits (the `.storybook/public/` iframe copies). Fix on failure: run
 * `bash scripts/sync-devbar-widgets.sh` and commit the result.
 */

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');

const CANONICAL_DIR = join(repoRoot, 'components/ui/BrikDevBar/widgets');
const STORYBOOK_DIR = join(repoRoot, '.storybook/public');

// canonical filename → committed Storybook mirror filename (sync-devbar-widgets.sh)
const MIRRORS = [
  ['devbar.js', 'brik-devbar.js'],
  ['inspect-widget.js', 'brik-inspect.js'],
  ['feedback-widget.js', 'brik-feedback-widget.js'],
  ['events-widget.js', 'brik-events-widget.js'],
];

describe('devbar widgets — Storybook mirror matches canonical', () => {
  it.each(MIRRORS)('%s is byte-identical to its Storybook copy (%s)', (canonical, mirror) => {
    const canonicalBytes = readFileSync(join(CANONICAL_DIR, canonical), 'utf8');
    const mirrorBytes = readFileSync(join(STORYBOOK_DIR, mirror), 'utf8');
    expect(mirrorBytes).toBe(canonicalBytes);
  });
});

/**
 * Cross-repo drift gate (brik-bds#2194).
 *
 * The byte test above only covers the in-repo Storybook mirror, so a consumer
 * in ANOTHER repo could freeze at an old inspector and CI here would stay green
 * — which is exactly how brikdesigns and both brik-client-portal copies shipped
 * a stale inspector (wrong declared border-color, unselectable ratio frames)
 * while `.storybook/public` was current.
 *
 * `scripts/devbar-sync-state.txt` records the canonical hash last written to
 * each consumer (in-repo AND cross-repo). This repo's CI cannot read the
 * cross-repo files, but it CAN read that recorded hash: when canonical advances
 * without the sync being re-run, the recorded hash rots. This gate fails the
 * moment any recorded hash != the current canonical source hash, forcing
 * `bash scripts/sync-devbar-widgets.sh` (which rewrites the state AND the
 * consumer files) to run in the same change. Fix on failure: run the sync and
 * commit the state + consumer files.
 *
 * DEFERRED consumers are excluded by prefix and tracked in brik-bds#2199:
 *  - product/brik-client-portal/* is version-locked to the INSTALLED
 *    @brikdesigns/bds package (refreshed by propagate.sh on a version bump),
 *    NOT a source-copy — gating it here would sit red whenever the portal lags
 *    a bds release.
 *  - brik/brik-llm/* is the mockup-pipeline cache, resynced with the portal in
 *    that same follow-up.
 * When #2199 lands, empty DEFERRED_PREFIXES so the gate covers them too.
 */
const STATE_FILE = join(repoRoot, 'scripts/devbar-sync-state.txt');
const DEFERRED_PREFIXES = ['product/brik-client-portal/', 'brik/brik-llm/'];

// consumer basename (either the bare canonical name or the brik-*.js public
// name) → canonical source filename in CANONICAL_DIR.
const CONSUMER_TO_CANONICAL = {
  'devbar.js': 'devbar.js',
  'brik-devbar.js': 'devbar.js',
  'inspect-widget.js': 'inspect-widget.js',
  'brik-inspect.js': 'inspect-widget.js',
  'feedback-widget.js': 'feedback-widget.js',
  'brik-feedback-widget.js': 'feedback-widget.js',
  'events-widget.js': 'events-widget.js',
  'brik-events-widget.js': 'events-widget.js',
};

const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');

const canonicalHash = Object.fromEntries(
  [...new Set(Object.values(CONSUMER_TO_CANONICAL))].map((f) => [f, sha256(join(CANONICAL_DIR, f))]),
);

const stateEntries = readFileSync(STATE_FILE, 'utf8')
  .split('\n')
  .filter((l) => l.trim())
  .map((line) => {
    const [hash, key] = line.trim().split(/\s+/);
    return { hash, key };
  });

const gatedEntries = stateEntries.filter((e) => !DEFERRED_PREFIXES.some((p) => e.key.startsWith(p)));

describe('devbar widgets — recorded consumer hash matches canonical (#2194)', () => {
  it('the state file has gated entries to check', () => {
    // Guard: a mapping or path rename that silently drops every gated entry
    // would make this suite vacuously pass. Keep at least the in-repo mirrors.
    expect(gatedEntries.length).toBeGreaterThan(0);
  });

  it.each(gatedEntries.map((e) => [e.key, e.hash]))(
    '%s is synced to canonical (recorded hash is current)',
    (key, recordedHash) => {
      const canonical = CONSUMER_TO_CANONICAL[basename(key)];
      expect(canonical, `no canonical mapping for ${key}`).toBeDefined();
      expect(recordedHash).toBe(canonicalHash[canonical]);
    },
  );
});
