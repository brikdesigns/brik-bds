import type { LegalTemplate } from './types';

/**
 * Website Privacy Policy for a general (non-healthcare) business.
 * Derived from `privacy-policy.ts` with every HIPAA / patient / clinical clause
 * removed, for clients that hold no PHI (brik-bds#2819). Not attorney-vetted —
 * see reviewStatus.
 */
export const privacyPolicyGeneral: LegalTemplate = {
  key: 'privacy-policy-general',
  title: 'Privacy Policy',
  path: '/privacy',
  regime: 'website_privacy',
  reviewStatus: 'pending_legal_review',
  source: 'privacy-policy-derived-2026-10-21',
  fields: [
    { token: 'business_name', label: 'Business Name', required: true, source: 'companies.name' },
    { token: 'business_short_name', label: 'Business Short Name', required: false, source: 'derived from business_name' },
    { token: 'website_domain', label: 'Website Domain', required: true, source: 'companies.website_url' },
    { token: 'business_street', label: 'Street Address', required: false, source: 'company address, when published' },
    { token: 'business_location', label: 'City, State', required: true, source: 'company address city + state' },
    { token: 'contact_email', label: 'Contact Email', required: true, source: 'company contact email' },
    { token: 'contact_phone', label: 'Contact Phone', required: true, source: 'company contact phone' },
    { token: 'governing_law_state', label: 'State', required: true, source: 'company address state' },
    { token: 'effective_date', label: 'Effective Date', required: true, source: 'date the page is first published' },
    { token: 'last_updated', label: 'Last Updated', required: true, source: 'date of the latest revision' },
  ],
  body: `**Last Updated:** {{last_updated}}
**Effective Date:** {{effective_date}}

{{business_name}} ("{{business_short_name}}," "we," "us," or "our") respects your privacy and is committed to protecting the information you share with us. This Privacy Policy explains how we collect, use, and safeguard information collected through our website, [{{website_domain}}](https://{{website_domain}}).

## 1. Information We Collect

### 1a. Information you provide directly

When you fill out a form, book a call, or contact us through our website, we may collect:

- Name, email address, phone number
- Organization name and role
- Scheduling preferences and availability
- Any other information you voluntarily include in a message

**Important:** Please do not submit bank account numbers, Social Security numbers, passwords, or other sensitive financial or personal details through website forms. If we need that information to provide a service, we will collect it through a secure channel.

### 1b. Information collected automatically

When you visit our website, we automatically collect:

- IP address and general location (city/state level)
- Browser type, operating system, and device type
- Pages visited, time spent, referring website
- Interactions with page elements (clicks, scrolls)

This information is collected via cookies and similar technologies.

### 1c. Third-party services

We use third-party services that may collect information as described in their own privacy policies. These include website hosting, analytics, scheduling, form, and email platforms. We list only services actually installed on this website; consult each provider's privacy policy for details.

## 2. How We Use Information

We use information collected through this website to:

- Respond to inquiries and messages
- Schedule, confirm, or follow up on calls and meetings
- Provide the services you request from us
- Improve our website's content, performance, and user experience
- Measure the effectiveness of our marketing
- Comply with legal obligations

We **do not sell** your personal information to third parties. We do not use website-submitted information for marketing to people who have not requested contact.

## 3. How We Share Information

We may share information only as follows:

- **With service providers** who help operate our website or business (e.g., web hosting, analytics, scheduling, and email platforms) under confidentiality obligations.
- **When required by law** — in response to valid subpoenas, court orders, or regulatory requests.
- **To protect our rights or safety** — when we reasonably believe disclosure is necessary to prevent fraud, protect our property, or safeguard a person from harm.
- **In a business transfer** — if {{business_short_name}} is sold, merged, or reorganized, information may transfer to the successor entity.

We do **not** share website-collected information with third-party marketers for their own use.

## 4. Cookies and Tracking

Our website uses cookies — small data files stored on your device — to enable core functionality, remember preferences, and measure site usage.

You can disable cookies in your browser settings. Disabling cookies may affect website functionality. We currently do **not** respond to "Do Not Track" browser signals; industry standards for DNT are still evolving.

## 5. How We Protect Information

We use reasonable administrative, technical, and physical safeguards to protect the information you share with us, including SSL/TLS encryption on all website pages and access controls limiting who can view submitted information.

No system is 100% secure. While we take reasonable steps to protect your information, we cannot guarantee absolute security of data transmitted over the internet.

## 6. Your Rights

### 6a. California residents (CCPA/CPRA)

If you are a California resident, you have the right to:

- **Know** what personal information we collect and how it is used
- **Access** a copy of the personal information we hold about you
- **Delete** personal information, subject to certain exceptions
- **Correct** inaccurate personal information
- **Opt out of sale or sharing** ({{business_short_name}} does not sell or share personal information as defined by CCPA)
- **Non-discrimination** for exercising these rights

To make a request, email **{{contact_email}}** or call **{{contact_phone}}**. We will verify your identity before processing requests.

### 6b. Other state residents

Residents of Virginia, Colorado, Connecticut, Utah, and other states with comprehensive privacy laws may have similar rights. We honor valid requests from residents of those states using the same process described above.

## 7. Children's Privacy

Our website is not directed at children under 13, and we do not knowingly collect personal information from children. If a parent or guardian believes their child has submitted personal information through our website, contact us at **{{contact_email}}** and we will delete it.

## 8. Third-Party Links

Our website may link to third-party websites (e.g., scheduling tools, social media). We are not responsible for the privacy practices or content of those sites. Review their privacy policies separately.

## 9. Data Retention

We retain website-submitted information only as long as necessary to respond to your inquiry, provide the services you request, or comply with legal obligations under {{governing_law_state}} and federal law.

## 10. Changes to This Policy

We may update this Privacy Policy periodically. Changes are effective when posted on this page with a new "Last Updated" date. Continued use of the website after changes indicates acceptance.

## 11. Contact Us

Questions about this Privacy Policy, or to exercise any privacy rights:

**{{business_name}}**
{{business_street}}
{{business_location}}
Email: {{contact_email}}
Phone: {{contact_phone}}

This Privacy Policy is available in alternative formats upon request.`,
};
