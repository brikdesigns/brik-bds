#!/usr/bin/env node
// Self-test for the orphan-issue ratchet (brikdesigns#1528; ported by brik-bds#2792).
//
// The gate guards a silent failure — an unparented issue throws nothing, builds
// nothing, and looks identical to a parented one on the board; it is simply
// never picked up again. So the only thing that makes it worth having is that
// it FIRES, on the two directions a ratchet has to cover (new debt; paid debt
// the baseline still claims) and on the two exclusions that must not fire
// (meta:project, and a reasoned opt-out).
//
// The rule functions take already-fetched nodes, so every case below runs
// offline. The last test runs the real gate as a subprocess, which is the only
// one that needs a token — it asserts the live repo is clean against the
// shipped baseline, so a regression in the repo's own hygiene fails here too.
//
// Plain node:assert, no framework. Run via `npm run test:lint:orphan-issues`.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  findOrphans,
  declaredCrossRepoParent,
  diffAgainstBaseline,
  hasReasonedOptOut,
  isProject,
  readBaseline,
  BASELINE_PATH,
} from './lint-orphan-issues.mjs';

const tests = [];
const failures = [];
const test = (name, fn) => tests.push({ name, fn });

/** Minimal shape of one GraphQL issue node. */
const node = (number, { parent = null, labels = [], body = '', title = 't' } = {}) => ({
  number,
  title,
  body,
  parent: parent === null ? null : { number: parent },
  labels: { nodes: labels.map((name) => ({ name })) },
});

test('an unparented issue is an orphan', () => {
  assert.deepEqual(findOrphans([node(10)]), [{ number: 10, title: 't' }]);
});

// ── Cross-repo parents ──────────────────────────────────────────────────────
//
// The gate's CI token is scoped to this repository, so GraphQL returns
// `parent: null` when the parent lives in a repo the token cannot read, and the
// issue then reads as unparented. That is a scope artefact, not debt.
//
// VISIBILITY is the discriminator, not cross-repo-ness — both live cases were
// read off one CI run: #1521 → brik-llm#3406 (PRIVATE) came back null and was
// the false positive that reddened the gate, while #1370 → brik-bds#2404
// (PUBLIC) resolved on the same repo-scoped token and was never flagged. A test
// that assumed "any cross-repo parent is invisible" would pass while describing
// the wrong rule.

test('a declared cross-repo parent is a home, not an orphan', () => {
  const body = 'Some why.\n\n## References\n- Parent: `brikdesigns/brik-llm#3406`\n';
  assert.equal(declaredCrossRepoParent(body), 'brikdesigns/brik-llm#3406');
  assert.deepEqual(findOrphans([node(10, { body })]), []);
});

test('the declaration is recognised unbackticked, bolded, and unbulleted', () => {
  for (const line of [
    'Parent: brikdesigns/brik-bds#2026',
    '- Parent: `brikdesigns/brik-bds#2026`',
    '**Parent**: brikdesigns/brik-bds#2026',
    '  * parent: `brikdesigns/brik-bds#2026`',
  ]) {
    assert.equal(declaredCrossRepoParent(line), 'brikdesigns/brik-bds#2026', line);
  }
});

test('prose merely mentioning a parent issue does NOT exempt', () => {
  // The near-miss that matters: if this matched, any issue quoting another
  // ticket would exempt itself and the widened gate would be decorative.
  for (const body of [
    'Split out of the parent brikdesigns/brik-llm#3406 because it lives here.',
    'See parent work in brikdesigns/brik-llm#3406.',
    'Parent: #3406', // same-repo — a real parent link is required, not a claim
    'Parent: brik-llm#3406', // no owner — ambiguous, so not accepted
  ]) {
    assert.equal(declaredCrossRepoParent(body), null, body);
  }
  assert.deepEqual(findOrphans([node(10, { body: 'Parent: #3406' })]), [{ number: 10, title: 't' }]);
});

test('an issue with a REAL parent is unaffected by the cross-repo path', () => {
  assert.deepEqual(findOrphans([node(10, { parent: 5, body: 'Parent: `x/y#1`' })]), []);
});

test('a parented issue is not an orphan', () => {
  assert.deepEqual(findOrphans([node(10, { parent: 5 })]), []);
});

test('an orphan WITHOUT meta:agent-discovered still counts — #1612 widened the scan', () => {
  // The gate used to fetch only meta:agent-discovered issues, so a plain
  // unparented work item was invisible. findOrphans keys on parent + the two
  // exclusions, never the label, so any labelled-but-unparented issue is caught.
  assert.deepEqual(findOrphans([node(10, { labels: ['area:design', 'priority:p2-month'] })]), [
    { number: 10, title: 't' },
  ]);
});

test('meta:project is never an orphan — a Project is top-level by design', () => {
  assert.deepEqual(findOrphans([node(10, { labels: ['meta:project', 'size:l'] })]), []);
});

test('a reasoned orphan-ok marker exempts', () => {
  const body = 'why\n<!-- orphan-ok: cross-repo, its umbrella lives in brik-bds -->\n';
  assert.deepEqual(findOrphans([node(10, { body })]), []);
});

test('a reason containing > (an arrow) still exempts — #1612', () => {
  const body = '<!-- orphan-ok: service->back-office shim cleanup; no epic owns it -->';
  assert.equal(hasReasonedOptOut(body), true);
  assert.deepEqual(findOrphans([node(10, { body })]), []);
});

test('a BARE orphan-ok marker does NOT exempt — the reason is the point', () => {
  assert.equal(hasReasonedOptOut('<!-- orphan-ok: -->'), false);
  assert.deepEqual(findOrphans([node(10, { body: '<!-- orphan-ok: -->' })]), [
    { number: 10, title: 't' },
  ]);
});

test('orphans come back sorted, so the failure output is stable', () => {
  const found = findOrphans([node(30), node(10), node(20)]);
  assert.deepEqual(
    found.map((o) => o.number),
    [10, 20, 30]
  );
});

test('isProject reads the label list, not the issue shape', () => {
  assert.equal(isProject(['area:infra', 'meta:project']), true);
  assert.equal(isProject(['area:infra']), false);
});

// ── the ratchet, both directions ────────────────────────────────────────────

test('a NEW orphan fails — it is not in the baseline', () => {
  const { added, stale } = diffAgainstBaseline([{ number: 99, title: 'new' }], []);
  assert.deepEqual(
    added.map((o) => o.number),
    [99]
  );
  assert.deepEqual(stale, []);
});

test('a grandfathered orphan passes while it is still an orphan', () => {
  const { added, stale } = diffAgainstBaseline([{ number: 42, title: 'old' }], [42]);
  assert.deepEqual(added, []);
  assert.deepEqual(stale, []);
});

test('paying debt WITHOUT lowering the baseline fails — it would overstate the debt', () => {
  const { added, stale } = diffAgainstBaseline([], [42]);
  assert.deepEqual(added, []);
  assert.deepEqual(stale, [42]);
});

test('a new orphan is not absorbed by a paid-down allowance', () => {
  // The count-based shape this replaces would net these to zero and pass.
  const { added, stale } = diffAgainstBaseline([{ number: 99, title: 'new' }], [42]);
  assert.deepEqual(
    added.map((o) => o.number),
    [99]
  );
  assert.deepEqual(stale, [42]);
});

test('the shipped baseline is a duplicate-free list of issue numbers', () => {
  // brik-bds ships a seeded baseline (the 2026-10-26 backfill's knowing
  // remainder, #2792), not an empty one — so what is asserted is its shape, and
  // the live-repo test below asserts it is neither short nor long.
  const baseline = readBaseline(BASELINE_PATH);
  assert.ok(baseline.every((n) => Number.isInteger(n) && n > 0), 'entries must be issue numbers');
  assert.equal(new Set(baseline).size, baseline.length, 'baseline lists an issue twice');
});

// ── the real gate against the real repo ─────────────────────────────────────

test('the gate runs clean against the live repo', () => {
  const res = spawnSync('node', ['scripts/lint-orphan-issues.mjs'], { encoding: 'utf8' });
  if (res.status === 2) {
    // No token / no network. Do not silently pass a gate that could not run —
    // say so loudly and fail, same bar the gate itself holds.
    assert.fail(`the gate could not reach the API (exit 2):\n${res.stderr}`);
  }
  assert.equal(res.status, 0, `expected a clean repo, got:\n${res.stderr}`);
});

for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failures.push({ name, err });
    console.error(`  ✗ ${name}\n    ${err.message}`);
  }
}

console.log(`\nlint-orphan-issues.test: ${tests.length - failures.length}/${tests.length} passed`);
process.exit(failures.length === 0 ? 0 : 1);
