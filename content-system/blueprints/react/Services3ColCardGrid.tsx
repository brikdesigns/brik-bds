/**
 * Services3ColCardGrid — React renderer for the
 * `services_3col_card_grid` blueprint. Composes BDS primitives
 * (`Card`, `ServiceTag`, `LinkButton`, `Badge`, `Stack`, `Grid`,
 * `Frame`) per the spec at
 * `blueprints/proposals/services_3col_card_grid.md`.
 *
 * Drives brikdesigns.com service-line index pages (e.g.
 * `/services/information`). Astro twin lives at
 * `../astro/Services3ColCardGrid.astro` and ships a simplified visual
 * for non-React consumers — see that file's header for parity notes.
 *
 * Contract: BlueprintProps. The same shape every blueprint renderer
 * accepts. Per-card data comes from `section.items[]`; richer fields
 * (`href`, `imageUrl`, `category`, `hasOptions`) are optional extensions
 * to the items shape and degrade cleanly when absent.
 *
 * CSS custom properties — variation API:
 *   --bp-services-grid-bg            (default: var(--page-primary))
 *   --bp-services-grid-card-bg       (default: var(--surface-primary))
 *   --bp-services-grid-card-radius   (default: var(--border-radius-md))
 *   --bp-services-grid-gap           (default: var(--gap-lg))
 *   --bp-services-grid-image-bg      (default: var(--surface-secondary))
 *   --bp-services-grid-hover-lift    (default: 0 — set to 1 for lift)
 *
 * Atmosphere CSS files MUST NOT override `--surface-*`/`--text-*`/
 * `--border-*` per the cascade rules — those stay theme-layer.
 *
 * a11y: section is a `<section>` with aria-labelledby pointing at the
 * h2; cards are an unordered list with `role="list"` (CSS resets
 * sometimes strip role from styled `<ul>`); each card title is an h3.
 * Description copy uses `--text-primary` to clear AA at body sizes
 * (BDS contrast burndown #40).
 *
 * @summary 3-column service card grid with top illustration, badge, name, description, "Learn more".
 */
import { type CSSProperties } from 'react';

import {
  Badge,
  Card,
  Frame,
  Grid,
  LinkButton,
  ServiceTag,
  Stack,
  type ServiceCategory,
} from '../../../components';

import type { BlueprintProps } from '../astro/types';
import './Services3ColCardGrid.css';

interface Props extends BlueprintProps {}

/**
 * Services3ColCardGrid — 3-column service card grid blueprint renderer.
 *
 * Renders each `section.items[]` entry as a service card with optional
 * top image (3:2), service-line badge, h3 title, body description,
 * and ghost "Learn more" link. The "Has Options" pill anchors
 * top-right of the media when `item.hasOptions` is true.
 *
 * @example
 * ```tsx
 * <Services3ColCardGrid section={section} clientFacts={facts} theme={theme} />
 * ```
 */
export function Services3ColCardGrid({ section }: Props) {
  const headingId = `bp-services-grid-${section.sectionKey}-h`;

  return (
    <section
      className="bp-services-grid"
      aria-labelledby={headingId}
      data-blueprint-key="services_3col_card_grid"
    >
      <div className="bp-services-grid__container">
        <Stack
          as="header"
          gap="md"
          className="bp-services-grid__header"
        >
          {section.subheading && (
            <p className="bp-services-grid__eyebrow">{section.subheading}</p>
          )}
          <h2 id={headingId} className="bp-services-grid__heading">
            {section.heading}
          </h2>
          {section.body && (
            <p className="bp-services-grid__lead">{section.body}</p>
          )}
        </Stack>

        <Grid
          as="ul"
          columns={3}
          gap="lg"
          className="bp-services-grid__list"
          role="list"
        >
          {section.items.map((item, idx) => {
            const category = (item.category ?? null) as ServiceCategory | null;
            return (
              <li
                key={`${section.sectionKey}-${idx}`}
                className="bp-services-grid__item"
              >
                <Card
                  variant="outlined"
                  padding="none"
                  className="bp-services-grid__card"
                >
                  <div className="bp-services-grid__media-wrap">
                    <Frame
                      customRatio="3 / 2"
                      fit="cover"
                      className="bp-services-grid__media"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        category && (
                          <span
                            className="bp-services-grid__media-fallback"
                            aria-hidden="true"
                          >
                            <ServiceTag
                              category={category}
                              variant="icon"
                              size="lg"
                              serviceName={item.title}
                            />
                          </span>
                        )
                      )}
                    </Frame>
                    {item.hasOptions && (
                      <span className="bp-services-grid__has-options">
                        <Badge status="positive" size="sm" appearance="solid">
                          Has Options
                        </Badge>
                      </span>
                    )}
                  </div>

                  <Stack
                    gap="md"
                    className="bp-services-grid__body"
                  >
                    {category && (
                      <ServiceTag
                        category={category}
                        variant="icon-text"
                        size="sm"
                        serviceName={item.title}
                      />
                    )}
                    <h3 className="bp-services-grid__title">{item.title}</h3>
                    {item.description && (
                      <p className="bp-services-grid__description">
                        {item.description}
                      </p>
                    )}
                    {item.href && (
                      <div className="bp-services-grid__cta-row">
                        <LinkButton
                          href={item.href}
                          variant="ghost"
                          size="sm"
                          iconAfter={
                            <span aria-hidden="true" style={ARROW_STYLE}>
                              →
                            </span>
                          }
                        >
                          Learn more
                        </LinkButton>
                      </div>
                    )}
                  </Stack>
                </Card>
              </li>
            );
          })}
        </Grid>
      </div>
    </section>
  );
}

const ARROW_STYLE: CSSProperties = { display: 'inline-block' };

export default Services3ColCardGrid;
