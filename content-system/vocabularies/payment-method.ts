/**
 * Accepted Payments — the global, cross-industry vocabulary of payment
 * methods a business accepts at checkout.
 *
 * Single source of truth. The portal's `company_profiles.payment_types`
 * column is validated against this list at the UI layer (no DB CHECK,
 * same pattern as brand_personality / voice_tone / style_preferences).
 *
 * These values are industry-agnostic — dental practices, RV parks,
 * and small businesses all accept Cash, Visa, Apple Pay, etc. The
 * list is intentionally closed: clients pick from it, no free-text.
 *
 * Versioning: adding a new method is additive and requires a minor
 * BDS bump. Removing or renaming a method is a breaking change —
 * bump major and coordinate a soft-migration in consumers.
 *
 * Distinction from industry-specific financing:
 *   - Payment methods = how the client COLLECTS payment at point of sale
 *     (Cash, Check, Visa, CareCredit card, etc.)
 *   - Industry financing = structured financing PRODUCTS the business
 *     offers to patients/residents (CareCredit plan, Sunbit, In-House
 *     Financing, Owner Financing, etc.) — see IndustryPack.financing.
 *
 * CareCredit appears in both: it is a payment method (clients swipe
 * the card at checkout) AND a financing product (extended payment
 * plans the practice enrolls patients in). The two uses are distinct
 * and the duplication is intentional.
 */
export const PAYMENT_METHOD_VALUES = [
  'Cash',
  'Check',
  'Debit',
  'Visa',
  'Mastercard',
  'Amex',
  'Discover',
  'Apple Pay',
  'Google Pay',
  'ACH/Bank Transfer',
  'Venmo',
  'Zelle',
  'CareCredit',
  'HSA/FSA',
] as const;

export type PaymentMethod = (typeof PAYMENT_METHOD_VALUES)[number];

export const isPaymentMethod = (value: string): value is PaymentMethod =>
  (PAYMENT_METHOD_VALUES as readonly string[]).includes(value);
