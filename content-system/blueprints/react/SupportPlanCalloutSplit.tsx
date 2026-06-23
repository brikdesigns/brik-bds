/**
 * SupportPlanCalloutSplit — React renderer for the
 * `support_plan_callout_split` blueprint. Composes the
 * `MarketingIllustration` primitive (PR #484) on the left with a
 * plan-callout `Card` on the right, with an optional centered section
 * header above. Drives brikdesigns.com's "Monthly support services"
 * cross-sell section on `/services/{slug}` pages.
 *
 * Astro twin lives at `../astro/SupportPlanCalloutSplit.astro` and
 * mirrors the same illustration HTML shape using the canonical
 * `bds-marketing-illustration__*` classes — visual parity is exact
 * for any consumer that imports `@brikdesigns/bds/styles.css`.
 *
 * Contract: BlueprintProps. The illustration data lives on
 * `section.illustration` (an additive optional field on
 * `BlueprintSection`); the plan info lives on `section.items[0]` plus
 * `section.cta`.
 *
 * CSS custom properties — variation API:
 *   --bp-support-plan-callout-bg          (default: var(--page-primary))
 *   --bp-support-plan-callout-card-bg     (default: var(--surface-secondary))
 *   --bp-support-plan-callout-card-radius (default: var(--border-radius-lg))
 *   --bp-support-plan-callout-gap         (default: var(--gap-xl))
 *   --bp-support-plan-callout-card-pad    (default: var(--padding-xl))
 *
 * a11y: section is a `<section>` with `aria-labelledby` pointing at
 * the h2; plan card title is an h3 nested under the section h2;
 * MarketingIllustration emits `role="img"` with synthesized
 * aria-label. CTA uses `LinkButton` size="md" — DO NOT downgrade to
 * "sm" on this surface (white-on-poppy at 14px fails AA per the
 * BDS contrast burndown).
 *
 * @summary Section header + illustration + plan-callout card split.
 */
import {
  Button,
  Card,
  MarketingIllustration,
  Stack,
  type IllustrationTile,
} from '../../../components';

import type { BlueprintProps } from '../astro/types';
import { isActionCta } from '../astro/types';
import './SupportPlanCalloutSplit.css';

interface Props extends BlueprintProps {}

export function SupportPlanCalloutSplit({ section }: Props) {
  const titleId = `${section.sectionKey}-title`;
  const plan = section.items?.[0];
  const cta = section.cta;
  const illustration = section.illustration;
  const hasIllustration =
    illustration !== undefined && illustration.tiles.length > 0;

  return (
    <section
      className="bp-support-plan-callout"
      data-blueprint-key="support_plan_callout_split"
      data-has-illustration={hasIllustration ? 'true' : 'false'}
      aria-labelledby={section.heading ? titleId : undefined}
    >
      <div className="bp-support-plan-callout__container">
        {(section.heading || section.subheading || section.body) && (
          <Stack
            as="header"
            gap="md"
            className="bp-support-plan-callout__header"
          >
            {section.subheading && (
              <p className="bp-support-plan-callout__subtitle">
                {section.subheading}
              </p>
            )}
            {section.heading && (
              <h2
                id={titleId}
                className="bp-support-plan-callout__title"
              >
                {section.heading}
              </h2>
            )}
            {section.body && (
              <p className="bp-support-plan-callout__lead">{section.body}</p>
            )}
          </Stack>
        )}

        <div className="bp-support-plan-callout__split">
          {hasIllustration && (
            <MarketingIllustration
              variant={illustration.variant ?? 'persona-cluster'}
              ratio={illustration.ratio ?? 'square'}
              tiles={illustration.tiles as IllustrationTile[]}
              className="bp-support-plan-callout__illustration"
            />
          )}

          {plan && (
            <Card
              variant="outlined"
              padding="none"
              className="bp-support-plan-callout__card"
            >
              <Stack gap="md" className="bp-support-plan-callout__card-stack">
                <h3 className="bp-support-plan-callout__plan-name">
                  {plan.title}
                </h3>
                {plan.description && (
                  <p className="bp-support-plan-callout__plan-description">
                    {plan.description}
                  </p>
                )}
                {cta && (
                  <Button
                    {...(isActionCta(cta) ? { onClick: cta.onClick } : { href: cta.url })}
                    variant="primary"
                    size="md"
                    className="bp-support-plan-callout__cta"
                  >
                    {cta.label}
                  </Button>
                )}
              </Stack>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}

export default SupportPlanCalloutSplit;
