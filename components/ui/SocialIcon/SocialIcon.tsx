import { forwardRef, type SVGAttributes } from 'react';
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
 * - `brand` — the platform's Foundations brand-color token, e.g.
 *   `--color-system-youtube` (brik-bds#1716). See SocialIcon.css for the
 *   full per-platform mapping — every bundled platform has one, no fallback.
 * - `accent` — Brik's brand color, `--text-brand-primary`.
 * - `inverse` — near-black, the default treatment for a monochrome social row
 *   on a light surface (brik-bds#2274). `badge` fills `--surface-inverse`;
 *   `glyph` takes `--text-on-color-light`, its context-pinned text-slot
 *   counterpart (both #1b1b1b in either theme root).
 */
export type SocialIconTone = 'grayscale' | 'brand' | 'accent' | 'inverse';

export type SocialIconSize = 'sm' | 'md' | 'lg';

// bds-lint-ignore — component-level badge dimensions. Mirrors ServiceTag's
// icon-only badge box scale (ServiceTag.css `--icon-{sm,md,lg}`; Figma/authored
// dimensions, not spacing-grid tokens) — SocialIcon is the same square-badge
// shape, so it reuses the same scale rather than inventing a parallel one.
const sizeMap: Record<SocialIconSize, number> = { sm: 20, md: 28, lg: 40 };

export interface SocialIconProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
  /** Which social mark to render. */
  platform: SocialIconPlatform;
  /** Which path carries the recolored fill. Default: `'badge'` */
  type?: SocialIconType;
  /** Recolor scheme. Default: `'grayscale'` */
  tone?: SocialIconTone;
  /** Size variant. Default: `'md'` */
  size?: SocialIconSize;
  /**
   * Accessible name. Defaults to the platform's display name (e.g.
   * "YouTube", "LinkedIn"). Override to add context (`"Follow us on
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
 * Display-name overrides for platforms `humanize` can't capitalize correctly
 * (brand-cased names) or that read better with the a.k.a. spelled out.
 * Mirrors Logo's `DISPLAY_NAMES` (`logo-config.ts`).
 */
const PLATFORM_LABELS: Partial<Record<SocialIconPlatform, string>> = {
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  twitter: 'X (Twitter)',
  tiktok: 'TikTok',
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
 * SocialIcon — recolorable social-platform mark, offline-bundled
 * (brik-bds#1713; split from contact marks in brik-bds#1716).
 *
 * Renders one of 10 platform marks — the 6 social marks (youtube, twitter,
 * instagram, facebook, linkedin, yelp) plus 4 search/review marks (google,
 * apple, bing, tiktok) — from a BDS-bundled inline set; the mark paints on first
 * render with no fetch and no possible 404, the same offline contract as
 * `ServiceTag` (`components/ui/ServiceTag/ServiceTag.tsx:159-177`). For the
 * non-platform contact marks (message, email, website, calendar, phone), use
 * `<ContactIcon>` instead — they have no brand identity, so that component
 * has no `tone="brand"`.
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
 * `tone="brand"` uses the platform's Foundations brand-color token (YouTube
 * red, X black, Facebook blue, Instagram black, LinkedIn blue, Yelp red,
 * Google blue, Apple black, Bing blue, TikTok black); every bundled platform
 * has one — see SocialIcon.css.
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
 * <SocialIcon platform="yelp" tone="accent" size="lg" />
 * // decorative — a sibling label already names the platform
 * <SocialIcon platform="twitter" decorative /> <span>Follow us on X</span>
 *
 * @summary Recolorable social-platform mark — badge or glyph, 4 tones
 */
export const SocialIcon = forwardRef<SVGSVGElement, SocialIconProps>(function SocialIcon(
  { platform, type = 'badge', tone = 'grayscale', size = 'md', label, decorative = false, className, style, ...props },
  ref,
) {
  const svg = SOCIAL_ICON_SVGS[platform];
  if (!svg) return null;

  const box = sizeMap[size];
  const accessibleName = label ?? socialIconLabel(platform);

  return (
    <svg
      ref={ref}
      focusable={false}
      className={bdsClass('bds-social-icon', `bds-social-icon--${type}`, `bds-social-icon--${tone}`, className)}
      width={box}
      height={box}
      viewBox="0 0 36 36"
      style={style}
      {...props}
      // a11y, the `data-platform` brand-token binding, and the trusted,
      // build-time-bundled markup (SocialIcon/icons/*.svg — never user input)
      // are placed after the `{...props}` spread so a caller can never
      // silently contradict `decorative`, break the `tone="brand"` CSS binding,
      // or inject markup via a raw role/aria-label/aria-hidden/data-platform/
      // dangerouslySetInnerHTML prop.
      data-platform={platform}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : accessibleName}
      aria-hidden={decorative || undefined}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
});

export default SocialIcon;
