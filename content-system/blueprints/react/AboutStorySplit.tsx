/**
 * AboutStorySplit — React renderer. Twin of
 * `../astro/AboutStorySplit.astro`. 2-column narrative with optional
 * pull-quote callout on the right.
 *
 * Contract: BlueprintProps. `section.items[0]` is the optional
 * pull-quote: `{ title: attribution, description: quote }`.
 *
 * @summary Narrative + pull-quote — about-page section blueprint.
 */
import type { BlueprintProps } from '../astro/types';
import './AboutStorySplit.css';

interface Props extends BlueprintProps {}

export function AboutStorySplit({ section }: Props) {
  const headingId = `bp-about-story-split-${section.sectionKey}-h`;
  const callout = section.items[0];

  return (
    <section
      className="bp-about-story-split"
      aria-labelledby={headingId}
      data-blueprint-key="about_story_split"
    >
      <div className="bp-about-story-split__container">
        <div className="bp-about-story-split__narrative">
          {section.subheading && (
            <p className="bp-about-story-split__eyebrow">
              {section.subheading}
            </p>
          )}
          <h2 id={headingId} className="bp-about-story-split__heading">
            {section.heading}
          </h2>
          {section.body && (
            <p className="bp-about-story-split__body">{section.body}</p>
          )}
        </div>

        {callout && (
          <aside className="bp-about-story-split__callout">
            <blockquote className="bp-about-story-split__quote">
              <p className="bp-about-story-split__quote-text">
                {callout.description}
              </p>
              <cite className="bp-about-story-split__quote-cite">
                {callout.title}
              </cite>
            </blockquote>
          </aside>
        )}
      </div>
    </section>
  );
}

export default AboutStorySplit;
