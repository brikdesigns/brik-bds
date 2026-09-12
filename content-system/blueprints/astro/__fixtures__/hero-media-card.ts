/**
 * Fixture props for the pre-rendered `HeroMediaCard` / `HeroMediaCardImage` /
 * `HeroMediaCardPrice` partials (ADR-039, brik-bds#2312). These three are
 * presentational hero sub-parts `Hero.astro`'s `with-pricing-card` layout
 * composes for its right-hand column — not a dispatched blueprint (no
 * `blueprintKey`), so they render via a dedicated fixture rather than
 * `sections.ts`'s per-block section shapes, following the `SiteHeader`
 * precedent in `scripts/render-astro-blueprints.mjs`.
 *
 * Mirrors the React twins' `Default` stories (`../react/HeroMediaCard*.
 * stories.tsx`) so the two rails render the same populated content —
 * divergence here would hide divergence in the rail.
 *
 * Consumed by `scripts/render-astro-blueprints.mjs` in Node, never by a story
 * directly — `astro/container` cannot run in the browser bundle.
 *
 * Keep this file fixture-only: no rendering, no framework imports.
 */
import { placeholderImage } from '../../react/_fixtures';

export const HERO_MEDIA_CARD_IMAGE_FIXTURE = {
  src: placeholderImage(320, 320, '#eaf1fb', '#1f3d70', 'Hero'),
  alt: '',
  ratio: 'square' as const,
};

export const HERO_MEDIA_CARD_PRICE_FIXTURE = {
  label: 'Starting at',
  value: '$99/mo',
};

/**
 * Raw CTA markup composed as `HeroMediaCardPrice`'s slotted child — the same
 * link-CTA shape `Hero.astro`'s `with-pricing-card` layout composes, and the
 * same button the React twin's `Default` story renders via `<Button>`.
 */
export const HERO_MEDIA_CARD_CTA_HTML =
  '<a href="#start" class="bds-button bds-button--primary bds-button--sm"><span class="bds-button__content">Get started</span></a>';

export const HERO_MEDIA_CARD_MISSING_FIXTURE = {
  ratio: 'square' as const,
  missing: { label: 'Hero image card missing for this page.' },
};
