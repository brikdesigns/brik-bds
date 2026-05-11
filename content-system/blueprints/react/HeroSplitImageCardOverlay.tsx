/**
 * HeroSplitImageCardOverlay — React renderer. Twin of
 * `../astro/HeroSplitImageCardOverlay.astro`. Interior-page hero
 * with a 58/42 split: content trail on the left
 * (breadcrumb + eyebrow + h1 + optional body + CTA), white image
 * card on the right with optional price overlay.
 *
 * Drives `/services/{cat}/{slug}` style pages.
 *
 * Composes BDS primitives per docs/COMPONENT-PATTERNS.md
 * §"Compose primitives — never reimplement them":
 *   - Breadcrumb trail → `<Breadcrumb items={...} />`
 *   - Left CTA → `<LinkButton variant="inverse">`
 *   - Price-card CTA → `<LinkButton variant="primary">`
 *
 * @summary Interior-page split hero with image card + optional price overlay.
 */
import { Breadcrumb } from '../../../components/ui/Breadcrumb/Breadcrumb';
import { LinkButton } from '../../../components/ui/Button/LinkButton';
import { ServiceTag } from '../../../components/ui/ServiceBadge/ServiceTag';
import type { BlueprintProps } from '../astro/types';
import './HeroSplitImageCardOverlay.css';

interface Props extends BlueprintProps {}

export function HeroSplitImageCardOverlay({ section }: Props) {
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
           */}
          {iconUrl ? (
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
          ) : null}

          {eyebrow && <p className="bp-hero-img-card__subtitle">{eyebrow}</p>}

          <h1 id={titleId} className="bp-hero-img-card__title">
            {headline}
          </h1>

          {lead && <p className="bp-hero-img-card__lead">{lead}</p>}

          {cta && (
            <LinkButton href={cta.url} variant="inverse" size="md">
              {cta.label}
            </LinkButton>
          )}
        </div>

        {priceCard ? (
          <aside className="bp-hero-img-card__media-card">
            <div className="bp-hero-img-card__image-frame">
              <img
                src={priceCard.imageUrl}
                alt={priceCard.imageAlt ?? ''}
                loading="eager"
                decoding="async"
                className="bp-hero-img-card__image"
              />
            </div>
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
                  <LinkButton href={priceCard.cta.url} variant="primary" size="sm">
                    {priceCard.cta.label}
                  </LinkButton>
                )}
              </div>
            )}
          </aside>
        ) : (
          <aside
            className="bp-hero-img-card__missing"
            data-content-needed="hero_image_url"
            role="presentation"
          >
            <p className="bp-hero-img-card__missing-label">
              Hero image card missing for this page.
            </p>
          </aside>
        )}
      </div>
    </section>
  );
}

export default HeroSplitImageCardOverlay;
