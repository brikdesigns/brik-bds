/**
 * Legal-template registry for the Brik Content System.
 *
 * Parameterized HIPAA / privacy / terms templates for client legal pages.
 * GENERALIZED from non-attorney-vetted drafts — every template carries
 * `reviewStatus: 'pending_legal_review'`. Consumers MUST surface that on the
 * generated page and block launch-ready until counsel approves.
 */

import type { LegalTemplate, LegalTemplateKey, LegalTemplateKeyAlias } from './types';
import { noticeOfPrivacyPractices } from './notice-of-privacy-practices';
import { privacyPolicy } from './privacy-policy';
import { termsOfService } from './terms-of-service';

export type {
  LegalTemplate,
  LegalTemplateField,
  LegalTemplateKey,
  LegalTemplateKeyAlias,
  LegalReviewStatus,
  LegalRegime,
} from './types';

export { noticeOfPrivacyPractices, privacyPolicy, termsOfService };

export const legalTemplates: Record<LegalTemplateKey, LegalTemplate> = {
  'notice-of-privacy-practices': noticeOfPrivacyPractices,
  'privacy-policy': privacyPolicy,
  'terms-of-service': termsOfService,
};

/**
 * Portal site-structure `templateKey` values map to legal-template keys.
 * `hipaa-notice` is the portal alias for the Notice of Privacy Practices.
 */
const TEMPLATE_KEY_BY_ALIAS: Record<LegalTemplateKeyAlias, LegalTemplateKey> = {
  'hipaa-notice': 'notice-of-privacy-practices',
  'privacy-policy': 'privacy-policy',
  'terms-of-service': 'terms-of-service',
};

/** Resolve a portal `templateKey` (or a canonical key) to its LegalTemplate. */
export function getLegalTemplate(key: string): LegalTemplate | null {
  if (key in legalTemplates) return legalTemplates[key as LegalTemplateKey];
  if (key in TEMPLATE_KEY_BY_ALIAS) return legalTemplates[TEMPLATE_KEY_BY_ALIAS[key as LegalTemplateKeyAlias]];
  return null;
}
