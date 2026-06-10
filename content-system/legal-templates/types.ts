/**
 * Legal-template types for the Brik Content System.
 *
 * These templates are the parameterized basis for client legal pages
 * (HIPAA Notice of Privacy Practices, Privacy Policy, Terms of Service).
 * They are GENERALIZED from a single Tennessee dental practice's drafts and
 * are NOT attorney-vetted — every template ships `reviewStatus:
 * 'pending_legal_review'`. The consuming renderer MUST surface that status on
 * the generated page and block launch-ready until counsel signs off.
 *
 * Body copy uses `{{token}}` placeholders. The renderer interpolates each
 * token from the client profile; a REQUIRED token with no value renders as a
 * visible `[TOKEN LABEL]` placeholder (never silently blank) so missing
 * practice-specific facts are obvious during review.
 */

export type LegalTemplateKey =
  | 'notice-of-privacy-practices'
  | 'privacy-policy'
  | 'terms-of-service';

/** Maps to the portal site-structure `templateKey` values. */
export type LegalTemplateKeyAlias = 'hipaa-notice' | 'privacy-policy' | 'terms-of-service';

export type LegalReviewStatus = 'pending_legal_review' | 'attorney_approved';

/** Compliance regime a template primarily addresses. */
export type LegalRegime = 'hipaa' | 'website_privacy' | 'website_terms';

export interface LegalTemplateField {
  /** Placeholder token, used as `{{token}}` in the body. */
  token: string;
  /** Human label, also rendered as `[LABEL]` when a required value is missing. */
  label: string;
  /** Required fields render a visible placeholder when missing; optional fields are dropped. */
  required: boolean;
  /** Hint for where the renderer sources the value (profile/company field). */
  source?: string;
}

export interface LegalTemplate {
  key: LegalTemplateKey;
  title: string;
  /** Canonical route the template targets (informational; portal owns routing). */
  path: string;
  regime: LegalRegime;
  reviewStatus: LegalReviewStatus;
  /** Provenance — these were generalized from non-attorney-vetted drafts. */
  source: string;
  fields: LegalTemplateField[];
  /** Markdown body with `{{token}}` placeholders. */
  body: string;
}
