/**
 * HeroSplit6040 — React renderer. Twin of
 * `../astro/HeroSplit6040.astro`. 60/40 split hero — content left,
 * photography right, gold accent line under the headline.
 *
 * Contract: BlueprintProps. Reads `clientFacts.heroImageUrl` for the
 * right column; emits `data-content-needed="hero_image_url"` stub
 * when missing (CI greppable per spec §2.4).
 *
 * @summary 60/40 split hero — headline left, photo right.
 */
import type { BlueprintProps } from '../astro/types';
import './HeroSplit6040.css';

interface Props extends BlueprintProps {}

export function HeroSplit6040({ section, clientFacts }: Props) {
  const headingId = `bp-hero-split-${section.sectionKey}-h`;
  const eyebrow = section.subheading;
  const headline = section.heading ?? '';
  const lead = section.body;
  const cta = section.cta;
  const heroImage = clientFacts.heroImageUrl;

  return (
    <section
      className="bp-hero-split-60-40"
      aria-labelledby={headingId}
      data-blueprint-key="hero_split_60_40"
    >
      <div className="bp-hero-split-60-40__container">
        <div className="bp-hero-split-60-40__content">
          {eyebrow && (
            <p className="bp-hero-split-60-40__eyebrow">{eyebrow}</p>
          )}
          <h1 id={headingId} className="bp-hero-split-60-40__headline">
            {headline}
          </h1>
          {lead && <p className="bp-hero-split-60-40__lead">{lead}</p>}
          {cta && (
            <a href={cta.url} className="bp-hero-split-60-40__cta">
              {cta.label}
            </a>
          )}
        </div>

        {heroImage ? (
          <div className="bp-hero-split-60-40__media">
            <img
              src={heroImage}
              alt=""
              width={960}
              height={1200}
              loading="eager"
              decoding="async"
              className="bp-hero-split-60-40__image"
            />
          </div>
        ) : (
          <div
            className="bp-hero-split-60-40__missing"
            data-content-needed="hero_image_url"
            role="presentation"
          >
            <p className="bp-hero-split-60-40__missing-label">
              Hero image missing for this client.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroSplit6040;
