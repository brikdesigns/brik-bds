#!/usr/bin/env node
/**
 * classify-visual-failure.mjs — tell a dropped browser page apart from a real
 * visual regression, in the log, without reading 120 stack traces.
 *
 * The visual gate has two failure modes that look identical in vitest's output
 * (#1778):
 *
 *   1. REGRESSION — a story's screenshot no longer matches its baseline. The
 *      suite ran, a test failed, and the diff PNG is the review surface.
 *   2. DROP — the browser page died before the suite could run. vitest reports
 *      the SUITE as failed with `NetworkError: A network error occurred.` and
 *      every test inside it as *skipped*, never failed.
 *
 * Both print `FAIL <file>` in red. On 2026-08-12 that ambiguity let 121 dropped
 * pages on `main` read as 121 visual regressions, and let a two-green run read
 * as a fix for the drops (#1781). The distinguishing signal is cheap and exact:
 * a dropped suite has ZERO failed tests. A regression has at least one.
 *
 * Reads vitest's JSON report and prints a verdict. Exit codes are distinct so
 * the workflow step (and a human skimming it) can tell the classes apart:
 *
 *   0 — no failures
 *   1 — REGRESSION (at least one real test failure; diffs are worth reviewing)
 *   2 — INFRASTRUCTURE (only dropped pages; nothing about the UI is known)
 *
 * Usage: node scripts/classify-visual-failure.mjs <vitest-json-report>
 */

import fs from 'node:fs';

/** Error messages that mean "the page went away", not "the pixels changed". */
const DROP_SIGNATURES = [
  'A network error occurred',
  'NetworkError',
  'Target closed',
  'Target page, context or browser has been closed',
  'browserContext.newPage',
  'page.goto',
  'Protocol error',
  'Session closed',
  'WebSocket',
];

const isDropMessage = (msg) =>
  !!msg && DROP_SIGNATURES.some((sig) => msg.toLowerCase().includes(sig.toLowerCase()));

/**
 * Classify one suite from a vitest JSON `testResults` entry.
 *
 * A suite is a DROP when nothing inside it actually failed — its tests are
 * pending/skipped because the page never rendered them. Any failed assertion
 * makes it a REGRESSION regardless of what the suite-level message says, so a
 * genuine mismatch can never be dismissed as infrastructure.
 */
export function classifySuite(suite) {
  const tests = suite.assertionResults ?? [];
  const failedTests = tests.filter((t) => t.status === 'failed');
  if (failedTests.length > 0) {
    return { kind: 'regression', failedTests: failedTests.length };
  }
  const messages = [
    ...(suite.message ? [suite.message] : []),
    ...(suite.failureMessage ? [suite.failureMessage] : []),
  ];
  if (messages.some(isDropMessage)) {
    return { kind: 'drop', failedTests: 0 };
  }
  // Failed, no failed test, no recognised drop signature — do NOT absorb it
  // into either bucket. An unknown failure shape must stay loud.
  return { kind: 'unknown', failedTests: 0 };
}

export function classifyReport(report) {
  const suites = (report.testResults ?? []).filter((s) => s.status === 'failed');
  const drops = [];
  const regressions = [];
  const unknown = [];
  for (const suite of suites) {
    const { kind, failedTests } = classifySuite(suite);
    const entry = { name: suite.name, failedTests };
    if (kind === 'drop') drops.push(entry);
    else if (kind === 'regression') regressions.push(entry);
    else unknown.push(entry);
  }
  const totalSuites = (report.testResults ?? []).length;
  return { drops, regressions, unknown, totalSuites, failedSuites: suites.length };
}

/** Exit code for a classification — see the header for the contract. */
export function exitCodeFor({ drops, regressions, unknown }) {
  if (regressions.length > 0 || unknown.length > 0) return 1;
  if (drops.length > 0) return 2;
  return 0;
}

function render({ drops, regressions, unknown, totalSuites, failedSuites }) {
  const lines = [];
  if (failedSuites === 0) {
    lines.push(`✓ visual gate: ${totalSuites} suites, no failures.`);
    return lines.join('\n');
  }

  lines.push('');
  lines.push('════ visual gate failure classification (#1778) ════');
  lines.push(`  suites: ${totalSuites} total, ${failedSuites} failed`);
  lines.push(`  ├─ dropped pages (infrastructure): ${drops.length}`);
  lines.push(`  ├─ visual regressions (real):      ${regressions.length}`);
  lines.push(`  └─ unclassified:                   ${unknown.length}`);
  lines.push('');

  if (regressions.length > 0) {
    lines.push(`✗ VISUAL REGRESSIONS — ${regressions.length} suite(s) with a failed test.`);
    lines.push('  Review the diff PNGs in the visual-diffs artifact.');
    for (const r of regressions) lines.push(`    · ${r.name} (${r.failedTests} test(s))`);
    lines.push('');
  }

  if (unknown.length > 0) {
    lines.push(`✗ UNCLASSIFIED — ${unknown.length} suite(s) failed in a shape this script`);
    lines.push('  does not recognise. Read the raw log; do not assume infrastructure.');
    for (const u of unknown) lines.push(`    · ${u.name}`);
    lines.push('');
  }

  if (drops.length > 0) {
    lines.push(`⚠ DROPPED PAGES — ${drops.length} suite(s) never ran: the browser page died`);
    lines.push('  before the story rendered. Zero failed tests in these suites, so this says');
    lines.push('  NOTHING about whether the UI regressed — the gate did not measure it.');
    lines.push('');
    lines.push('  This is the #1778 failure mode. Check, in this order:');
    lines.push('    · Is `--ipc=host` still on the job container? Without it Chromium');
    lines.push('      exhausts its 64 MB default /dev/shm and the browser dies outright.');
    lines.push('      The `shm:` line in "Report runner capacity" should read ~7.9G, not 64M.');
    lines.push('    · Is `--maxWorkers=1` still set? At 2 the gate dropped 64 suites even');
    lines.push('      with 7.9 GB of shm — one screenshot capture at a time is the floor.');
    lines.push('    · Did the suite grow? Shard across a matrix; do not raise the workers.');
    if (regressions.length === 0 && unknown.length === 0) {
      lines.push('');
      lines.push('  No real regression was found alongside these — this run is INCONCLUSIVE,');
      lines.push('  not a UI failure. Re-run after fixing the container, then trust it.');
    }
  }

  return lines.join('\n');
}

// --- CLI ---------------------------------------------------------------------
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop());
if (isMain) {
  const reportPath = process.argv[2];
  if (!reportPath) {
    console.error('usage: node scripts/classify-visual-failure.mjs <vitest-json-report>');
    process.exit(1);
  }
  if (!fs.existsSync(reportPath)) {
    // No report means vitest died before writing one — that is itself a signal,
    // and it must not silently pass.
    console.error(
      `✗ no vitest JSON report at "${reportPath}" — the run did not get far enough to ` +
        'write one. Treating as failure; read the raw log above.',
    );
    process.exit(1);
  }
  let report;
  try {
    report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  } catch (err) {
    console.error(`✗ could not parse "${reportPath}": ${err.message}`);
    process.exit(1);
  }
  const result = classifyReport(report);
  console.log(render(result));
  process.exit(exitCodeFor(result));
}
