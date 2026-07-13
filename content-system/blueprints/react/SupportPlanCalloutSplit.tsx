/**
 * SupportPlanCalloutSplit — Phase D adapter (deprecated direct path).
 *
 * After brik-bds#581, the canonical primitive is `<SupportPlan>` (the
 * `bds-support-plan` section block). This file remains as an adapter so
 * the legacy `support_plan_callout_split` blueprint key continues to
 * dispatch through `BlueprintDispatcher` with the same section-data
 * contract that AI-generated pages expect — it maps `section.*` →
 * `<SupportPlan>` props.
 *
 * New consumers should compose `<SupportPlan>` directly. This adapter
 * retires alongside Phase E.
 *
 * @deprecated Use `<SupportPlan>` directly.
 * @summary Legacy adapter — maps section data onto `<SupportPlan>`.
 */
import type { BlueprintProps } from '../astro/types';
import { SupportPlan } from './SupportPlan';

interface Props extends BlueprintProps {}

export function SupportPlanCalloutSplit({ section }: Props) {
  const plan = section.items?.[0];

  return (
    <SupportPlan
      sectionKey={section.sectionKey}
      title={section.heading ?? ''}
      subtitle={section.subheading ?? undefined}
      description={section.body ?? undefined}
      planTitle={plan?.title ?? ''}
      planDescription={plan?.description ?? undefined}
      cta={section.cta ?? undefined}
    />
  );
}

export default SupportPlanCalloutSplit;
