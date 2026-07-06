/**
 * Hero — canonical `bds-hero` page-hero section primitive (Phase D,
 * brik-bds#583). Consolidates the hero blueprint family into one block
 * with structural-modifier layouts, retiring the per-blueprint
 * `bp-hero-*` classes. See the #583 architecture decision: one props-based
 * primitive + optional composed media slot (the <SupportPlan>/<Cta>
 * pattern), NOT a Split-primitive inversion.
 *
 * The shared spine is a content column: eyebrow → `h1` → lead → primary CTA.
 * Layouts (structural modifiers, per ADR-008 §3):
 *   interior-minimal — `bds-hero--interior-minimal`  content column only, no media
 *   split            — `bds-hero--split`             content column + `media` column
 *
 * The `--with-pricing-card` variant (HeroSplitImageCardOverlay) is tracked
 * separately in #1165 and folds into this same block later.
 *
 * `media` is an optional composed slot (the split's second column). The
 * `HeroSplit6040` adapter builds the image node — or a `data-content-needed`
 * stub when `clientFacts.heroImageUrl` is missing — and passes it here.
 *
 * Hero blueprints own the page's singular `h1`.
 *
 * Slots (all pass `scripts/slot-pattern-check.mjs`):
 *   bds-hero, __container, __content, __subtitle, __title, __lead,
 *   __media, __image, __missing, __missing-label
 *
 * Token pairs (paired family ↔ size — never mix):
 *   subtitle    — --font-family-label + --label-lg (uppercase eyebrow)
 *   title (h1)  — --font-family-heading + clamp(--heading-xl … --display-sm)
 *   lead        — --font-family-body + --heading-sm
 *
 * a11y: `<section>` with `aria-labelledby` → the h1. Eyebrow is prose, not a
 * heading. CTA is a `Button` with a :focus-visible ring.
 *
 * @summary Page hero — content column with an `--interior-minimal` (no media) or `--split` (media column) layout.
 */
import { type HTMLAttributes, type ReactNode } from 'react';

import { Button } from '../../../components';
import { bdsClass } from '../../../components/utils';
import type { BlueprintCta } from '../astro/types';
import { isActionCta } from '../astro/types';
import './Hero.css';

export type HeroLayout = 'split' | 'interior-minimal';

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
   */
  layout?: HeroLayout;
  /**
   * The split layout's media column (e.g. an image node or a
   * `data-content-needed` stub). Ignored when `layout` is `interior-minimal`.
   */
  media?: ReactNode;
}

export function Hero({
  sectionKey,
  title,
  subtitle,
  lead,
  cta,
  layout = 'split',
  media,
  className,
  ...rest
}: HeroProps) {
  const titleId = `${sectionKey}-title`;
  const isSplit = layout === 'split';

  return (
    <section
      className={bdsClass('bds-hero', `bds-hero--${layout}`, className)}
      aria-labelledby={titleId}
      {...rest}
    >
      <div className="bds-hero__container">
        <div className="bds-hero__content">
          {subtitle && <p className="bds-hero__subtitle">{subtitle}</p>}
          <h1 id={titleId} className="bds-hero__title">
            {title}
          </h1>
          {lead && <p className="bds-hero__lead">{lead}</p>}
          {cta && (
            <Button
              {...(isActionCta(cta) ? { onClick: cta.onClick } : { href: cta.url })}
              variant="primary"
              size="md"
            >
              {cta.label}
            </Button>
          )}
        </div>

        {isSplit && media}
      </div>
    </section>
  );
}

export default Hero;
