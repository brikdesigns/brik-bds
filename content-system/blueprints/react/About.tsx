/**
 * About — canonical `bds-about` narrative section primitive (Phase D,
 * brik-bds#1198). Consolidates the about blueprint family — the last family
 * in the ADR-008 Phase D sequence — retiring the per-blueprint
 * `bp-about-story-split` class.
 *
 * `about` is a single-member family, so there is no structural modifier: the
 * block *is* the narrative section (ADR-008 §3 — a modifier needs a sibling
 * layout to contrast against, and there is none). The former `--story` /
 * `--split` descriptors are dropped: `story` was variant-by-purpose and the
 * split was only ever a *state* (present when a pull-quote is supplied), which
 * the CSS now drives from the presence of the `__callout` slot via `:has()`.
 *
 * The spine is a narrative column: (eyebrow) → `h2` → lead. An optional
 * `testimonial` renders as a composed `<CardTestimonial>` aside — the ADR-008
 * primitive for pull-quotes. A hand-rolled quote element here is a
 * `lint-blueprint-naming` reinvented-primitive error; resolving that
 * pre-existing hazard is part of this consolidation.
 *
 * Slots (all pass `scripts/slot-pattern-check.mjs`):
 *   bds-about, __container, __narrative, __subtitle, __title, __lead, __callout
 *
 * Token pairs (paired family ↔ size — never mix):
 *   subtitle    — --font-family-label + --label-lg (uppercase eyebrow)
 *   title (h2)  — --font-family-heading + clamp(--heading-lg … --heading-xl)
 *   lead        — --font-family-body + --heading-sm
 *
 * a11y: `<section>` with `aria-labelledby` → the h2. Reading order is natural
 * (narrative first, supporting callout second) on every viewport.
 *
 * @summary About-page narrative — eyebrow + `h2` + lead, with an optional pull-quote `CardTestimonial` aside.
 */
import { type HTMLAttributes } from 'react';

import { CardTestimonial } from '../../../components';
import { bdsClass } from '../../../components/utils';
import './About.css';

/** Optional pull-quote rendered as a `CardTestimonial` aside. */
export interface AboutTestimonial {
  /** The quote body. */
  quote: string;
  /** Attribution — typically a name. Maps to `CardTestimonial` `authorName`. */
  author: string;
  /** Optional role / company under the attribution. */
  authorRole?: string;
}

export interface AboutProps extends HTMLAttributes<HTMLElement> {
  /**
   * Stable section identifier. Drives the `aria-labelledby` id — keep it
   * stable across renders for a given section.
   */
  sectionKey: string;
  /** Section heading. Renders as `<h2>`. */
  title: string;
  /** Optional uppercase eyebrow above the heading. */
  subtitle?: string;
  /** The narrative paragraph under the heading. */
  body?: string;
  /**
   * Optional pull-quote. When present the section becomes a two-column
   * narrative-plus-callout layout; when absent it is a single narrative
   * column. Rendered as an `outlined` `<CardTestimonial>`.
   */
  testimonial?: AboutTestimonial;
}

export function About({
  sectionKey,
  title,
  subtitle,
  body,
  testimonial,
  className,
  ...rest
}: AboutProps) {
  const titleId = `${sectionKey}-title`;

  return (
    <section
      className={bdsClass('bds-about', className)}
      aria-labelledby={titleId}
      {...rest}
    >
      <div className="bds-about__container">
        <div className="bds-about__narrative">
          {subtitle && <p className="bds-about__subtitle">{subtitle}</p>}
          <h2 id={titleId} className="bds-about__title">
            {title}
          </h2>
          {body && <p className="bds-about__lead">{body}</p>}
        </div>

        {testimonial && (
          <CardTestimonial
            className="bds-about__callout"
            variant="outlined"
            quote={testimonial.quote}
            authorName={testimonial.author}
            authorRole={testimonial.authorRole}
          />
        )}
      </div>
    </section>
  );
}

export default About;
