/**
 * CalloutSplit — blueprint-key adapter (supported: ADR-037 §2).
 *
 * After brik-bds#581, the canonical primitive is `<CalloutPanel>` (the
 * `bds-callout-panel` section block). This file remains as an adapter so
 * the legacy `callout_split` blueprint key continues to
 * dispatch through `BlueprintDispatcher` with the same section-data
 * contract that AI-generated pages expect — it maps `section.*` →
 * `<CalloutPanel>` props.
 *
 * New consumers should compose `<CalloutPanel>` directly. It is the supported
 * dispatch path for its blueprint key; not deprecated (ADR-037 §2).
 *
 * @summary Key adapter — maps section data onto `<CalloutPanel>`.
 */
import type { BlueprintProps } from '../astro/types';
import { CalloutPanel } from './CalloutPanel';

interface Props extends BlueprintProps {}

export function CalloutSplit({ section }: Props) {
  const plan = section.items?.[0];

  return (
    <CalloutPanel
      sectionKey={section.sectionKey}
      title={section.heading ?? ''}
      subtitle={section.subheading ?? undefined}
      description={section.body ?? undefined}
      panelTitle={plan?.title ?? ''}
      panelDescription={plan?.description ?? undefined}
      cta={section.cta ?? undefined}
    />
  );
}

export default CalloutSplit;
