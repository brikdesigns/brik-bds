/**
 * HeroSplitImageCardOverlay — Phase D adapter (deprecated direct path).
 *
 * After brik-bds#1165 the canonical primitive is `<Hero>` (the `bds-hero`
 * section block, `with-pricing-card` layout). This file remains as an adapter
 * so the legacy `hero_split_image_card_overlay` blueprint key keeps
 * dispatching through `BlueprintDispatcher` with the same section-data
 * contract — and so the two brikdesigns.com consumers
 * (`ServiceHeroModal` / `PlanHeroModal`) that import it via
 * `ComponentProps<typeof HeroSplitImageCardOverlay>` keep working unchanged.
 *
 * It maps `section.*` → `<Hero layout="with-pricing-card">` props, composing:
 *   - the breadcrumb trail   → `<Breadcrumb>` (the `breadcrumb` slot)
 *   - the eyebrow icon       → decorative node / raw <img> / `<ServiceTag>`
 *                              (the `eyebrow` slot, precedence per #849/#546)
 *   - the media column       → the `aside` price card (<Frame> image + optional
 *                              price overlay + price CTA), or a
 *                              `data-content-needed` stub when `priceCard` is
 *                              absent (CI grep on `dist/` blocks publish).
 * `data-audience` is forwarded to `<Hero>` to drive the service-token cascade.
 *
 * New consumers should compose `<Hero layout="with-pricing-card" …>` directly.
 * This adapter retires alongside Phase E.
 *
 * @deprecated Use `<Hero layout="with-pricing-card">` directly.
 * @summary Legacy adapter — section + priceCard → `<Hero layout="with-pricing-card">`.
 */
import type { MouseEvent, ReactNode } from 'react';

import { Breadcrumb } from '../../../components/ui/Breadcrumb/Breadcrumb';
import { Button } from '../../../components/ui/Button';
import { Frame } from '../../../components/ui/Frame/Frame';
import type { FrameRatio } from '../../../components/ui/Frame/Frame';
import { ServiceTag } from '../../../components/ui/ServiceTag/ServiceTag';
import type { BlueprintProps } from '../astro/types';
import { isActionCta } from '../astro/types';
import { Hero } from './Hero';

interface Props extends BlueprintProps {
  imageRatio?: FrameRatio;
  /**
   * When false, suppresses the eyebrow icon slot (raw `iconUrl` image or the
   * audience-driven `<ServiceTag>`) while keeping `audience` driving the
   * hero's `data-audience` theming. Default true — the tag still renders when
   * the prop is absent. (brik-bds#871)
   */
  showServiceTag?: boolean;
  /**
   * Decorative eyebrow icon as a rendered node — pass an SVG component or a
   * pre-configured `<Image>`. Takes precedence over `iconUrl` and the
   * `audience` `<ServiceTag>`. Rendered inside an `aria-hidden` wrapper so
   * purely-decorative art carries no `img`/`alt` semantics (brik-bds#849).
   * React-only, like `onPriceCtaClick` — Astro blueprints can't pass a node.
   */
  icon?: ReactNode;
  /**
   * Optional handler for the price-card CTA. When provided, the CTA's click is
   * intercepted (`preventDefault` + handler invoked) so consumers can trigger
   * an in-page action — e.g. open a modal — instead of navigating. The
   * `priceCard.cta.url` stays as the rendered `href`, so it remains a working
   * no-JS / SEO fallback (progressive enhancement). Astro-rendered blueprints
   * never receive this prop and keep their plain-anchor behavior. (brik-bds#843)
   */
  onPriceCtaClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export function HeroSplitImageCardOverlay({
  section,
  imageRatio = 'square',
  showServiceTag = true,
  icon,
  onPriceCtaClick,
}: Props) {
  const { breadcrumb = [], audience, iconUrl, iconAlt, priceCard } = section;

  const breadcrumbNode =
    breadcrumb.length > 0 ? (
      <Breadcrumb
        className="bds-hero__breadcrumb"
        items={breadcrumb.map((item) => ({ label: item.label, href: item.href }))}
      />
    ) : undefined;

  /*
   * Eyebrow icon precedence:
   *   1. `icon` (a rendered node) → render inside an `aria-hidden` wrapper —
   *      decorative SVG/Image, no img/alt semantics (brik-bds#849). React-only.
   *   2. `iconUrl` → raw `<img>` (legacy / decorative-image escape hatch, #546).
   *   3. `audience` set → canonical `<ServiceTag>` — the design-system path.
   *   4. none → no eyebrow.
   * `showServiceTag={false}` suppresses the whole slot while leaving
   * `data-audience` theming intact (brik-bds#871).
   */
  const eyebrowNode = showServiceTag
    ? icon
      ? (
          <span className="bds-hero__icon-slot" aria-hidden="true">
            {icon}
          </span>
        )
      : iconUrl
        ? (
            <img
              src={iconUrl}
              alt={iconAlt ?? ''}
              className="bds-hero__icon"
              loading="eager"
              decoding="async"
            />
          )
        : audience
          ? (
              <ServiceTag
                category={audience}
                variant="icon"
                size="lg"
                className="bds-hero__icon"
              />
            )
          : undefined
    : undefined;

  const media = priceCard ? (
    <aside className="bds-hero__media-card">
      <Frame ratio={imageRatio} className="bds-hero__image-frame">
        <img
          src={priceCard.imageUrl}
          alt={priceCard.imageAlt ?? ''}
          loading="eager"
          decoding="async"
          className="bds-hero__image"
        />
      </Frame>
      {(priceCard.priceLabel || priceCard.price || priceCard.cta) && (
        <div className="bds-hero__price">
          {priceCard.priceLabel && priceCard.price && (
            <p className="bds-hero__price-label">{priceCard.priceLabel}</p>
          )}
          {priceCard.price && (
            <p className="bds-hero__price-value">{priceCard.price}</p>
          )}
          {priceCard.cta &&
            (isActionCta(priceCard.cta) ? (
              // Action CTA (#941): the config carries its own handler, so
              // render a real <button> — no href, no fallback navigation.
              <Button
                onClick={priceCard.cta.onClick}
                variant="primary"
                size={priceCard.cta.size ?? 'sm'}
              >
                {priceCard.cta.label}
              </Button>
            ) : (
              <Button
                href={priceCard.cta.url}
                variant="primary"
                size={priceCard.cta.size ?? 'sm'}
                onClick={
                  onPriceCtaClick
                    ? (event) => {
                        // Progressive enhancement: with JS, suppress the
                        // anchor navigation and hand off to the consumer's
                        // handler (e.g. open a modal). Without JS, the
                        // `href` still navigates. (brik-bds#843)
                        event.preventDefault();
                        onPriceCtaClick(event);
                      }
                    : undefined
                }
              >
                {priceCard.cta.label}
              </Button>
            ))}
        </div>
      )}
    </aside>
  ) : (
    <Frame
      ratio={imageRatio}
      as="aside"
      className="bds-hero__missing"
      data-content-needed="hero_image_url"
      role="presentation"
    >
      <p className="bds-hero__missing-label">
        Hero image card missing for this page.
      </p>
    </Frame>
  );

  return (
    <Hero
      layout="with-pricing-card"
      sectionKey={section.sectionKey}
      title={section.heading ?? ''}
      subtitle={section.subheading ?? undefined}
      lead={section.body ?? undefined}
      cta={section.cta ?? undefined}
      ctaVariant="inverse"
      breadcrumb={breadcrumbNode}
      eyebrow={eyebrowNode}
      media={media}
      data-audience={audience}
      data-blueprint-key="hero_split_image_card_overlay"
    />
  );
}

export default HeroSplitImageCardOverlay;
