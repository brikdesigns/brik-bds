export { Logo, default } from './Logo';
export type {
  LogoProps,
  LogoSet,
  LogoSize,
  CreditCardLogo,
  IntegrationLogo,
  ClientLogo,
} from './Logo';

// Domain config — re-exported for consumers building their own logo pickers.
export { logoKey, logoLabel } from './logo-config';
export { CREDIT_CARD_LOGOS, INTEGRATION_LOGOS, CLIENT_LOGOS } from './logos.generated';
