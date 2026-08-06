/**
 * @token-exempt — BRAND_COLORS below is a per-platform flat brand-hex map
 * (Simple Icons, cited per entry), not a BDS design token. `tone="brand"`
 * is explicitly a third-party-brand-identity axis (YouTube red, Facebook
 * blue, …) — brik-bds#1713 directs a component-local constant map here,
 * same reason `Logo` renders un-tokenized brand art as authored.
 */
import { forwardRef, type CSSProperties, type SVGAttributes } from 'react';
import { bdsClass } from '../../utils';
import { SOCIAL_ICON_SVGS, SOCIAL_ICON_PLATFORMS, type SocialIconPlatform } from './social-icons.generated';
import './SocialIcon.css';

export type { SocialIconPlatform };
export { SOCIAL_ICON_PLATFORMS };

/**
 * Which path carries the recolored fill:
 * - `badge` — background filled with the tone's color, glyph knocked out white
 *   (as authored).
 * - `glyph` — background neutral/transparent, glyph carries the tone's color.
 */
export type SocialIconType = 'badge' | 'glyph';

/**
 * Recolor scheme, applied on top of `type`:
 * - `grayscale` — neutral `--text-muted` token (the authored look: a
 *   `#828282` mid-gray badge, white glyph).
 * - `brand` — the platform's flat brand color. Non-platform marks (`message`,
 *   `email`, `website`, `calendar`, `phone`) have no brand color and fall back
 *   to the `grayscale` neutral.
 * - `accent` — Brik's brand color, `--text-brand-primary`.
 */
export type SocialIconTone = 'grayscale' | 'brand' | 'accent';

export type SocialIconSize = 'sm' | 'md' | 'lg';

// bds-lint-ignore — component-level badge dimensions. Mirrors ServiceTag's
// icon-only badge box scale (ServiceTag.css `--icon-{sm,md,lg}`; Figma/authored
// dimensions, not spacing-grid tokens) — SocialIcon is the same square-badge
// shape, so it reuses the same scale rather than inventing a parallel one.
const sizeMap: Record<SocialIconSize, number> = { sm: 20, md: 28, lg: 40 };

export interface SocialIconProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
  /** Which social/contact mark to render. */
  platform: SocialIconPlatform;
  /** Which path carries the recolored fill. Default: `'badge'` */
  type?: SocialIconType;
  /** Recolor scheme. Default: `'grayscale'` */
  tone?: SocialIconTone;
  /** Size variant. Default: `'md'` */
  size?: SocialIconSize;
  /**
   * Accessible name. Defaults to the platform's display name (e.g.
   * "YouTube", "LinkedIn", "Email"). Override to add context (`"Follow us on
   * YouTube"`); prefer `decorative` when an adjacent text label already names
   * the platform.
   */
  label?: string;
  /**
   * Render decoratively — `aria-hidden`, no accessible name. Use when a
   * sibling text label already announces the platform. Default `false` —
   * unlike `ServiceTag` (which always renders visible sibling text),
   * `SocialIcon` is often the *only* content of an icon-only link (e.g. a
   * portal Social card), so it must carry its own accessible name unless a
   * caller opts out.
   */
  decorative?: boolean;
}

/**
 * Brand hex per platform — flat brand color, sourced from Simple Icons
 * (https://simpleicons.org), cited per-platform below. Non-platform marks
 * (message/email/website/calendar/phone) have no brand identity and are
 * intentionally absent — `tone="brand"` falls back to the neutral
 * `--text-muted` token for them (see SocialIcon.css).
 */
const BRAND_COLORS: Partial<Record<SocialIconPlatform, string>> = {
  youtube: '#FF0000', // https://simpleicons.org/icons/youtube.svg
  facebook: '#1877F2', // https://simpleicons.org/icons/facebook.svg
  linkedin: '#0A66C2', // https://simpleicons.org/icons/linkedin.svg
  instagram: '#E4405F', // https://simpleicons.org/icons/instagram.svg
  twitter: '#000000', // https://simpleicons.org/icons/x.svg (a.k.a. X / Twitter)
};

/**
 * Display-name overrides for platforms `humanize` can't capitalize correctly
 * (brand-cased names) or that read better with the a.k.a. spelled out.
 * Mirrors Logo's `DISPLAY_NAMES` (`logo-config.ts`).
 */
const PLATFORM_LABELS: Partial<Record<SocialIconPlatform, string>> = {
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  twitter: 'X (Twitter)',
};

function humanize(platform: string): string {
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

/**
 * Accessible name for a platform — the `PLATFORM_LABELS` override or the
 * humanized platform key. Exported (like ServiceTag's `resolveServiceIcon`)
 * so the default-label derivation is unit-testable without rendering.
 */
export function socialIconLabel(platform: SocialIconPlatform): string {
  return PLATFORM_LABELS[platform] ?? humanize(platform);
}

/**
 * SocialIcon — recolorable social + contact mark, offline-bundled (brik-bds#1713).
 *
 * Renders one of 10 platform marks (message, youtube, twitter, instagram,
 * facebook, linkedin, email, website, calendar, phone) from a BDS-bundled
 * inline set — the mark paints on first render with no fetch and no possible
 * 404, the same offline contract as `ServiceTag`
 * (`components/ui/ServiceTag/ServiceTag.tsx:159-177`).
 *
 * Unlike `Logo` (multi-fill brand art that renders exactly as authored and is
 * NEVER recolored), each SocialIcon master is a two-path badge — a background
 * path and a glyph path — independently targetable so `type` picks which one
 * carries the tone's color:
 *
 * - `type="badge"` — background filled with the tone color, glyph knocked out
 *   white.
 * - `type="glyph"` — background neutral/transparent, glyph carries the color.
 *
 * `tone="brand"` uses the platform's flat brand color (YouTube red, Facebook
 * blue, LinkedIn blue, Instagram pink/red, X black); non-platform marks have
 * no brand identity and fall back to the `grayscale` neutral.
 *
 * Renders `role="img"` + `aria-label` (the platform's display name, or
 * `label`) by default — a bare `<SocialIcon platform="twitter" />` is
 * frequently the only content of an icon-only link, so it must announce
 * itself. Pass `decorative` when a sibling text label already names the
 * platform (mirrors `Logo`'s `decorative`).
 *
 * @example
 * <SocialIcon platform="youtube" />
 * <SocialIcon platform="linkedin" type="glyph" tone="brand" />
 * <SocialIcon platform="email" tone="accent" size="lg" />
 * // decorative — a sibling label already names the platform
 * <SocialIcon platform="twitter" decorative /> <span>Follow us on X</span>
 *
 * @summary Recolorable social + contact mark — badge or glyph, 3 tones
 */
export const SocialIcon = forwardRef<SVGSVGElement, SocialIconProps>(function SocialIcon(
  { platform, type = 'badge', tone = 'grayscale', size = 'md', label, decorative = false, className, style, ...props },
  ref,
) {
  const svg = SOCIAL_ICON_SVGS[platform];
  if (!svg) return null;

  const box = sizeMap[size];
  const brandColor = tone === 'brand' ? BRAND_COLORS[platform] : undefined;
  const accessibleName = label ?? socialIconLabel(platform);

  return (
    <svg
      ref={ref}
      focusable={false}
      className={bdsClass('bds-social-icon', `bds-social-icon--${type}`, `bds-social-icon--${tone}`, className)}
      width={box}
      height={box}
      viewBox="0 0 36 36"
      style={{
        ...style,
        ...(brandColor ? ({ '--bds-social-icon-brand': brandColor } as CSSProperties) : {}),
      }}
      {...props}
      // a11y + the trusted, build-time-bundled markup (SocialIcon/icons/*.svg
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

export default SocialIcon;
