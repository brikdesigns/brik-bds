/**
 * Tests for classify-visual-failure.mjs (#1778).
 *
 * The shapes below are taken from the two real failure modes observed on
 * 2026-08-12: run 31596457904 on `main` (121 dropped suites, 129 tests passed,
 * 277 skipped, ZERO failed) and an ordinary screenshot mismatch.
 *
 * The property that matters: a dropped page must never be reported as a visual
 * regression, and a real regression must never be dismissed as a drop — even
 * when both happen in the same run.
 */
import { describe, it, expect } from 'vitest';
import { classifySuite, classifyReport, exitCodeFor } from './classify-visual-failure.mjs';

/** A suite whose page died: suite-level NetworkError, tests skipped not failed. */
const droppedSuite = (name) => ({
  name,
  status: 'failed',
  message: 'NetworkError: A network error occurred.',
  assertionResults: [
    { title: 'Default', status: 'pending' },
    { title: 'With Rich Content', status: 'pending' },
  ],
});

/** A suite with a genuine screenshot mismatch. */
const regressedSuite = (name) => ({
  name,
  status: 'failed',
  assertionResults: [
    { title: 'Default', status: 'failed', failureMessages: ['Screenshot does not match baseline'] },
    { title: 'Neutral', status: 'passed' },
  ],
});

const passedSuite = (name) => ({
  name,
  status: 'passed',
  assertionResults: [{ title: 'Default', status: 'passed' }],
});

describe('classifySuite', () => {
  it('calls a NetworkError suite with zero failed tests a drop', () => {
    expect(classifySuite(droppedSuite('a.stories.tsx')).kind).toBe('drop');
  });

  it('calls a suite with a failed test a regression', () => {
    expect(classifySuite(regressedSuite('b.stories.tsx')).kind).toBe('regression');
  });

  // The safety direction that matters: if a real assertion failed, the suite is
  // a regression even when a drop-shaped message is also present. Otherwise a
  // flaky page could launder a genuine mismatch into "infrastructure".
  it('prefers regression over drop when a test actually failed', () => {
    const both = { ...regressedSuite('c.stories.tsx'), message: 'NetworkError: A network error occurred.' };
    expect(classifySuite(both).kind).toBe('regression');
  });

  it('leaves an unrecognised failure shape unclassified rather than guessing', () => {
    const weird = { name: 'd.stories.tsx', status: 'failed', message: 'Something else broke', assertionResults: [] };
    expect(classifySuite(weird).kind).toBe('unknown');
  });

  it('recognises the other page-death signatures Playwright emits', () => {
    for (const msg of [
      'Target closed',
      'Target page, context or browser has been closed',
      'page.goto: Protocol error',
      'Session closed. Most likely the page has been closed.',
    ]) {
      const s = { name: 'x.stories.tsx', status: 'failed', message: msg, assertionResults: [] };
      expect(classifySuite(s).kind, msg).toBe('drop');
    }
  });
});

describe('classifyReport', () => {
  it('separates the two classes in a mixed run', () => {
    const report = {
      testResults: [
        passedSuite('ok.stories.tsx'),
        droppedSuite('dropped-1.stories.tsx'),
        droppedSuite('dropped-2.stories.tsx'),
        regressedSuite('regressed.stories.tsx'),
      ],
    };
    const r = classifyReport(report);
    expect(r.totalSuites).toBe(4);
    expect(r.failedSuites).toBe(3);
    expect(r.drops.map((d) => d.name)).toEqual(['dropped-1.stories.tsx', 'dropped-2.stories.tsx']);
    expect(r.regressions.map((d) => d.name)).toEqual(['regressed.stories.tsx']);
    expect(r.unknown).toEqual([]);
  });

  // The #1778 signature exactly: every failure is a drop, nothing regressed.
  it('reports the all-dropped run as infrastructure, not regressions', () => {
    const report = {
      testResults: [...Array(121)].map((_, i) => droppedSuite(`s${i}.stories.tsx`)),
    };
    const r = classifyReport(report);
    expect(r.drops).toHaveLength(121);
    expect(r.regressions).toHaveLength(0);
    expect(exitCodeFor(r)).toBe(2); // infrastructure, not a UI verdict
  });

  it('exits 1 when a real regression is present, even alongside drops', () => {
    const report = {
      testResults: [droppedSuite('a.stories.tsx'), regressedSuite('b.stories.tsx')],
    };
    expect(exitCodeFor(classifyReport(report))).toBe(1);
  });

  it('exits 0 on a clean run', () => {
    expect(exitCodeFor(classifyReport({ testResults: [passedSuite('a.stories.tsx')] }))).toBe(0);
  });

  it('exits 1 on an unclassified failure so an unknown shape is never absorbed', () => {
    const report = {
      testResults: [{ name: 'a.stories.tsx', status: 'failed', message: 'mystery', assertionResults: [] }],
    };
    expect(exitCodeFor(classifyReport(report))).toBe(1);
  });
});

// --list-drops feeds the workflow's targeted retry: only the suites that died
// get re-run. If it ever emitted a regression's path, that regression would be
// retried away — so the contract is that it lists drops and nothing else.
describe('--list-drops contract', () => {
  it('lists only dropped paths, never a regression', () => {
    const r = classifyReport({
      testResults: [droppedSuite('dropped.stories.tsx'), regressedSuite('regressed.stories.tsx'), passedSuite('ok.stories.tsx')],
    });
    expect(r.drops.map((d) => d.name)).toEqual(['dropped.stories.tsx']);
    expect(r.drops.map((d) => d.name)).not.toContain('regressed.stories.tsx');
  });
});
