/**
 * CtaDarkCentered — Phase D adapter (deprecated direct path).
 *
 * After brik-bds#582 the canonical primitive is `<Cta>` (the `bds-cta`
 * section block, default single-column layout). This file remains as an
 * adapter so the legacy `cta_dark_centered` blueprint key keeps dispatching
 * through `BlueprintDispatcher` with the same section-data contract that
 * AI-generated pages expect — it maps `section.*` → `<Cta>` props.
 *
 * New consumers should compose `<Cta>` directly. This adapter retires
 * alongside Phase E.
 *
 * @deprecated Use `<Cta>` directly.
 * @summary Legacy adapter — maps section data onto `<Cta>` (default layout).
 */
import type { BlueprintProps } from '../astro/types';
import { Cta } from './Cta';

interface Props extends BlueprintProps {}

export function CtaDarkCentered({ section }: Props) {
  return (
    <Cta
      sectionKey={section.sectionKey}
      title={section.heading ?? ''}
      body={section.body ?? undefined}
      primaryCta={section.cta ?? undefined}
      data-blueprint-key="cta_dark_centered"
    />
  );
}

export default CtaDarkCentered;
