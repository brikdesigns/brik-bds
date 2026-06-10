import { describe, it, expect } from 'vitest';

import {
  legalTemplates,
  getLegalTemplate,
  noticeOfPrivacyPractices,
  privacyPolicy,
  termsOfService,
} from './index';

const ALL = [noticeOfPrivacyPractices, privacyPolicy, termsOfService];

describe('legal templates registry', () => {
  it('registers all three templates by canonical key', () => {
    expect(Object.keys(legalTemplates).sort()).toEqual([
      'notice-of-privacy-practices',
      'privacy-policy',
      'terms-of-service',
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
    expect(getLegalTemplate('not-a-key')).toBeNull();
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
