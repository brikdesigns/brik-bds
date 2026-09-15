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
 *                          item.videoUrl?   = optional testimonial video, rendered
 *                                             above the quote via the shared
 *                                             `BlockMedia` primitive (media axis,
 *                                             ADR-039 #2518)
 *                          item.videoPoster? = poster still (falls back to imageUrl)
 *
 * Media axis (ADR-039 #2518): a foreground `media="video"` player (curated, not
 * free config) renders above the quote when `items[0].videoUrl` is present;
 * reduced-motion-safe by construction (no autoplay). Absent → quote-only.
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
import { BlockMedia } from './BlockMedia';
import '../section-shell.css';

// Media axis (ADR-039 #2518): the optional testimonial video sits above the
// quote, centred and constrained to the quote's measure. Inline var() token
// styles follow the local blueprint-adapter precedent (ServicesDetailTwoColumn).
const mediaStyle = {
  maxWidth: 'var(--measure-md)',
  marginInline: 'auto',
  marginBottom: 'var(--gap-xl)',
} as const;

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

        {featured && featured.videoUrl && (
          <div style={mediaStyle}>
            <BlockMedia
              media="video"
              src={featured.videoUrl}
              poster={featured.videoPoster ?? featured.imageUrl}
              ratio="16-9"
              fit="cover"
            />
          </div>
        )}

        {featured && (
          <Testimonial quote={featured.description} authorName={featured.title} />
        )}
      </div>
    </section>
  );
}

export default TestimonialsFeaturedLarge;
