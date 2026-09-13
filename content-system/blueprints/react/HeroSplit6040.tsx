/**
 * HeroSplit6040 — blueprint-key adapter (supported: ADR-037 §2).
 *
 * After brik-bds#583 the canonical primitive is `<Hero>` (the `bds-hero`
 * section block, `split` layout). This file remains as an adapter so the
 * legacy `hero_split` blueprint key keeps dispatching through
 * `BlueprintDispatcher` with the same section-data contract — it maps
 * `section.*` + `clientFacts.heroImageUrl` → `<Hero>` props, building the
 * media column (the 60/40 image, or a `data-content-needed` stub when the
 * client has no hero image; CI grep on `dist/` blocks publish on the stub).
 *
 * New consumers should compose `<Hero layout="split" media={…}>` directly.
 * It is the supported dispatch path for its blueprint key, which three
 * published client sites resolve; it is not deprecated (ADR-037 §2).
 *
 * @summary Key adapter — section + hero image → `<Hero layout="split">`.
 */
import type { BlueprintProps } from '../astro/types';
import { BlockMedia } from './BlockMedia';
import { Hero } from './Hero';

interface Props extends BlueprintProps {}

export function HeroSplit6040({ section, clientFacts }: Props) {
  const heroImage = clientFacts.heroImageUrl;

  // Media axis (ADR-039, #2493): the media column renders through the shared
  // `<BlockMedia>` primitive, class-identical to the Astro rail's `<Media>`.
  // This key adapter is image-only (the `hero_split` blueprint key); the
  // `video`/`bg-video` values are selected by composing `<Hero media={…}>`
  // directly, which the portal generator will drive (portal#4004).
  //
  // Decorative-default alt: the h1 conveys meaning; the hero image is
  // atmospheric. Assistive tech skips it and reads the headline instead.
  const media = heroImage ? (
    <div className="bds-hero__media">
      <BlockMedia media="image" src={heroImage} alt="" ratio="4-5" loading="eager" />
    </div>
  ) : (
    <div
      className="bds-blueprint-section__missing bds-hero__missing"
      data-content-needed="hero_image_url"
      role="presentation"
    >
      <p className="bds-blueprint-section__missing-label">Hero image missing for this client.</p>
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
      data-blueprint-key="hero_split"
    />
  );
}

export default HeroSplit6040;
