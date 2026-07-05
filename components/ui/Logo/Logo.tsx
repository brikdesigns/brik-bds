import { type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import { LOGO_SVGS } from './logos.generated';
import {
  logoKey,
  logoLabel,
  type LogoSize,
  type CreditCardLogo,
  type IntegrationLogo,
  type ClientLogo,
} from './logo-config';
import './Logo.css';

export type {
  LogoSet,
  LogoSize,
  CreditCardLogo,
  IntegrationLogo,
  ClientLogo,
} from './logo-config';

interface LogoBaseProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * Square footprint, keyed to the shared Avatar / Card-media scale
   * (`sm` 32 · `md` 40 · `lg` 48 · `xl` 64). The mark is centered and scaled
   * to *contain* — wide payment cards letterbox, square product marks fill.
   * Default `md`.
   */
  size?: LogoSize;
  /**
   * Accessible name. Defaults to the brand name (e.g. "Visa", "Google Drive").
   * Override to add context (`"Paid with Visa"`); prefer `decorative` when an
   * adjacent text label already names the brand.
   */
  label?: string;
  /**
   * Render decoratively — `aria-hidden`, no accessible name. Use when a
   * sibling text label already announces the brand, so screen readers don't
   * hear it twice.
   */
  decorative?: boolean;
}

/**
 * Discriminated on `set` so `name` only accepts marks that exist in that set —
 * `<Logo set="credit-card" name="visa" />` compiles, `name="notion"` does not.
 */
export type LogoProps =
  | ({ set: 'credit-card'; name: CreditCardLogo } & LogoBaseProps)
  | ({ set: 'integration'; name: IntegrationLogo } & LogoBaseProps)
  | ({ set: 'client'; name: ClientLogo } & LogoBaseProps);

/**
 * Logo — full-color third-party / client brand mark from a bundled registry.
 *
 * @summary Full-color brand logo (credit-card / integration / client), never recolored
 *
 * Renders one of the curated brand marks bundled at build time (`assets/
 * logo-*.svg` → `logos.generated.ts`), so it resolves synchronously with no
 * runtime fetch — the same offline contract as `<Icon>`, but for multi-fill
 * brand art. Unlike `<Icon>` (monochrome, `currentColor`-recolorable) and
 * `ServiceTag` (mask-recolored), a `<Logo>` renders **exactly as authored** —
 * brand guidelines own the color, so nothing here recolors it.
 *
 * Drops into any square media slot at the shared size scale — Card `media`,
 * `TableLogoCell`, or the Card `logo` slot.
 *
 * @example
 * ```tsx
 * <Logo set="credit-card" name="visa" />
 * <Logo set="integration" name="notion" size="lg" />
 * // decorative — a sibling label already names the brand
 * <Logo set="integration" name="stripe" decorative /> <span>Stripe</span>
 * ```
 */
export function Logo({
  set,
  name,
  size = 'md',
  label,
  decorative = false,
  className,
  ...spanProps
}: LogoProps) {
  const svg = LOGO_SVGS[logoKey(set, name)];

  // Unreachable for typed callers (the union constrains `name`); guards JS
  // consumers passing an unknown name — hide rather than render an empty box.
  if (!svg) return null;

  const accessibleName = label ?? logoLabel(set, name);

  return (
    <span
      className={bdsClass('bds-logo', `bds-logo--${size}`, className)}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : accessibleName}
      aria-hidden={decorative || undefined}
      // Trusted, build-time-bundled markup from assets/logo-*.svg — never
      // user input. Inlined (not <img src>) so the mark paints on first render
      // with no network and stays crisp at any size.
      dangerouslySetInnerHTML={{ __html: svg }}
      {...spanProps}
    />
  );
}

export default Logo;
