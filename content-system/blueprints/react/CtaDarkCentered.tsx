/**
 * CtaDarkCentered — blueprint-key adapter (supported: ADR-037 §2).
 *
 * After brik-bds#582 the canonical primitive is `<Cta>` (the `bds-cta`
 * section block, default single-column layout). This file remains as an
 * adapter so the legacy `cta_centered` blueprint key keeps dispatching
 * through `BlueprintDispatcher` with the same section-data contract that
 * AI-generated pages expect — it maps `section.*` → `<Cta>` props.
 *
 * New consumers should compose `<Cta>` directly. It is the supported dispatch
 * path for its blueprint key; not deprecated (ADR-037 §2).
 *
 * @summary Key adapter — maps section data onto `<Cta>` (default layout).
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
      data-blueprint-key="cta_centered"
    />
  );
}

export default CtaDarkCentered;
