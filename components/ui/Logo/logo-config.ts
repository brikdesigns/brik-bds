/**
 * Shared Logo domain config — sets, name unions, and label/key helpers
 * consumed by Logo. The SVG registry + per-set name tuples are generated from
 * `assets/logo-*.svg` into `logos.generated.ts` (run `npm run gen:logos`); this
 * file adds the public vocabulary and the human-readable label overrides.
 */

import {
  CREDIT_CARD_LOGOS,
  INTEGRATION_LOGOS,
  CLIENT_LOGOS,
} from './logos.generated';

/**
 * Logo set — the three curated families of bundled brand marks.
 *
 * - `credit-card` — payment marks (Visa, Mastercard, Stripe, …)
 * - `integration` — third-party product logos (Google, Notion, Figma, …)
 * - `client` — per-onboarded-client marks for tracking client work
 *
 * Per-tenant client logos uploaded at runtime are NOT a set — pass those as a
 * `src` URL through `Image` / `Avatar`. The `client` set holds only marks
 * bundled into BDS for internal reference.
 */
export type LogoSet = 'credit-card' | 'integration' | 'client';

/** Square footprint, keyed to the shared Avatar / Card-media scale. */
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

export type CreditCardLogo = (typeof CREDIT_CARD_LOGOS)[number];
export type IntegrationLogo = (typeof INTEGRATION_LOGOS)[number];
export type ClientLogo = (typeof CLIENT_LOGOS)[number];

/** Filename prefix per set — the key into the generated `LOGO_SVGS` registry. */
const SET_PREFIX: Record<LogoSet, string> = {
  'credit-card': 'cc',
  integration: 'third-party',
  client: 'client',
};

/** Registry key for a (set, name) pair — e.g. `('credit-card', 'visa') → 'cc-visa'`. */
export function logoKey(set: LogoSet, name: string): string {
  return `${SET_PREFIX[set]}-${name}`;
}

/**
 * Human-readable brand names for the marks whose slug doesn't title-case
 * cleanly. Everything else falls back to `humanize()`. Used for the accessible
 * name (`aria-label`), so it must read as the brand a sighted user sees.
 */
const DISPLAY_NAMES: Record<string, string> = {
  'cc-amex': 'American Express',
  'cc-apple-pay': 'Apple Pay',
  'cc-diners-club': 'Diners Club',
  'cc-google-pay': 'Google Pay',
  'cc-paypal': 'PayPal',
  'third-party-gdrive': 'Google Drive',
  'third-party-ghl': 'GoHighLevel',
  'third-party-vscode': 'VS Code',
  'third-party-wordpress': 'WordPress',
};

function humanize(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Accessible brand name for a logo — the `DISPLAY_NAMES` override or humanized slug. */
export function logoLabel(set: LogoSet, name: string): string {
  return DISPLAY_NAMES[logoKey(set, name)] ?? humanize(name);
}
