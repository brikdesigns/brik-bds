/**
 * Hero — canonical `bds-hero` page-hero section primitive (Phase D,
 * brik-bds#583). Consolidates the hero blueprint family into one block
 * with structural-modifier layouts, retiring the per-blueprint
 * `bp-hero-*` classes. See the #583 architecture decision: one props-based
 * primitive + optional composed media slot (the <SupportPlan>/<Cta>
 * pattern), NOT a Split-primitive inversion.
 *
 * The shared spine is a content column: (breadcrumb) → (eyebrow icon) →
 * eyebrow text → `h1` → lead → CTA. Layouts (structural modifiers, per
 * ADR-008 §3):
 *   interior-minimal  — `bds-hero--interior-minimal`   content column only, no media
 *   split             — `bds-hero--split`              content column + `media` column
 *   with-pricing-card — `bds-hero--with-pricing-card`  interior split; content trail +
 *                        an `aside` media card (image + optional price overlay)
 *
 * `media` is an optional composed slot (the split's / pricing-card's second
 * column). The `HeroSplit6040` adapter builds the image node — or a
 * `data-content-needed` stub when `clientFacts.heroImageUrl` is missing — and
 * the `HeroSplitImageCardOverlay` adapter builds the pricing-card aside; both
 * pass it here.
 *
 * `breadcrumb` and `eyebrow` are optional composed nodes (used by
 * `--with-pricing-card`); they render above the eyebrow text when present and
 * are absent for the simpler layouts. `ctaVariant` lets the pricing-card
 * variant render its `inverse` CTA against the audience-tinted surface.
 * `data-audience` (a plain attribute forwarded via `...rest`) drives the
 * service-token cascade in `Hero.css`.
 *
 * Hero blueprints own the page's singular `h1`.
 *
 * Slots (all pass `scripts/slot-pattern-check.mjs`):
 *   bds-hero, __container, __content, __breadcrumb, __icon, __icon-slot,
 *   __subtitle, __title, __lead, __media, __image, __missing, __missing-label,
 *   __media-card, __image-frame, __price, __price-label, __price-value
 *
 * Token pairs (paired family ↔ size — never mix):
 *   subtitle    — --font-family-label + --label-lg (uppercase eyebrow)
 *   title (h1)  — --font-family-heading + clamp(--heading-xl … --display-sm)
 *   lead        — --font-family-body + --heading-sm
 *
 * a11y: `<section>` with `aria-labelledby` → the h1. Eyebrow is prose, not a
 * heading. CTA is a `Button` with a :focus-visible ring.
 *
 * @summary Page hero — content column with an `--interior-minimal` (no media), `--split` (media column), or `--with-pricing-card` (content trail + image/price card) layout.
 */
import { type HTMLAttributes, type ReactNode } from 'react';

import { Button } from '../../../components';
import type { ButtonVariant } from '../../../components/ui/Button';
import { bdsClass } from '../../../components/utils';
import type { BlueprintCta } from '../astro/types';
import { isActionCta } from '../astro/types';
import './Hero.css';

export type HeroLayout = 'split' | 'interior-minimal' | 'with-pricing-card';

export interface HeroProps extends HTMLAttributes<HTMLElement> {
  /**
   * Stable section identifier. Drives the `aria-labelledby` id — keep it
   * stable across renders for a given section.
   */
  sectionKey: string;
  /** Hero headline. Renders as the page `<h1>`. */
  title: string;
  /** Optional uppercase eyebrow above the headline. */
  subtitle?: string;
  /** Optional lead paragraph under the headline. */
  lead?: string;
  /** Primary CTA — link (`url`) or action (`onClick`). */
  cta?: BlueprintCta;
  /**
   * `split` = content column + `media` column (the flagship 60/40 hero).
   * `interior-minimal` = content column only, narrower, no media.
   * `with-pricing-card` = interior split; content trail + an `aside` image/price card.
   */
  layout?: HeroLayout;
  /**
   * The split / pricing-card layout's media column (e.g. an image node, a
   * `data-content-needed` stub, or the composed price-card `aside`). Ignored
   * when `layout` is `interior-minimal`.
   */
  media?: ReactNode;
  /**
   * Optional composed breadcrumb trail rendered at the top of the content
   * column (the `--with-pricing-card` interior-page trail). Absent for the
   * simpler layouts. Pass a `<Breadcrumb>` node.
   */
  breadcrumb?: ReactNode;
  /**
   * Optional composed eyebrow icon node rendered above the eyebrow text —
   * e.g. a `<ServiceTag variant="icon">` or a decorative SVG. Used by
   * `--with-pricing-card`. Wrap decorative art in an `aria-hidden` element.
   */
  eyebrow?: ReactNode;
  /**
   * Button variant for the primary CTA. Defaults to `primary`; the
   * `--with-pricing-card` variant passes `inverse` to sit on its
   * audience-tinted surface.
   */
  ctaVariant?: ButtonVariant;
}

export function Hero({
  sectionKey,
  title,
  subtitle,
  lead,
  cta,
  layout = 'split',
  media,
  breadcrumb,
  eyebrow,
  ctaVariant = 'primary',
  className,
  ...rest
}: HeroProps) {
  const titleId = `${sectionKey}-title`;
  const hasMedia = layout !== 'interior-minimal';

  return (
    <section
      className={bdsClass('bds-hero', `bds-hero--${layout}`, className)}
      aria-labelledby={titleId}
      {...rest}
    >
      <div className="bds-hero__container">
        <div className="bds-hero__content">
          {breadcrumb}
          {eyebrow}
          {subtitle && <p className="bds-hero__subtitle">{subtitle}</p>}
          <h1 id={titleId} className="bds-hero__title">
            {title}
          </h1>
          {lead && <p className="bds-hero__lead">{lead}</p>}
          {cta && (
            <Button
              {...(isActionCta(cta) ? { onClick: cta.onClick } : { href: cta.url })}
              variant={ctaVariant}
              size="md"
            >
              {cta.label}
            </Button>
          )}
        </div>

        {hasMedia && media}
      </div>
    </section>
  );
}

export default Hero;
