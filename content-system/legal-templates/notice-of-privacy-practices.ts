import type { LegalTemplate } from './types';

/**
 * HIPAA Notice of Privacy Practices (45 CFR § 164.520).
 * Generalized from web/tncld/markdown/legal-drafts/notice-of-privacy-practices.md
 * (a non-attorney-vetted draft) — see reviewStatus.
 */
export const noticeOfPrivacyPractices: LegalTemplate = {
  key: 'notice-of-privacy-practices',
  title: 'Notice of Privacy Practices',
  path: '/notice-of-privacy-practices',
  regime: 'hipaa',
  reviewStatus: 'pending_legal_review',
  source: 'tncld-draft-2026-04-20',
  fields: [
    { token: 'practice_name', label: 'Practice Name', required: true, source: 'companies.name' },
    { token: 'practice_short_name', label: 'Practice Short Name', required: false, source: 'derived from practice_name' },
    { token: 'practice_street', label: 'Practice Street Address', required: true, source: 'company_profiles.privacy_officer_address' },
    { token: 'practice_city_state_zip', label: 'City, State ZIP', required: true, source: 'company_profiles.privacy_officer_address' },
    { token: 'practice_phone', label: 'Practice Phone', required: true, source: 'company_profiles.privacy_officer_phone' },
    { token: 'privacy_email', label: 'Privacy Email', required: true, source: 'company_profiles.privacy_officer_email' },
    { token: 'privacy_officer_name', label: 'Privacy Officer Name', required: true, source: 'company_profiles.privacy_officer_name (45 CFR § 164.530)' },
    { token: 'effective_date', label: 'Effective Date', required: true, source: 'company_profiles.npp_effective_date' },
    { token: 'last_updated', label: 'Last Updated', required: true, source: 'company_profiles.npp_effective_date' },
  ],
  body: `**Last Updated:** {{last_updated}}
**Effective Date:** {{effective_date}}

> **THIS NOTICE DESCRIBES HOW MEDICAL INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED, AND HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.**

This Notice of Privacy Practices describes the privacy practices of **{{practice_name}}** ("{{practice_short_name}}," "we," "us," or "our") regarding Protected Health Information (PHI) under the Health Insurance Portability and Accountability Act (HIPAA) and applicable state law.

## Our Commitment

{{practice_short_name}} is required by law to:

- Maintain the privacy and security of your Protected Health Information
- Provide you with this Notice describing our legal duties and privacy practices
- Notify you in the event of a breach of your unsecured PHI
- Follow the terms of the Notice currently in effect

## How We May Use and Disclose Your Health Information

The following describes the ways we may use and disclose your PHI, typically without your written authorization.

### Treatment
We use and disclose your PHI to provide dental care — for example, sharing treatment notes with specialists we refer you to, or with a laboratory that creates your dental appliance.

### Payment
We use and disclose your PHI to obtain payment for services — for example, sending claims to your insurance carrier, or communicating with a collection agency regarding an overdue balance.

### Healthcare Operations
We use and disclose your PHI for operations such as quality assessment, staff training, licensing, and practice management.

### Appointment Reminders
We may contact you by phone, text, email, or mail to remind you of upcoming appointments. Let us know if you prefer a specific method.

### Treatment Alternatives and Health-Related Benefits
We may contact you about treatment options, services, or benefits that may be of interest to you.

### Required by Law
We may disclose your PHI when required by federal, state, or local law — including reporting of suspected abuse, neglect, or domestic violence; public health activities; and judicial or administrative proceedings.

### Health Oversight Activities
We may disclose PHI to agencies that oversee the healthcare system, such as for audits, investigations, or licensure.

### Business Associates
We may share PHI with third parties (e.g., billing services, IT vendors, records management) who perform services on our behalf under a Business Associate Agreement requiring them to safeguard your information.

## Uses and Disclosures Requiring Your Written Authorization

We will obtain your written authorization before:

- Using or disclosing PHI for **marketing purposes**
- **Selling** your PHI
- Sharing **psychotherapy notes** (where applicable)
- Using or disclosing PHI for any purpose not otherwise permitted by this Notice

You may revoke an authorization in writing at any time, except to the extent we have already acted on it.

## Your Rights Regarding Your Health Information

### Right to Inspect and Copy
You may request to inspect or receive a copy of your dental record. Requests must be in writing. We may charge a reasonable fee for copies as permitted by law.

### Right to Request Amendment
If you believe information in your record is incorrect or incomplete, you may request an amendment in writing. We may deny the request in certain circumstances; if denied, you may submit a statement of disagreement.

### Right to an Accounting of Disclosures
You may request a list of certain disclosures we have made of your PHI. This does not include disclosures for treatment, payment, operations, or disclosures you authorized. Requests must be in writing.

### Right to Request Restrictions
You may request restrictions on how we use or disclose your PHI. We are not required to agree to most restrictions, but we will honor requests to restrict disclosures to a health plan for services you paid for in full out-of-pocket.

### Right to Request Confidential Communications
You may request that we contact you at a specific phone number, address, or email. We will accommodate reasonable requests.

### Right to a Paper Copy of This Notice
You may request a paper copy of this Notice at any time, even if you have received it electronically.

### Right to Be Notified of a Breach
You have the right to be notified in the event of a breach of your unsecured PHI.

## Exercising Your Rights

To exercise any of these rights, contact our Privacy Officer:

**Privacy Officer:** {{privacy_officer_name}}
**{{practice_name}}**
{{practice_street}}
{{practice_city_state_zip}}
Phone: {{practice_phone}}
Email: {{privacy_email}}

## Complaints

If you believe your privacy rights have been violated, you may file a complaint with:

**{{practice_name}}**
Attn: Privacy Officer
{{practice_street}}
{{practice_city_state_zip}}
{{privacy_email}} | {{practice_phone}}

**or**

**U.S. Department of Health and Human Services, Office for Civil Rights**
200 Independence Avenue, S.W.
Washington, D.C. 20201
1-877-696-6775
[hhs.gov/ocr/privacy/hipaa/complaints](https://www.hhs.gov/ocr/privacy/hipaa/complaints/)

**We will not retaliate against you for filing a complaint.**

## Changes to This Notice

We reserve the right to change this Notice and make the revised Notice effective for all PHI we maintain. The revised Notice will be posted at our office and on our website with a new effective date.

## Acknowledgment of Receipt

New patients will be asked to sign an acknowledgment that they have received a copy of this Notice. If you decline to sign, we will document our good-faith effort to provide the Notice. Refusal to sign does not affect your treatment.`,
};
