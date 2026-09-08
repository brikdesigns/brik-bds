/**
 * HeroInteriorMinimal — blueprint-key adapter (supported: ADR-037 §2).
 *
 * After brik-bds#583 the canonical primitive is `<Hero>` (the `bds-hero`
 * section block, `interior-minimal` layout). This file remains as an adapter
 * so the legacy `hero_interior_minimal` blueprint key keeps dispatching
 * through `BlueprintDispatcher` with the same section-data contract that
 * AI-generated pages expect — it maps `section.*` → `<Hero>` props.
 *
 * New consumers should compose `<Hero layout="interior-minimal">` directly.
 * It is the supported dispatch path for its blueprint key, which three
 * published client sites resolve; it is not deprecated (ADR-037 §2).
 *
 * @summary Key adapter — section data → `<Hero layout="interior-minimal">`.
 */
import type { BlueprintProps } from '../astro/types';
import { Hero } from './Hero';

interface Props extends BlueprintProps {}

export function HeroInteriorMinimal({ section }: Props) {
  return (
    <Hero
      layout="interior-minimal"
      sectionKey={section.sectionKey}
      title={section.heading ?? ''}
      subtitle={section.subheading ?? undefined}
      lead={section.body ?? undefined}
      cta={section.cta ?? undefined}
      data-blueprint-key="hero_interior_minimal"
    />
  );
}

export default HeroInteriorMinimal;
