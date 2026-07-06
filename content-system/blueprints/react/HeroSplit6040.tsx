/**
 * HeroSplit6040 — Phase D adapter (deprecated direct path).
 *
 * After brik-bds#583 the canonical primitive is `<Hero>` (the `bds-hero`
 * section block, `split` layout). This file remains as an adapter so the
 * legacy `hero_split_60_40` blueprint key keeps dispatching through
 * `BlueprintDispatcher` with the same section-data contract — it maps
 * `section.*` + `clientFacts.heroImageUrl` → `<Hero>` props, building the
 * media column (the 60/40 image, or a `data-content-needed` stub when the
 * client has no hero image; CI grep on `dist/` blocks publish on the stub).
 *
 * New consumers should compose `<Hero layout="split" media={…}>` directly.
 * This adapter retires alongside Phase E.
 *
 * @deprecated Use `<Hero layout="split">` directly.
 * @summary Legacy adapter — section + hero image → `<Hero layout="split">`.
 */
import type { BlueprintProps } from '../astro/types';
import { Hero } from './Hero';

interface Props extends BlueprintProps {}

export function HeroSplit6040({ section, clientFacts }: Props) {
  const heroImage = clientFacts.heroImageUrl;

  // Decorative-default alt: the h1 conveys meaning; the hero image is
  // atmospheric. Assistive tech skips it and reads the headline instead.
  const media = heroImage ? (
    <div className="bds-hero__media">
      <img
        src={heroImage}
        alt=""
        width={960}
        height={1200}
        loading="eager"
        decoding="async"
        className="bds-hero__image"
      />
    </div>
  ) : (
    <div
      className="bds-hero__missing"
      data-content-needed="hero_image_url"
      role="presentation"
    >
      <p className="bds-hero__missing-label">Hero image missing for this client.</p>
    </div>
  );

  return (
    <Hero
      layout="split"
      sectionKey={section.sectionKey}
      title={section.heading ?? ''}
      subtitle={section.subheading ?? undefined}
      lead={section.body ?? undefined}
      cta={section.cta ?? undefined}
      media={media}
      data-blueprint-key="hero_split_60_40"
    />
  );
}

export default HeroSplit6040;
