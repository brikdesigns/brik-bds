// ADR-032 grading for the shared site a11y gate (brik-llm#5076).
//
// The tier decides whether a client site ships, so each case pins one way the
// grader could let a legal-floor defect through as "debt", or block on
// something ADR-032 says never blocks.

import { describe, it, expect } from 'vitest';

import { criteriaOf, gradeFinding, resolveProfile, LEGAL_FLOOR_CRITERIA } from '../site-a11y/grade.mjs';

// Tag sets copied from axe-core 4.11.3 `axe.getRules()`.
const CONTRAST = { ruleId: 'color-contrast', impact: 'serious', tags: ['cat.color', 'wcag2aa', 'wcag143'] };
const LINK_NAME = { ruleId: 'link-name', impact: 'serious', tags: ['cat.name-role-value', 'wcag2a', 'wcag244', 'wcag412'] };
const LIST = { ruleId: 'list', impact: 'serious', tags: ['cat.structure', 'wcag2a', 'wcag131'] };
const REGION = { ruleId: 'region', impact: 'moderate', tags: ['cat.keyboard', 'best-practice'] };

describe('criteriaOf', () => {
  it('reads WCAG criteria from axe tags and ignores level tags', () => {
    expect(criteriaOf(['wcag2a', 'wcag21aa', 'wcag143', 'wcag412'])).toEqual(['1.4.3', '4.1.2']);
  });

  it('reads a two-digit criterion', () => {
    expect(criteriaOf(['wcag1411'])).toEqual(['1.4.11']);
  });

  it('returns nothing for a tagless finding', () => {
    expect(criteriaOf()).toEqual([]);
  });
});

describe('gradeFinding — tiers', () => {
  it('net-new serious/critical BLOCKs on either profile', () => {
    for (const profile of ['covered', 'non-covered']) {
      expect(gradeFinding(LIST, { listed: false, profile })).toMatchObject({ tier: 'BLOCK', reason: 'net-new' });
    }
  });

  it('a listed non-floor finding is TRACKED-DEBT, even for a covered site', () => {
    expect(gradeFinding(LIST, { listed: true, profile: 'covered' })).toMatchObject({ tier: 'TRACKED-DEBT' });
  });

  it('moderate/minor is ADVISORY even when net-new', () => {
    expect(gradeFinding({ ...LIST, impact: 'moderate' }, { listed: false, profile: 'covered' }).tier).toBe('ADVISORY');
    expect(gradeFinding({ ...LIST, impact: 'minor' }, { listed: false, profile: 'covered' }).tier).toBe('ADVISORY');
  });

  it('best-practice with no WCAG criterion is ADVISORY even at serious', () => {
    expect(gradeFinding({ ...REGION, impact: 'serious' }, { listed: false, profile: 'covered' })).toMatchObject({
      tier: 'ADVISORY',
      reason: 'best-practice',
    });
  });
});

describe('gradeFinding — the legal floor', () => {
  it('a covered site cannot carry contrast as debt', () => {
    expect(gradeFinding(CONTRAST, { listed: true, profile: 'covered' })).toEqual({
      tier: 'BLOCK',
      reason: 'legal-floor',
      floor: ['1.4.3'],
    });
  });

  it('a covered site cannot carry name/role/value as debt', () => {
    expect(gradeFinding(LINK_NAME, { listed: true, profile: 'covered' })).toMatchObject({
      tier: 'BLOCK',
      reason: 'legal-floor',
      floor: ['4.1.2'],
    });
  });

  it('a non-covered site may carry a floor criterion as owner-approved debt', () => {
    expect(gradeFinding(CONTRAST, { listed: true, profile: 'non-covered' }).tier).toBe('TRACKED-DEBT');
  });

  it('the floor is the eight criteria ADR-032 names', () => {
    expect([...LEGAL_FLOOR_CRITERIA].sort()).toEqual(
      ['1.1.1', '1.4.11', '1.4.3', '2.1.1', '2.4.7', '3.1.1', '3.3.1', '4.1.2'].sort(),
    );
  });
});

describe('resolveProfile', () => {
  it('defaults to covered when nothing declares a profile (ADR-032 fail-safe)', () => {
    expect(resolveProfile(undefined, {})).toBe('covered');
  });

  it('reads the baseline file when the spec passes none', () => {
    expect(resolveProfile(undefined, { complianceProfile: 'non-covered' })).toBe('non-covered');
  });

  it('the spec value wins over the baseline', () => {
    expect(resolveProfile('covered', { complianceProfile: 'non-covered' })).toBe('covered');
  });

  it('refuses an unknown profile rather than grading it', () => {
    expect(() => resolveProfile('exempt', {})).toThrow(/refusing to guess/);
  });
});
