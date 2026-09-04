import { forwardRef, type SVGAttributes } from 'react';
import { bdsClass, resolveRetiredProp, resolveRetiredValue } from '../../utils';
import { CONTACT_ICON_SVGS, CONTACT_ICON_PLATFORMS, type ContactIconPlatform } from './contact-icons.generated';
import './ContactIcon.css';

export type { ContactIconPlatform };
export { CONTACT_ICON_PLATFORMS };

/**
 * Which path carries the recolored fill:
 * - `badge` — background filled with the emphasis color, glyph knocked out
 *   white (as authored).
 * - `glyph` — background neutral/transparent, glyph carries the emphasis color.
 */
export type ContactIconType = 'badge' | 'glyph';

/**
 * Hue source, applied on top of `type` (ADR-033 § 2's `emphasis` axis):
 * - `neutral` — neutral `--text-muted` token (the authored look: a
 *   `#828282` mid-gray badge, white glyph).
 * - `accent` — Brik's brand color, `--text-brand-primary`.
 *
 * Contact marks (message, email, website, calendar, phone) have no brand
 * identity — unlike `SocialIcon`, there is no `emphasis="brand"` here
 * (brik-bds#1716).
 */
export type ContactIconEmphasis = 'neutral' | 'accent';

/** @deprecated Renamed `ContactIconEmphasis` (ADR-033 § 2). */
export type ContactIconTone = ContactIconEmphasis;

/**
 * ADR-033 § Retired vocabulary → Axis words retires `grayscale` in favour of
 * `neutral` on the emphasis axis. The resolved color is unchanged.
 */
const RETIRED_EMPHASIS: Record<string, ContactIconEmphasis> = {
  grayscale: 'neutral',
};

export type ContactIconSize = 'sm' | 'md' | 'lg';

// bds-lint-ignore — component-level badge dimensions. Mirrors ServiceTag's
// icon-only badge box scale (ServiceTag.css `--icon-{sm,md,lg}`; Figma/authored
// dimensions, not spacing-grid tokens) — ContactIcon is the same square-badge
// shape as its sibling SocialIcon, so it reuses the same scale rather than
// inventing a parallel one.
const sizeMap: Record<ContactIconSize, number> = { sm: 20, md: 28, lg: 40 };

export interface ContactIconProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
  /** Which contact mark to render. */
  platform: ContactIconPlatform;
  /** Which path carries the recolored fill. Default: `'badge'` */
  type?: ContactIconType;
  /** Hue source. Default: `'neutral'` */
  emphasis?: ContactIconEmphasis;
  /**
   * @deprecated Use `emphasis` instead (ADR-033 § 2); `grayscale` is now
   * `neutral`. Honoured for one minor version; `emphasis` wins when both are
   * passed.
   */
  tone?: ContactIconEmphasis | 'grayscale';
  /** Size variant. Default: `'md'` */
  size?: ContactIconSize;
  /**
   * Accessible name. Defaults to the mark's display name (e.g. "Email",
   * "Calendar"). Override to add context (`"Email us"`); prefer
   * `decorative` when an adjacent text label already names the mark.
   */
  label?: string;
  /**
   * Render decoratively — `aria-hidden`, no accessible name. Use when a
   * sibling text label already announces the mark. Default `false` —
   * `ContactIcon` is often the *only* content of an icon-only link (e.g. a
   * portal contact card), so it must carry its own accessible name unless a
   * caller opts out.
   */
  decorative?: boolean;
}

function humanize(platform: string): string {
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

/**
 * Accessible name for a contact mark — the humanized platform key. Every
 * bundled mark (message/email/website/calendar/phone) is a plain word, so
 * no display-name override table is needed (contrast `SocialIcon`'s
 * `PLATFORM_LABELS`, which corrects brand-cased platform names). Exported so
 * the default-label derivation is unit-testable without rendering.
 */
export function contactIconLabel(platform: ContactIconPlatform): string {
  return humanize(platform);
}

/**
 * ContactIcon — recolorable contact mark, offline-bundled (split from
 * `SocialIcon` in brik-bds#1716).
 *
 * Renders one of 5 contact marks (message, email, website, calendar, phone)
 * from a BDS-bundled inline set — the mark paints on first render with no
 * fetch and no possible 404, the same offline contract as `ServiceTag`
 * (`components/ui/ServiceTag/ServiceTag.tsx:159-177`). For the 6
 * social-platform marks (youtube, twitter, instagram, facebook, linkedin,
 * yelp), use `<SocialIcon>` instead — those carry a Foundations brand-color
 * token per platform (`emphasis="brand"`), which contact marks have no
 * equivalent of.
 *
 * Unlike `Logo` (multi-fill brand art that renders exactly as authored and is
 * NEVER recolored), each ContactIcon master is a two-path badge — a
 * background path and a glyph path — independently targetable so `type`
 * picks which one carries the emphasis color:
 *
 * - `type="badge"` — background filled with the emphasis color, glyph knocked
 *   out white.
 * - `type="glyph"` — background neutral/transparent, glyph carries the color.
 *
 * Renders `role="img"` + `aria-label` (the mark's display name, or `label`)
 * by default — a bare `<ContactIcon platform="email" />` is frequently the
 * only content of an icon-only link, so it must announce itself. Pass
 * `decorative` when a sibling text label already names the mark (mirrors
 * `Logo`'s `decorative`).
 *
 * @example
 * <ContactIcon platform="email" />
 * <ContactIcon platform="calendar" type="glyph" emphasis="accent" />
 * <ContactIcon platform="phone" size="lg" />
 * // decorative — a sibling label already names the mark
 * <ContactIcon platform="website" decorative /> <span>Visit our site</span>
 *
 * @summary Recolorable contact mark — badge or glyph, neutral/accent emphasis
 */
export const ContactIcon = forwardRef<SVGSVGElement, ContactIconProps>(function ContactIcon(
  { platform, type = 'badge', emphasis, tone, size = 'md', label, decorative = false, className, style, ...props },
  ref,
) {
  const svg = CONTACT_ICON_SVGS[platform];
  if (!svg) return null;

  // The prop rename and the `grayscale` → `neutral` value retirement are
  // independent migrations, so both paths run: a caller may still be on
  // `tone`, on `grayscale`, or on either one alone.
  const resolvedEmphasis =
    resolveRetiredValue(
      'ContactIcon',
      emphasis !== undefined ? 'emphasis' : 'tone',
      resolveRetiredProp('ContactIcon', 'tone', 'emphasis', tone, emphasis),
      RETIRED_EMPHASIS,
    ) ?? 'neutral';

  const box = sizeMap[size];
  const accessibleName = label ?? contactIconLabel(platform);

  return (
    <svg
      ref={ref}
      focusable={false}
      className={bdsClass(
        'bds-contact-icon',
        `bds-contact-icon--${type}`,
        `bds-contact-icon--emphasis-${resolvedEmphasis}`,
        className,
      )}
      width={box}
      height={box}
      viewBox="0 0 36 36"
      style={style}
      {...props}
      // a11y + the trusted, build-time-bundled markup (ContactIcon/icons/*.svg
      // — never user input) are placed after the `{...props}` spread so a
      // caller can never silently contradict `decorative` (or inject markup)
      // via a raw role/aria-label/aria-hidden/dangerouslySetInnerHTML prop.
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : accessibleName}
      aria-hidden={decorative || undefined}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
});

export default ContactIcon;
