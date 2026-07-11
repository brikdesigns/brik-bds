/**
 * Features — canonical `bds-features` feature-grid section primitive
 * (Phase D, brik-bds#1197). Consolidates the features blueprint family,
 * retiring the legacy `bp-features-branded-dark` class — whose
 * `--branded-dark` descriptor is banned by ADR-008 §3 (`--dark` = theme,
 * `--branded` = appearance) and whose `3col` count belonged in CSS, never
 * the class name.
 *
 * `features` is a single-member family, so there is NO layout modifier
 * (ADR-008 §3 — a modifier needs a sibling layout to contrast against): the
 * block *is* the feature grid. Column count is a responsive CSS concern
 * (1 → 2 → 3), not a class token. The dark surface is a themeable default
 * via the `--bds-features-bg` Tier-4 hook (fallback `--page-inverse`), not a
 * name — the same "surface is a default, not a class" move ADR-008 applied to
 * `bds-cta`.
 *
 * The spine is an optional section header (eyebrow → `h2` → lead) above a
 * `<ul role="list">` grid of feature cards. Each card is a linked `<Card>`
 * with a media area (image, a `<ServiceTag>` icon fallback, or a blank brand
 * block), an `h3` title, an optional description, and a "Learn more" CTA.
 *
 * ## Audience scope binding
 *
 * Each card emits `data-audience={item.audience}` to re-bind
 * `--background-brand-primary` for that subtree. BDS ships the pattern, not
 * the values: the consumer defines the `[data-audience='X']` cascade rules in
 * its own globals.css. Without them, every card resolves to the global brand
 * color (three identical cards — a missing-cascade bug on the consumer side,
 * not a renderer bug). Storybook demonstrates the pattern via a stories-only
 * cascade block.
 *
 * Slots (all pass `scripts/slot-pattern-check.mjs`):
 *   bds-features, __container, __header, __subtitle, __title, __lead, __grid,
 *   __item, __card, __card-link, __media, __image, __image-fallback,
 *   __content, __description, __cta, __cta-arrow
 *
 * a11y: section uses `h2` + aria-labelledby; cards are a `<ul role="list">`;
 * card title is an `h3`. Card title uses `--font-weight-bold` + 18px and the
 * description 16px regular to clear AA on saturated brand backgrounds (BDS
 * contrast burndown #40 — full resolution requires brand-color adjustment,
 * tracked separately).
 *
 * @summary Feature grid — optional header above a responsive grid of brand-colored, audience-scoped feature cards on a dark default surface.
 */
import { type HTMLAttributes } from 'react';

import { Card, ServiceTag, Stack, type ServiceLine } from '../../../components';
import { bdsClass } from '../../../components/utils';
import './Features.css';

/** A single feature card. */
export interface FeatureItem {
  /** Card title. Rendered as `h3`. */
  title: string;
  /** Optional one-to-two-line card description. */
  description?: string;
  /** "Learn more" link target. Defaults to `#`. */
  href?: string;
  /** Optional top illustration. Omitted → a `ServiceTag` icon or blank block. */
  imageUrl?: string;
  /** Alt text for `imageUrl`. Empty (decorative) when omitted. */
  imageAlt?: string;
  /**
   * Audience slug emitted as `data-audience` for per-card brand-color scope
   * binding, and used for the `ServiceTag` icon fallback when no `imageUrl`.
   */
  audience?: ServiceLine;
}

export interface FeaturesProps extends HTMLAttributes<HTMLElement> {
  /**
   * Stable section identifier. Drives the `aria-labelledby` id and card keys
   * — keep it stable across renders for a given section.
   */
  sectionKey: string;
  /** Optional section heading. Renders as `<h2>`. */
  title?: string;
  /** Optional uppercase eyebrow above the heading. */
  subtitle?: string;
  /** Optional lead paragraph under the heading. */
  body?: string;
  /** The feature cards. Typically 3; the grid wraps to a second row beyond. */
  items: FeatureItem[];
}

export function Features({
  sectionKey,
  title,
  subtitle,
  body,
  items,
  className,
  ...rest
}: FeaturesProps) {
  const titleId = `${sectionKey}-title`;
  const hasHeader = Boolean(title || subtitle || body);

  return (
    <section
      className={bdsClass('bds-features', className)}
      data-blueprint-key="features_3col_branded_dark"
      aria-labelledby={title ? titleId : undefined}
      {...rest}
    >
      <div className="bds-features__container">
        {hasHeader && (
          <Stack as="header" gap="md" className="bds-features__header">
            {subtitle && <p className="bds-features__subtitle">{subtitle}</p>}
            {title && (
              <h2 id={titleId} className="bds-features__title">
                {title}
              </h2>
            )}
            {body && <p className="bds-features__lead">{body}</p>}
          </Stack>
        )}

        <ul className="bds-features__grid" role="list">
          {items.map((item, idx) => {
            const audience = item.audience ?? null;
            return (
              <li key={`${sectionKey}-${idx}`} className="bds-features__item">
                <Card
                  variant="outlined"
                  padding="none"
                  className="bds-features__card"
                  data-audience={audience ?? undefined}
                >
                  <a
                    className="bds-features__card-link"
                    href={item.href ?? '#'}
                  >
                    <div className="bds-features__media">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.imageAlt ?? ''}
                          className="bds-features__image"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : audience ? (
                        <span
                          className="bds-features__image-fallback"
                          aria-hidden="true"
                        >
                          <ServiceTag
                            category={audience}
                            variant="icon"
                            size="lg"
                            serviceName={item.title}
                          />
                        </span>
                      ) : (
                        <span
                          className="bds-features__image-fallback bds-features__image-fallback--blank"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className="bds-features__content">
                      <h3 className="bds-features__title">{item.title}</h3>
                      {item.description && (
                        <p className="bds-features__description">
                          {item.description}
                        </p>
                      )}
                      <span className="bds-features__cta">
                        Learn more
                        <span
                          aria-hidden="true"
                          className="bds-features__cta-arrow"
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

export default Features;
