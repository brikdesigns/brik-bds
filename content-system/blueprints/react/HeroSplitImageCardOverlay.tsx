/**
 * HeroSplitImageCardOverlay — React renderer. Twin of
 * `../astro/HeroSplitImageCardOverlay.astro`. Interior-page hero
 * with a 58/42 split: content trail on the left
 * (breadcrumb + eyebrow + h1 + optional body + CTA), white image
 * card on the right with optional price overlay.
 *
 * Drives `/services/{cat}/{slug}` style pages.
 *
 * Composes BDS primitives per .claude/standards/component-build.md
 * §"Compose primitives — never reimplement them":
 *   - Breadcrumb trail → `<Breadcrumb items={...} />`
 *   - Left CTA → `<Button variant="inverse">`
 *   - Price-card CTA → `<Button variant="primary">`
 *
 * @summary Interior-page split hero with image card + optional price overlay.
 */
import type { MouseEvent } from 'react';
import { Breadcrumb } from '../../../components/ui/Breadcrumb/Breadcrumb';
import { Button } from '../../../components/ui/Button';
import { Frame } from '../../../components/ui/Frame/Frame';
import type { FrameRatio } from '../../../components/ui/Frame/Frame';
import { ServiceTag } from '../../../components/ui/ServiceTag/ServiceTag';
import type { BlueprintProps } from '../astro/types';
import './HeroSplitImageCardOverlay.css';

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
  onPriceCtaClick,
}: Props) {
  const { breadcrumb = [], audience, iconUrl, iconAlt, priceCard } = section;
  const titleId = `${section.sectionKey}-title`;
  const eyebrow = section.subheading;
  const headline = section.heading ?? '';
  const lead = section.body;
  const cta = section.cta;

  return (
    <section
      className="bp-hero-img-card"
      aria-labelledby={titleId}
      data-blueprint-key="hero_split_image_card_overlay"
      data-audience={audience}
    >
      <div className="bp-hero-img-card__container">
        <div className="bp-hero-img-card__content">
          {breadcrumb.length > 0 && (
            <Breadcrumb
              className="bp-hero-img-card__breadcrumb"
              items={breadcrumb.map((item) => ({ label: item.label, href: item.href }))}
            />
          )}

          {/*
           * Eyebrow icon precedence (brik-bds#546):
           *   1. If `iconUrl` is provided, render the raw `<img>` (legacy /
           *      decorative-image escape hatch).
           *   2. Otherwise, if `audience` is set, render the canonical
           *      `<ServiceTag>` for that audience — the design-system path.
           *      Consumers stop supplying `iconUrl` for category badges; the
           *      blueprint resolves the icon via BDS's service-token system,
           *      keeping theme awareness intact.
           *   3. If neither is set, no eyebrow renders.
           *
           * `showServiceTag={false}` suppresses this whole slot while leaving
           * `data-audience` theming intact (brik-bds#871).
           */}
          {showServiceTag &&
            (iconUrl ? (
              <img
                src={iconUrl}
                alt={iconAlt ?? ''}
                className="bp-hero-img-card__icon"
                loading="eager"
                decoding="async"
              />
            ) : audience ? (
              <ServiceTag
                category={audience}
                variant="icon"
                size="lg"
                className="bp-hero-img-card__icon"
              />
            ) : null)}

          {eyebrow && <p className="bp-hero-img-card__subtitle">{eyebrow}</p>}

          <h1 id={titleId} className="bp-hero-img-card__title">
            {headline}
          </h1>

          {lead && <p className="bp-hero-img-card__lead">{lead}</p>}

          {cta && (
            <Button href={cta.url} variant="inverse" size="md">
              {cta.label}
            </Button>
          )}
        </div>

        {priceCard ? (
          <aside className="bp-hero-img-card__media-card">
            <Frame ratio={imageRatio} className="bp-hero-img-card__image-frame">
              <img
                src={priceCard.imageUrl}
                alt={priceCard.imageAlt ?? ''}
                loading="eager"
                decoding="async"
                className="bp-hero-img-card__image"
              />
            </Frame>
            {(priceCard.priceLabel || priceCard.price || priceCard.cta) && (
              <div className="bp-hero-img-card__price">
                {priceCard.priceLabel && priceCard.price && (
                  <p className="bp-hero-img-card__price-label">
                    {priceCard.priceLabel}
                  </p>
                )}
                {priceCard.price && (
                  <p className="bp-hero-img-card__price-value">{priceCard.price}</p>
                )}
                {priceCard.cta && (
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
                )}
              </div>
            )}
          </aside>
        ) : (
          <Frame
            ratio={imageRatio}
            as="aside"
            className="bp-hero-img-card__missing"
            data-content-needed="hero_image_url"
            role="presentation"
          >
            <p className="bp-hero-img-card__missing-label">
              Hero image card missing for this page.
            </p>
          </Frame>
        )}
      </div>
    </section>
  );
}

export default HeroSplitImageCardOverlay;
