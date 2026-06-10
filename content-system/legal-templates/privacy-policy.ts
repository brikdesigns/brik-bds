import type { LegalTemplate } from './types';

/**
 * Website Privacy Policy (state-level privacy law — distinct from HIPAA PHI).
 * Generalized from web/tncld/markdown/legal-drafts/privacy-policy.md
 * (a non-attorney-vetted draft) — see reviewStatus.
 */
export const privacyPolicy: LegalTemplate = {
  key: 'privacy-policy',
  title: 'Privacy Policy',
  path: '/privacy',
  regime: 'website_privacy',
  reviewStatus: 'pending_legal_review',
  source: 'tncld-draft-2026-04-20',
  fields: [
    { token: 'practice_name', label: 'Practice Name', required: true, source: 'companies.name' },
    { token: 'practice_short_name', label: 'Practice Short Name', required: false, source: 'derived from practice_name' },
    { token: 'website_domain', label: 'Website Domain', required: true, source: 'companies.website_url' },
    { token: 'practice_street', label: 'Practice Street Address', required: true, source: 'company_profiles.privacy_officer_address' },
    { token: 'practice_city_state_zip', label: 'City, State ZIP', required: true, source: 'company_profiles.privacy_officer_address' },
    { token: 'practice_phone', label: 'Practice Phone', required: true, source: 'company_profiles.privacy_officer_phone' },
    { token: 'privacy_email', label: 'Privacy Email', required: true, source: 'company_profiles.privacy_officer_email' },
    { token: 'privacy_officer_name', label: 'Privacy Officer Name', required: true, source: 'company_profiles.privacy_officer_name (45 CFR § 164.530)' },
    { token: 'governing_law_state', label: 'State', required: true, source: 'company_profiles service area / address state' },
    { token: 'effective_date', label: 'Effective Date', required: true, source: 'company_profiles.npp_effective_date' },
    { token: 'last_updated', label: 'Last Updated', required: true, source: 'company_profiles.npp_effective_date' },
  ],
  body: `**Last Updated:** {{last_updated}}
**Effective Date:** {{effective_date}}

{{practice_name}} ("{{practice_short_name}}," "we," "us," or "our") respects your privacy and is committed to protecting the information you share with us. This Privacy Policy explains how we collect, use, and safeguard information collected through our website, [{{website_domain}}](https://{{website_domain}}).

This policy governs **website use only**. Protected Health Information (PHI) collected during dental treatment is governed separately by our [Notice of Privacy Practices](/notice-of-privacy-practices) under the Health Insurance Portability and Accountability Act (HIPAA).

## 1. Information We Collect

### 1a. Information you provide directly

When you fill out a form on our website, we may collect:

- Name, email address, phone number
- Appointment preferences and availability
- Reason for visit or general description of your dental concern
- Any other information you voluntarily include in a message

**Important:** We encourage you not to submit detailed medical, dental, or financial information through website forms. Once you become a patient, secure channels are used to collect health information.

### 1b. Information collected automatically

When you visit our website, we automatically collect:

- IP address and general location (city/state level)
- Browser type, operating system, and device type
- Pages visited, time spent, referring website
- Interactions with page elements (clicks, scrolls)

This information is collected via cookies and similar technologies.

### 1c. Third-party analytics and advertising

We use third-party services that may collect information as described in their own privacy policies. These include analytics, hosting, and (where applicable) advertising platforms. We list only services actually installed on this website; consult each provider's privacy policy for details.

## 2. How We Use Information

We use information collected through this website to:

- Respond to inquiries, appointment requests, and messages
- Schedule, confirm, or follow up on appointments
- Improve our website's content, performance, and user experience
- Measure the effectiveness of our marketing
- Comply with legal obligations

We **do not sell** your personal information to third parties. We do not use website-submitted information for marketing to people who have not requested contact.

## 3. How We Share Information

We may share information only as follows:

- **With service providers** who help operate our website or practice (e.g., web hosting, analytics, email platforms) under confidentiality agreements.
- **When required by law** — in response to valid subpoenas, court orders, or regulatory requests.
- **To protect our rights or safety** — when we reasonably believe disclosure is necessary to prevent fraud, protect our property, or safeguard a person from harm.
- **In a business transfer** — if {{practice_short_name}} is sold, merged, or reorganized, information may transfer to the successor entity.

We do **not** share website-collected information with third-party marketers for their own use.

## 4. Cookies and Tracking

Our website uses cookies — small data files stored on your device — to enable core functionality, remember preferences, and measure site usage.

You can disable cookies in your browser settings. Disabling cookies may affect website functionality. We currently do **not** respond to "Do Not Track" browser signals; industry standards for DNT are still evolving.

## 5. How We Protect Information

We use administrative, technical, and physical safeguards to protect the information you share with us, including:

- SSL/TLS encryption on all website pages
- Secure patient management systems for clinical data
- Staff training on privacy and data handling
- Access controls limiting who can view patient information

No system is 100% secure. While we take reasonable steps to protect your information, we cannot guarantee absolute security of data transmitted over the internet. **Do not send sensitive health information, Social Security numbers, or full insurance details through website forms or unencrypted email.**

## 6. Your Rights

### 6a. Patient rights under HIPAA

If you are or were a patient of {{practice_short_name}}, you have rights over your Protected Health Information, including the right to access, amend, and restrict use. Those rights are detailed in our [Notice of Privacy Practices](/notice-of-privacy-practices).

### 6b. California residents (CCPA/CPRA)

If you are a California resident, you have the right to:

- **Know** what personal information we collect and how it is used
- **Access** a copy of the personal information we hold about you
- **Delete** personal information, subject to certain exceptions
- **Correct** inaccurate personal information
- **Opt out of sale or sharing** ({{practice_short_name}} does not sell or share personal information as defined by CCPA)
- **Non-discrimination** for exercising these rights

To make a request, email **{{privacy_email}}** or call **{{practice_phone}}**. We will verify your identity before processing requests.

### 6c. Other state residents

Residents of Virginia, Colorado, Connecticut, Utah, and other states with comprehensive privacy laws may have similar rights. We honor valid requests from residents of those states using the same process described above.

## 7. Children's Privacy

Our website is not directed at children under 13, and we do not knowingly collect personal information from children through the website. If a parent or guardian believes their child has submitted personal information through our website, contact us at **{{privacy_email}}** and we will delete it.

**For pediatric dental patients:** information collected during care is governed by HIPAA and our Notice of Privacy Practices, with additional protections for minors under applicable state law.

## 8. Third-Party Links

Our website may link to third-party websites (e.g., maps, payment processors, social media). We are not responsible for the privacy practices or content of those sites. Review their privacy policies separately.

## 9. Data Retention

We retain website-submitted information only as long as necessary to respond to your inquiry or comply with legal obligations. Patient records are retained per {{governing_law_state}} state law and HIPAA requirements.

## 10. Changes to This Policy

We may update this Privacy Policy periodically. Changes are effective when posted on this page with a new "Last Updated" date. Material changes will be communicated via a prominent notice on our website. Continued use of the website after changes indicates acceptance.

## 11. Contact Us

Questions about this Privacy Policy, or to exercise any privacy rights:

**{{practice_name}}**
{{practice_street}}
{{practice_city_state_zip}}
Email: {{privacy_email}}
Phone: {{practice_phone}}

**HIPAA Privacy Officer:** {{privacy_officer_name}}, reachable at the contact above.

## 12. Accessibility

This Privacy Policy is available in alternative formats upon request. See our [Accessibility Statement](/accessibility) for more information.`,
};
