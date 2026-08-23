/**
 * TestimonialsFeaturedLarge — React twin of the Astro
 * `testimonials_featured_large` blueprint (brik-bds#2010).
 *
 * Restores Astro↔React dispatcher parity: the key rendered in Astro but
 * fell through to `<BlueprintFallback>` in React, so the same page dropped
 * its featured testimonial when rendered through the React dispatcher.
 * Composes the canonical `<Testimonial>` primitive inside the shared
 * ADR-021 section shell — no `bp-*` classes (ADR-008).
 *
 * Contract: BlueprintProps.
 *   - section.heading  — section label (visually-hidden `h2`, often
 *                        "What clients say")
 *   - section.items[0] — REQUIRED featured testimonial:
 *                          item.title       = attribution
 *                                             (name · role · company)
 *                          item.description = the quote
 *
 * required_facts: []. Section-driven.
 *
 * New consumers should compose `<Testimonial>` directly. This adapter
 * keeps the legacy `testimonials_featured_large` key dispatching through
 * `BlueprintDispatcher` with the section-data contract AI-generated pages
 * expect. Retires alongside the testimonials family consolidation.
 *
 * @summary Legacy adapter — maps section data onto `<Testimonial>`.
 */
import { bdsClass } from '../../../components/utils';
import { Testimonial } from '../../../components/ui/Testimonial';
import type { BlueprintProps } from '../astro/types';
import '../section-shell.css';

interface Props extends BlueprintProps {}

export function TestimonialsFeaturedLarge({ section }: Props) {
  const titleId = `${section.sectionKey}-title`;
  const featured = section.items[0];

  return (
    <section
      className={bdsClass('bds-blueprint-section')}
      aria-labelledby={titleId}
      data-blueprint-key="testimonials_featured_large"
    >
      <div className="bds-blueprint-section__container">
        <h2 id={titleId} className="bds-visually-hidden">
          {section.heading ?? 'Featured testimonial'}
        </h2>

        {featured && (
          <Testimonial quote={featured.description} authorName={featured.title} />
        )}
      </div>
    </section>
  );
}

export default TestimonialsFeaturedLarge;
