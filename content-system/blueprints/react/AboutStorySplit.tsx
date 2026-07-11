/**
 * AboutStorySplit — Phase D adapter (deprecated direct path).
 *
 * After brik-bds#1198 the canonical primitive is `<About>` (the `bds-about`
 * narrative section block). This file remains as an adapter so the legacy
 * `about_story_split` blueprint key keeps dispatching through
 * `BlueprintDispatcher` with the same section-data contract that AI-generated
 * pages expect — it maps `section.*` → `<About>` props. The optional
 * `section.items[0]` pull-quote (`{ title: attribution, description: quote }`)
 * maps to the `testimonial` prop.
 *
 * New consumers should compose `<About>` directly. This adapter retires
 * alongside Phase E.
 *
 * @deprecated Use `<About>` directly.
 * @summary Legacy adapter — maps section data onto `<About>`.
 */
import type { BlueprintProps } from '../astro/types';
import { About } from './About';

interface Props extends BlueprintProps {}

export function AboutStorySplit({ section }: Props) {
  const callout = section.items[0];

  return (
    <About
      sectionKey={section.sectionKey}
      title={section.heading ?? ''}
      subtitle={section.subheading ?? undefined}
      body={section.body ?? undefined}
      testimonial={
        callout
          ? { quote: callout.description, author: callout.title }
          : undefined
      }
      data-blueprint-key="about_story_split"
    />
  );
}

export default AboutStorySplit;
