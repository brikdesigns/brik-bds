import { describe, it, expect } from 'vitest';

import {
  legalTemplates,
  getLegalTemplate,
  noticeOfPrivacyPractices,
  privacyPolicy,
  termsOfService,
  privacyPolicyGeneral,
  termsOfServiceGeneral,
} from './index';

const GENERAL = [privacyPolicyGeneral, termsOfServiceGeneral];
const ALL = [noticeOfPrivacyPractices, privacyPolicy, termsOfService, ...GENERAL];

describe('legal templates registry', () => {
  it('registers every template by canonical key', () => {
    expect(Object.keys(legalTemplates).sort()).toEqual([
      'notice-of-privacy-practices',
      'privacy-policy',
      'privacy-policy-general',
      'terms-of-service',
      'terms-of-service-general',
    ]);
  });

  it('marks every template pending legal review (none auto-approved)', () => {
    for (const t of ALL) {
      expect(t.reviewStatus).toBe('pending_legal_review');
    }
  });

  it('resolves portal templateKey aliases', () => {
    expect(getLegalTemplate('hipaa-notice')).toBe(noticeOfPrivacyPractices);
    expect(getLegalTemplate('privacy-policy')).toBe(privacyPolicy);
    expect(getLegalTemplate('terms-of-service')).toBe(termsOfService);
    expect(getLegalTemplate('notice-of-privacy-practices')).toBe(noticeOfPrivacyPractices);
    expect(getLegalTemplate('privacy-policy-general')).toBe(privacyPolicyGeneral);
    expect(getLegalTemplate('terms-of-service-general')).toBe(termsOfServiceGeneral);
    expect(getLegalTemplate('not-a-key')).toBeNull();
  });
});

describe('general templates carry no healthcare language (brik-bds#2819)', () => {
  // A non-healthcare client publishing these must not claim HIPAA duties,
  // patients, or clinical care it does not have.
  const HEALTHCARE = /\b(dental|dentist|patients?|hipaa|phi|clinical|medical)\b|protected health|notice-of-privacy-practices/i;

  it('no healthcare term appears in a general template body or title', () => {
    for (const t of GENERAL) {
      expect(t.body, `${t.key} body`).not.toMatch(HEALTHCARE);
      expect(t.title, `${t.key} title`).not.toMatch(HEALTHCARE);
    }
  });

  it('no general template field requires a privacy-officer or clinical source', () => {
    for (const t of GENERAL) {
      for (const f of t.fields) {
        expect(f.token, `${t.key} field`).not.toMatch(/privacy_officer|npp|practice_/);
      }
    }
  });
});

describe('templates are generalized — no source-practice specifics leaked', () => {
  // The drafts were TNCLD's. Generalizing them means none of TNCLD's literal
  // facts may survive in the body — every practice-specific value must be a
  // {{token}} placeholder instead.
  const TNCLD_LEAKS = [
    'Tennessee Center for Laser Dentistry',
    'TNCLD',
    'tncld.com',
    'Miller Springs',
    'Franklin, TN',
    '595-8070',
    'Williamson County',
  ];

  it('no TNCLD literal appears in any template body', () => {
    for (const t of ALL) {
      for (const leak of TNCLD_LEAKS) {
        expect(t.body, `${t.key} leaks "${leak}"`).not.toContain(leak);
      }
    }
  });

  it('every required field token appears in its template body', () => {
    for (const t of ALL) {
      for (const f of t.fields.filter((x) => x.required)) {
        expect(t.body, `${t.key} missing token {{${f.token}}}`).toContain(`{{${f.token}}}`);
      }
    }
  });

  it('the HIPAA notice cites the Privacy Officer designation rule and OCR complaint path', () => {
    expect(noticeOfPrivacyPractices.body).toContain('{{privacy_officer_name}}');
    expect(noticeOfPrivacyPractices.body).toContain('hhs.gov/ocr/privacy/hipaa/complaints');
  });
});
