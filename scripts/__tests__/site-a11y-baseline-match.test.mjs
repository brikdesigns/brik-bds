// Self-test for the shared site a11y baseline matcher (brik-llm#5076).
//
// Ported from brikdesigns `tests/a11y/lib/baseline-match.test.ts`
// (brikdesigns#1361, #1447). This logic decides whether a blocking gate
// blocks, so each case is a way the waiver could quietly become an allowlist,
// or an accepted violation could start failing for no reason.

import { describe, it, expect } from 'vitest';

import {
  compileBaseline,
  contrastFingerprint,
  entryValue,
  fingerprintOf,
  isWaived,
  isWellFormedFingerprint,
  normalizeSelector,
  orphanRoutes,
  unmatchedEntries,
} from '../site-a11y/baseline-match.mjs';

/** A real axe color-contrast failureSummary, copied from a live run. */
const summary = (fg, bg) =>
  `Fix any of the following:\n  Element has insufficient color contrast of 3.78 (foreground color: ${fg}, background color: ${bg}, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1`;

const finding = (selector, fg = '#ffffff', bg = '#e35335') => ({
  ruleId: 'color-contrast',
  selector,
  failureSummary: summary(fg, bg),
});

describe('contrastFingerprint', () => {
  it('reads the pair axe names in the summary', () => {
    expect(contrastFingerprint(summary('#ffffff', '#e35335'))).toBe('#ffffff on #e35335');
  });

  it('lower-cases hex so #FFFFFF and #ffffff are one fingerprint', () => {
    expect(contrastFingerprint(summary('#FFFFFF', '#E35335'))).toBe('#ffffff on #e35335');
  });

  it('accepts the 8-digit hex axe emits when alpha is present', () => {
    expect(contrastFingerprint(summary('#ffffffcc', '#e35335'))).toBe('#ffffffcc on #e35335');
  });

  it('returns null when the summary names no pair', () => {
    expect(contrastFingerprint('Element has no alt text')).toBeNull();
    expect(contrastFingerprint('')).toBeNull();
  });

  it('returns null for a non-contrast rule even if a pair is quoted', () => {
    expect(
      fingerprintOf({ ruleId: 'image-alt', selector: 'img', failureSummary: summary('#ffffff', '#e35335') }),
    ).toBeNull();
  });
});

describe('normalizeSelector', () => {
  it('strips positional indices on both sides', () => {
    expect(normalizeSelector('.story-card:nth-child(3) > .bds-button:nth-of-type(1)')).toBe(
      '.story-card > .bds-button',
    );
  });
});

// brikdesigns#938: swapping card components re-rooted axe's selector for the
// same button with the same 3.78:1 white-on-#e35335. The old matcher read it
// as a new violation.
const CHURNED_BEFORE = '.bds-card--link.story-card.bds-card > .bds-card-footer > .bds-button--md';
const CHURNED_AFTER =
  '.bds-card--outlined.bds-card--padding-md.bds-card--interactive:nth-child(2) > .bds-card-footer > .bds-button--md';

const fingerprintBaseline = compileBaseline({
  fingerprints: { '/results': { 'color-contrast': ['#ffffff on #e35335'] } },
  fingerprintsDark: { '/how-we-work': { 'color-contrast': ['#27ae60 on #bef4d4'] } },
});

describe('isWaived — the re-root defect', () => {
  it('old and new selectors resolve to the same waiver', () => {
    expect(isWaived(fingerprintBaseline, 'light', '/results', finding(CHURNED_BEFORE))).toBe(true);
    expect(isWaived(fingerprintBaseline, 'light', '/results', finding(CHURNED_AFTER))).toBe(true);
  });

  it('the old key really was unstable, indices stripped and all', () => {
    expect(normalizeSelector(CHURNED_BEFORE)).not.toBe(normalizeSelector(CHURNED_AFTER));
    expect(fingerprintOf(finding(CHURNED_BEFORE))).toBe(fingerprintOf(finding(CHURNED_AFTER)));
  });
});

describe('isWaived — the waiver stays narrow', () => {
  it('a different colour pair on a waived route still fails', () => {
    expect(isWaived(fingerprintBaseline, 'light', '/results', finding('.x', '#767676', '#ffffff'))).toBe(false);
  });

  it('a waived pair on an unwaived route still fails', () => {
    expect(isWaived(fingerprintBaseline, 'light', '/terms', finding('.x'))).toBe(false);
  });

  it('a light waiver does not cover the dark theme', () => {
    expect(isWaived(fingerprintBaseline, 'dark', '/results', finding('.x'))).toBe(false);
  });

  it('a dark waiver does not cover the light theme', () => {
    const green = finding('.bds-badge', '#27ae60', '#bef4d4');
    expect(isWaived(fingerprintBaseline, 'dark', '/how-we-work', green)).toBe(true);
    expect(isWaived(fingerprintBaseline, 'light', '/how-we-work', green)).toBe(false);
  });

  it('a different rule on a waived route still fails', () => {
    const other = { ruleId: 'link-name', selector: '.x', failureSummary: 'Element has no title' };
    expect(isWaived(fingerprintBaseline, 'light', '/results', other)).toBe(false);
  });
});

describe('isWaived — the colourless escape hatch', () => {
  it('a rule with no fingerprint still matches by selector', () => {
    const compiled = compileBaseline({ routes: { '/terms': { 'link-name': ['.footer > a:nth-child(2)'] } } });
    const link = { ruleId: 'link-name', selector: '.footer > a', failureSummary: 'Element has no title' };
    expect(isWaived(compiled, 'light', '/terms', link)).toBe(true);
  });

  it('a contrast finding never falls back to the selector path', () => {
    const compiled = compileBaseline({ routes: { '/results': { 'color-contrast': [CHURNED_BEFORE] } } });
    expect(isWaived(compiled, 'light', '/results', finding(CHURNED_BEFORE))).toBe(false);
  });

  // Every site but brikdesigns keyed contrast by selector before this module.
  // Under the shared matcher those entries waive nothing, and the stale check
  // below names each one for re-keying — loudly, not silently.
  it('a legacy selector-keyed contrast entry is reported stale, not silently honoured', () => {
    const compiled = compileBaseline({ routes: { '/': { 'color-contrast': ['.hero__cta'] } } });
    const f = finding('.hero__cta');
    expect(isWaived(compiled, 'light', '/', f)).toBe(false);
    expect(unmatchedEntries(compiled, 'light', '/', [f])).toHaveLength(1);
  });
});

describe('object entries (marketing-site-a11y-gate.md schema)', () => {
  it('matches on the entry selector', () => {
    const compiled = compileBaseline({
      routes: { '/': { 'link-name': [{ selector: '.a', approvedBy: 'x', burnDown: 'y' }] } },
    });
    expect(isWaived(compiled, 'light', '/', { ruleId: 'link-name', selector: '.a', failureSummary: '' })).toBe(true);
  });

  it('matches on the entry fingerprint', () => {
    const compiled = compileBaseline({
      fingerprints: { '/': { 'color-contrast': [{ fingerprint: '#ffffff on #e35335', criterion: '1.4.3' }] } },
    });
    expect(isWaived(compiled, 'light', '/', finding('.a'))).toBe(true);
  });

  it('refuses an object entry with nothing to match on', () => {
    expect(() => entryValue({ approvedBy: 'x' })).toThrow(/no "selector" or "fingerprint"/);
  });
});

describe('isWellFormedFingerprint', () => {
  it('accepts the canonical shape and rejects a typo', () => {
    expect(isWellFormedFingerprint('#ffffff on #e35335')).toBe(true);
    expect(isWellFormedFingerprint('#fffff on #e35335')).toBe(false);
    expect(isWellFormedFingerprint('#ffffff over #e35335')).toBe(false);
  });
});

describe('unmatchedEntries — the reverse ratchet', () => {
  const waivedBaseline = {
    fingerprints: { '/': { 'color-contrast': ['#ffffff on #e35335'] } },
    fingerprintsDark: { '/': { 'color-contrast': ['#ffffff on #e35335'] } },
  };

  it('is silent when the entry matches a live finding', () => {
    expect(unmatchedEntries(compileBaseline(waivedBaseline), 'light', '/', [finding('.a')])).toEqual([]);
  });

  it('reports the entry when the pair moved under it (a re-pointed token)', () => {
    const moved = unmatchedEntries(compileBaseline(waivedBaseline), 'light', '/', [
      finding('.a', '#ffffff', '#dad0f2'),
    ]);
    expect(moved).toHaveLength(1);
    expect(moved[0]).toMatchObject({ value: '#ffffff on #e35335', scope: 'fingerprint', routePath: '/' });
  });

  it('reports the entry when the debt was paid and the finding is gone', () => {
    expect(unmatchedEntries(compileBaseline(waivedBaseline), 'light', '/', [])).toHaveLength(1);
  });

  it('stays route-scoped', () => {
    const compiled = compileBaseline({
      fingerprints: {
        '/': { 'color-contrast': ['#ffffff on #e35335'] },
        '/about': { 'color-contrast': ['#ffffff on #e35335'] },
      },
    });
    expect(unmatchedEntries(compiled, 'light', '/', [finding('.a')])).toEqual([]);
    expect(unmatchedEntries(compiled, 'light', '/about', [])).toHaveLength(1);
  });

  it('stays theme-scoped', () => {
    const compiled = compileBaseline(waivedBaseline);
    expect(unmatchedEntries(compiled, 'light', '/', [finding('.a')])).toEqual([]);
    expect(unmatchedEntries(compiled, 'dark', '/', [])).toHaveLength(1);
  });

  it('matches a colourless finding through the selector half', () => {
    const compiled = compileBaseline({ routes: { '/': { 'link-name': ['.a'] } } });
    expect(unmatchedEntries(compiled, 'light', '/', [{ ruleId: 'link-name', selector: '.a', failureSummary: '' }])).toEqual([]);
  });

  it('collapses axe positional indices the same way isWaived does', () => {
    const compiled = compileBaseline({ routes: { '/': { 'link-name': ['.a .b'] } } });
    const nth = { ruleId: 'link-name', selector: '.a:nth-child(3) .b', failureSummary: '' };
    expect(unmatchedEntries(compiled, 'light', '/', [nth])).toEqual([]);
  });
});

describe('orphanRoutes', () => {
  it('reports a baseline route the suite never visits', () => {
    const orphans = orphanRoutes(
      { fingerprints: { '/customers/dental': { 'color-contrast': ['#ffffff on #e35335'] } } },
      ['/', '/industries/dental'],
    );
    expect(orphans).toEqual(['fingerprints./customers/dental']);
  });

  it('is silent when every baseline route is audited', () => {
    expect(orphanRoutes({ routes: { '/': { 'link-name': ['.a'] } } }, ['/', '/about'])).toEqual([]);
  });

  it('reads the dark and selector halves too', () => {
    const orphans = orphanRoutes(
      {
        fingerprintsDark: { '/gone': { 'color-contrast': ['#ffffff on #e35335'] } },
        routesDark: { '/also-gone': { 'link-name': ['.a'] } },
      },
      ['/'],
    );
    expect(orphans).toEqual(['fingerprintsDark./gone', 'routesDark./also-gone']);
  });
});
