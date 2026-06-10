import type { LegalTemplate } from './types';

/**
 * Website Terms of Service / Terms and Conditions.
 * Generalized from web/tncld/markdown/legal-drafts/terms-and-conditions.md
 * (a non-attorney-vetted draft) — see reviewStatus.
 */
export const termsOfService: LegalTemplate = {
  key: 'terms-of-service',
  title: 'Terms of Service',
  path: '/terms',
  regime: 'website_terms',
  reviewStatus: 'pending_legal_review',
  source: 'tncld-draft-2026-04-20',
  fields: [
    { token: 'practice_name', label: 'Practice Name', required: true, source: 'companies.name' },
    { token: 'practice_short_name', label: 'Practice Short Name', required: false, source: 'derived from practice_name' },
    { token: 'website_domain', label: 'Website Domain', required: true, source: 'companies.website_url' },
    { token: 'entity_type', label: 'Legal Entity Type', required: false, source: 'company_profiles.business_model' },
    { token: 'governing_law_state', label: 'Governing-Law State', required: true, source: 'company_profiles service area / address state' },
    { token: 'venue_county', label: 'Venue (County, State)', required: true, source: 'company_profiles address county' },
    { token: 'practice_street', label: 'Practice Street Address', required: true, source: 'company_profiles.privacy_officer_address' },
    { token: 'practice_city_state_zip', label: 'City, State ZIP', required: true, source: 'company_profiles.privacy_officer_address' },
    { token: 'practice_email', label: 'Contact Email', required: true, source: 'company_profiles.privacy_officer_email' },
    { token: 'practice_phone', label: 'Practice Phone', required: true, source: 'company_profiles.privacy_officer_phone' },
    { token: 'effective_date', label: 'Effective Date', required: true, source: 'company_profiles.npp_effective_date' },
    { token: 'last_updated', label: 'Last Updated', required: true, source: 'company_profiles.npp_effective_date' },
  ],
  body: `**Last Updated:** {{last_updated}}
**Effective Date:** {{effective_date}}

By accessing or using [{{website_domain}}](https://{{website_domain}}) (the "Website"), you agree to these Terms of Service ("Terms"). If you do not agree, please discontinue use of the Website.

## 1. Website Use

This Website is operated by **{{practice_name}}** ("{{practice_short_name}}," "we," "us," or "our"), {{entity_type}}. It is provided for informational purposes only and does not constitute medical or dental advice, diagnosis, or treatment.

## 2. No Dentist-Patient Relationship

Use of this Website, submission of online forms, or communication through our Website does not, by itself, establish a dentist-patient relationship. Treatment recommendations, diagnoses, and care decisions must be discussed directly with a licensed {{practice_short_name}} provider during a clinical visit.

## 3. Informational Purposes Only

Information on this Website — including descriptions of procedures, technologies, and outcomes — is general in nature. Individual cases vary. Always consult a qualified dental professional about your specific situation before making health decisions.

## 4. No Guarantees of Treatment Outcomes

Dental treatment outcomes depend on many factors specific to each patient, including overall health, anatomy, and adherence to care recommendations. No guarantees, warranties, or representations are made regarding specific outcomes. Photographs and testimonials on this Website reflect actual patients' experiences and are not representations of what any particular patient will achieve.

## 5. Intellectual Property

All content on this Website — including text, images, graphics, logos, video, and design — is the property of {{practice_name}} or used with permission, and is protected by copyright and trademark law. You may not copy, reproduce, distribute, or create derivative works from any content without our prior written permission.

## 6. Third-Party Links

This Website may link to third-party websites as a convenience. We do not control and are not responsible for the content, privacy practices, or availability of those sites. Linking does not imply endorsement.

## 7. Limitation of Liability

To the maximum extent permitted by law, {{practice_short_name}} and its affiliates, officers, employees, and agents are not liable for any direct, indirect, incidental, consequential, or special damages arising from:

- Your use of or inability to use the Website
- Reliance on any information provided on the Website
- Errors, omissions, or inaccuracies in Website content
- Unauthorized access to or alteration of your information

This limitation does not apply to damages arising from our gross negligence or willful misconduct, or as otherwise prohibited by law.

## 8. Privacy

Your use of this Website is also governed by our [Privacy Policy](/privacy) and, if applicable, our [Notice of Privacy Practices](/notice-of-privacy-practices).

## 9. Accessibility

We are committed to making our Website accessible to people with disabilities. See our [Accessibility Statement](/accessibility) for details and contact information if you encounter an issue.

## 10. Changes to These Terms

We may update these Terms at any time by posting the revised version on this page with a new "Last Updated" date. Your continued use of the Website after changes are posted constitutes acceptance of the revised Terms.

## 11. Governing Law

These Terms are governed by the laws of the **State of {{governing_law_state}}**, without regard to conflict-of-law principles. Any dispute arising from your use of this Website or these Terms shall be resolved exclusively in the state or federal courts located in **{{venue_county}}**, and you consent to the jurisdiction of those courts.

## 12. Severability

If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.

## 13. Contact

Questions about these Terms?

**{{practice_name}}**
{{practice_street}}
{{practice_city_state_zip}}
Email: {{practice_email}}
Phone: {{practice_phone}}`,
};
