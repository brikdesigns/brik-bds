/**
 * Features3ColBrandedDark — React renderer for the
 * `features_3col_branded_dark` blueprint. Dark section, 3-column grid
 * of cards filled with per-card brand colors via `data-audience`
 * scope binding. Drives brikdesigns.com's "Other Service Lines"
 * cross-sell module on `/services/{slug}` pages.
 *
 * Astro twin lives at `../astro/Features3ColBrandedDark.astro` and
 * mirrors the same DOM shape with the same `data-audience` attributes
 * — the consumer site's `[data-audience='X']` cascade rules drive
 * both renderers identically.
 *
 * Contract: BlueprintProps. Per-card data on `section.items[]`; each
 * item carries an `audience` slug that emits `data-audience` on the
 * card, re-binding `--brand-primary` for that subtree.
 *
 * ## Audience scope binding
 *
 * BDS ships the pattern, not the audience-specific values. The
 * consumer (brikdesigns.com) defines `[data-audience='brand']`,
 * `[data-audience='marketing']`, etc. in its globals.css with the
 * matching service-line color tokens. Without those rules in place,
 * cards render in the global brand color and the visual collapses to
 * "three identical cards" — not a renderer bug, a missing-cascade bug
 * on the consumer side.
 *
 * Storybook demonstrates the pattern via a stories-only cascade block.
 *
 * CSS custom properties — variation API:
 *   --bp-features-branded-dark-bg          (default: var(--page-inverse))
 *   --bp-features-branded-dark-card-radius (default: var(--border-radius-lg))
 *   --bp-features-branded-dark-gap         (default: var(--gap-lg))
 *   --bp-features-branded-dark-image-pad   (default: var(--padding-xl))
 *   --bp-features-branded-dark-hover-scale (default: 1.02 — set to 1 to disable)
 *
 * a11y: section uses h2 + aria-labelledby; cards are an unordered
 * list with role="list"; card title is h3. Card title uses
 * `--font-weight-bold` and 18px to clear AA on saturated brand
 * backgrounds; description uses 16px regular to clear at the
 * large-text 3:1 threshold (BDS contrast burndown #40 — full
 * resolution requires brand-color adjustment, tracked separately).
 *
 * @summary Dark section, 3-col grid of brand-colored cards (per-audience scope binding).
 */
import { Card, ServiceTag, Stack, type ServiceCategory } from '../../../components';

import type { BlueprintProps } from '../astro/types';
import './Features3ColBrandedDark.css';

interface Props extends BlueprintProps {}

export function Features3ColBrandedDark({ section }: Props) {
  const headingId = `bp-features-branded-dark-${section.sectionKey}-h`;

  return (
    <section
      className="bp-features-branded-dark"
      data-blueprint-key="features_3col_branded_dark"
      aria-labelledby={section.heading ? headingId : undefined}
    >
      <div className="bp-features-branded-dark__container">
        {(section.heading || section.subheading || section.body) && (
          <Stack
            as="header"
            gap="md"
            className="bp-features-branded-dark__header"
          >
            {section.subheading && (
              <p className="bp-features-branded-dark__eyebrow">
                {section.subheading}
              </p>
            )}
            {section.heading && (
              <h2
                id={headingId}
                className="bp-features-branded-dark__heading"
              >
                {section.heading}
              </h2>
            )}
            {section.body && (
              <p className="bp-features-branded-dark__lead">{section.body}</p>
            )}
          </Stack>
        )}

        <ul className="bp-features-branded-dark__grid" role="list">
          {section.items.map((item, idx) => {
            const audience = item.audience ?? null;
            return (
              <li
                key={`${section.sectionKey}-${idx}`}
                className="bp-features-branded-dark__item"
              >
                <Card
                  variant="outlined"
                  padding="none"
                  className="bp-features-branded-dark__card"
                  data-audience={audience ?? undefined}
                >
                  <a
                    className="bp-features-branded-dark__card-link"
                    href={item.href ?? '#'}
                  >
                    <div className="bp-features-branded-dark__media">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.imageAlt ?? ''}
                          className="bp-features-branded-dark__image"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : audience ? (
                        <span
                          className="bp-features-branded-dark__image-fallback"
                          aria-hidden="true"
                        >
                          <ServiceTag
                            category={audience as ServiceCategory}
                            variant="icon"
                            size="lg"
                            serviceName={item.title}
                          />
                        </span>
                      ) : (
                        <span
                          className="bp-features-branded-dark__image-fallback bp-features-branded-dark__image-fallback--blank"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className="bp-features-branded-dark__body">
                      <h3 className="bp-features-branded-dark__title">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="bp-features-branded-dark__description">
                          {item.description}
                        </p>
                      )}
                      <span className="bp-features-branded-dark__cta">
                        Learn more
                        <span
                          aria-hidden="true"
                          className="bp-features-branded-dark__cta-arrow"
                        >
                          →
                        </span>
                      </span>
                    </div>
                  </a>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default Features3ColBrandedDark;
