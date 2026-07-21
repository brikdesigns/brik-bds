/**
 * Features3ColBrandedDark — Phase D adapter (deprecated direct path).
 *
 * After brik-bds#1197 the canonical primitive is `<Features>` (the
 * `bds-features` feature-grid section block). This file remains as an adapter
 * so the legacy `features_3col_branded_dark` blueprint key keeps dispatching
 * through `BlueprintDispatcher` with the same section-data contract that
 * AI-generated pages expect — it maps `section.*` → `<Features>` props.
 *
 * New consumers should compose `<Features>` directly. This adapter retires
 * alongside Phase E.
 *
 * @deprecated Use `<Features>` directly.
 * @summary Legacy adapter — maps section data onto `<Features>`.
 */
import type { ServiceLine } from '../../../components';
import type { BlueprintProps } from '../astro/types';
import { Features, type FeatureItem } from './Features';

interface Props extends BlueprintProps {}

export function Features3ColBrandedDark({ section }: Props) {
  const items: FeatureItem[] = section.items.map((item) => ({
    title: item.title,
    description: item.description ?? undefined,
    href: item.href ?? undefined,
    imageUrl: item.imageUrl ?? undefined,
    imageAlt: item.imageAlt ?? undefined,
    // `serviceLine` canonical; `audience` deprecated alias (#788). Pass both
    // through so `Features` can resolve `serviceLine ?? audience`.
    serviceLine: (item.serviceLine ?? item.audience ?? undefined) as ServiceLine | undefined,
  }));

  return (
    <Features
      sectionKey={section.sectionKey}
      title={section.heading ?? undefined}
      subtitle={section.subheading ?? undefined}
      body={section.body ?? undefined}
      items={items}
    />
  );
}

export default Features3ColBrandedDark;
