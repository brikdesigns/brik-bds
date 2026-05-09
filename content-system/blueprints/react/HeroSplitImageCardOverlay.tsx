/**
 * HeroSplitImageCardOverlay — React renderer. Twin of
 * `../astro/HeroSplitImageCardOverlay.astro`. Interior-page hero
 * with a 58/42 split: content trail on the left
 * (breadcrumb + eyebrow + h1 + optional body + CTA), white image
 * card on the right with optional price overlay.
 *
 * Drives `/services/{cat}/{slug}` style pages.
 *
 * @summary Interior-page split hero with image card + optional price overlay.
 */
import type { BlueprintProps } from '../astro/types';
import './HeroSplitImageCardOverlay.css';

interface Props extends BlueprintProps {}

export function HeroSplitImageCardOverlay({ section }: Props) {
  const headingId = `bp-hero-img-card-${section.sectionKey}-h`;
  const eyebrow = section.subheading;
  const headline = section.heading ?? '';
  const lead = section.body;
  const cta = section.cta;
  const breadcrumb = section.breadcrumb ?? [];
  const audience = section.audience;
  const priceCard = section.priceCard;

  return (
    <section
      className="bp-hero-img-card"
      aria-labelledby={headingId}
      data-blueprint-key="hero_split_image_card_overlay"
      data-audience={audience}
    >
      <div className="bp-hero-img-card__container">
        <div className="bp-hero-img-card__content">
          {breadcrumb.length > 0 && (
            <nav className="bp-hero-img-card__breadcrumb" aria-label="Breadcrumb">
              <ol className="bp-hero-img-card__breadcrumb-list">
                {breadcrumb.map((item, idx) => {
                  const isLast = idx === breadcrumb.length - 1;
                  return (
                    <li
                      key={`${item.label}-${idx}`}
                      className="bp-hero-img-card__breadcrumb-item"
                    >
                      {item.href && !isLast ? (
                        <a href={item.href} className="bp-hero-img-card__breadcrumb-link">
                          {item.label}
                        </a>
                      ) : (
                        <span
                          className="bp-hero-img-card__breadcrumb-current"
                          aria-current={isLast ? 'page' : undefined}
                        >
                          {item.label}
                        </span>
                      )}
                      {!isLast && (
                        <span
                          className="bp-hero-img-card__breadcrumb-sep"
                          aria-hidden="true"
                        >
                          /
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}

          {eyebrow && <p className="bp-hero-img-card__eyebrow">{eyebrow}</p>}

          <h1 id={headingId} className="bp-hero-img-card__headline">
            {headline}
          </h1>

          {lead && <p className="bp-hero-img-card__lead">{lead}</p>}

          {cta && (
            <a href={cta.url} className="bp-hero-img-card__cta">
              {cta.label}
            </a>
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
                {priceCard.priceLabel && (
                  <p className="bp-hero-img-card__price-label">
                    {priceCard.priceLabel}
                  </p>
                )}
                {priceCard.price && (
                  <p className="bp-hero-img-card__price-value">{priceCard.price}</p>
                )}
                {priceCard.cta && (
                  <a
                    href={priceCard.cta.url}
                    className="bp-hero-img-card__price-cta"
                  >
                    {priceCard.cta.label}
                  </a>
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
