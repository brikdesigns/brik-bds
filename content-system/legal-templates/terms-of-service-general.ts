import type { LegalTemplate } from './types';

/**
 * Website Terms of Use for a general (non-healthcare) business.
 * Derived from `terms-of-service.ts` with every dental / clinical clause
 * removed (brik-bds#2819). Not attorney-vetted — see reviewStatus.
 */
export const termsOfServiceGeneral: LegalTemplate = {
  key: 'terms-of-service-general',
  title: 'Terms of Use',
  path: '/terms',
  regime: 'website_terms',
  reviewStatus: 'pending_legal_review',
  source: 'terms-of-service-derived-2026-10-21',
  fields: [
    { token: 'business_name', label: 'Business Name', required: true, source: 'companies.name' },
    { token: 'business_short_name', label: 'Business Short Name', required: false, source: 'derived from business_name' },
    { token: 'website_domain', label: 'Website Domain', required: true, source: 'companies.website_url' },
    { token: 'business_street', label: 'Street Address', required: false, source: 'company address, when published' },
    { token: 'business_location', label: 'City, State', required: true, source: 'company address city + state' },
    { token: 'contact_email', label: 'Contact Email', required: true, source: 'company contact email' },
    { token: 'contact_phone', label: 'Contact Phone', required: true, source: 'company contact phone' },
    { token: 'governing_law_state', label: 'Governing-Law State', required: true, source: 'company address state' },
    { token: 'effective_date', label: 'Effective Date', required: true, source: 'date the page is first published' },
    { token: 'last_updated', label: 'Last Updated', required: true, source: 'date of the latest revision' },
  ],
  body: `**Last Updated:** {{last_updated}}
**Effective Date:** {{effective_date}}

By accessing or using [{{website_domain}}](https://{{website_domain}}) (the "Website"), you agree to these Terms of Use ("Terms"). If you do not agree, please discontinue use of the Website.

## 1. Website Use

This Website is operated by **{{business_name}}** ("{{business_short_name}}," "we," "us," or "our"). It is provided for general informational purposes.

## 2. No Professional Relationship

Use of this Website, submission of online forms, or booking an introductory call does not, by itself, create a client relationship or an engagement for services. Any engagement is governed by a separate written agreement between you and {{business_short_name}}.

## 3. Informational Purposes Only

Information on this Website is general in nature and is not legal, tax, accounting, or financial advice for your specific situation. Circumstances vary. Consult a qualified professional before acting on any information found here.

## 4. No Guarantees

No guarantees, warranties, or representations are made regarding specific results. Testimonials on this Website reflect individual experiences and are not representations of what any particular person or organization will achieve.

## 5. Intellectual Property

All content on this Website — including text, images, graphics, logos, video, and design — is the property of {{business_name}} or used with permission, and is protected by copyright and trademark law. You may not copy, reproduce, distribute, or create derivative works from any content without our prior written permission.

## 6. Third-Party Links

This Website may link to third-party websites and tools (for example, scheduling or social media) as a convenience. We do not control and are not responsible for the content, privacy practices, or availability of those sites. Linking does not imply endorsement.

## 7. Limitation of Liability

To the maximum extent permitted by law, {{business_short_name}} and its affiliates, officers, employees, and agents are not liable for any direct, indirect, incidental, consequential, or special damages arising from:

- Your use of or inability to use the Website
- Reliance on any information provided on the Website
- Errors, omissions, or inaccuracies in Website content
- Unauthorized access to or alteration of your information

This limitation does not apply to damages arising from our gross negligence or willful misconduct, or as otherwise prohibited by law.

## 8. Privacy

Your use of this Website is also governed by our [Privacy Policy](/privacy).

## 9. Accessibility

We are committed to making our Website accessible to people with disabilities. If you encounter an accessibility issue, contact us using the details below and we will work to provide the information you need.

## 10. Changes to These Terms

We may update these Terms at any time by posting the revised version on this page with a new "Last Updated" date. Your continued use of the Website after changes are posted constitutes acceptance of the revised Terms.

## 11. Governing Law

These Terms are governed by the laws of the **State of {{governing_law_state}}**, without regard to conflict-of-law principles. Any dispute arising from your use of this Website or these Terms shall be resolved exclusively in the state or federal courts located in the **State of {{governing_law_state}}**, and you consent to the jurisdiction of those courts.

## 12. Severability

If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.

## 13. Contact

Questions about these Terms?

**{{business_name}}**
{{business_street}}
{{business_location}}
Email: {{contact_email}}
Phone: {{contact_phone}}`,
};
