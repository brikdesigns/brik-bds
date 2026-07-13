/**
 * SupportPlan — canonical `bds-support-plan` section primitive (Phase D,
 * brik-bds#581). A section header (subtitle + title + lead) above a
 * plan-callout `Card`, with an OPTIONAL media region composed alongside
 * the card.
 *
 * Per brik-bds#589, the real consumer content shape is just
 * eyebrow + heading + body + a single plan CTA. So the default shape
 * here is the simple single-column callout; the media slot is optional
 * composition — pass any node (e.g. an `<Image>`) to flip to a
 * two-column split.
 *
 * This is the props-based primitive (mirrors the `<CardGrid>` precedent
 * from brik-bds#585). New consumers compose it directly; the
 * `support_plan_callout_split` blueprint key dispatches through the
 * `SupportPlanCalloutSplit` adapter, which maps `section.*` → these
 * props. The adapter retires in Phase E.
 *
 * Slots used (all on docs/SLOT-ALLOWLIST.md):
 *   bds-support-plan, __container, __header, __subtitle, __title,
 *   __description, __columns, __illustration, __main, __cta
 *
 * Token pairs (paired family ↔ size — never mix):
 *   subtitle    — --font-family-label + --label-lg (uppercase eyebrow)
 *   title (h2)  — --font-family-heading + clamp(--heading-lg, …, --heading-huge)
 *   description — --font-family-body + --heading-sm (section lead)
 *
 * a11y: `<section>` with `aria-labelledby` → the h2; the plan title is an
 * h3 nested under the section h2; CTA uses `Button` size="md" — DO NOT
 * downgrade to "sm" (white-on-poppy at 14px fails AA per the BDS contrast
 * burndown).
 *
 * @summary Section header + plan-callout card, with an optional media slot.
 */
import { type HTMLAttributes, type ReactNode } from 'react';

import { Button, Card, Stack } from '../../../components';
import { bdsClass } from '../../../components/utils';
import type { BlueprintCta } from '../astro/types';
import { isActionCta } from '../astro/types';
import './SupportPlan.css';

export interface SupportPlanProps extends HTMLAttributes<HTMLElement> {
  /**
   * Stable section identifier. Drives the `aria-labelledby` id — keep it
   * stable across renders for a given section.
   */
  sectionKey: string;
  /** Section heading text. Renders as `<h2>`. */
  title: string;
  /** Optional uppercase eyebrow above the title. */
  subtitle?: string;
  /** Optional one-line lead paragraph under the title. */
  description?: string;
  /** Plan callout heading. Renders as `<h3>` inside the card. */
  planTitle: string;
  /** Plan callout body copy. */
  planDescription?: string;
  /** Plan CTA — link (`url`) or action (`onClick`). */
  cta?: BlueprintCta;
  /**
   * Optional media region rendered beside the callout card (e.g. an
   * `<Image>`). When present the section becomes a two-column split;
   * when omitted the card centers single-column.
   */
  media?: ReactNode;
}

export function SupportPlan({
  sectionKey,
  title,
  subtitle,
  description,
  planTitle,
  planDescription,
  cta,
  media,
  className,
  ...rest
}: SupportPlanProps) {
  const titleId = `${sectionKey}-title`;
  const hasMedia = media != null;

  return (
    <section
      className={bdsClass('bds-support-plan', className)}
      data-blueprint-key="support_plan_callout_split"
      data-has-media={hasMedia ? 'true' : 'false'}
      aria-labelledby={titleId}
      {...rest}
    >
      <div className="bds-support-plan__container">
        {(subtitle || title || description) && (
          <Stack as="header" gap="md" className="bds-support-plan__header">
            {subtitle && (
              <p className="bds-support-plan__subtitle">{subtitle}</p>
            )}
            <h2 id={titleId} className="bds-support-plan__title">
              {title}
            </h2>
            {description && (
              <p className="bds-support-plan__description">{description}</p>
            )}
          </Stack>
        )}

        <div className="bds-support-plan__columns">
          {hasMedia && (
            <div className="bds-support-plan__illustration">{media}</div>
          )}

          <Card
            variant="outlined"
            padding="none"
            className="bds-support-plan__main"
          >
            <Stack gap="md" style={{ alignItems: 'flex-start' }}>
              <h3 className="bds-support-plan__title">{planTitle}</h3>
              {planDescription && (
                <p className="bds-support-plan__description">
                  {planDescription}
                </p>
              )}
              {cta && (
                <Button
                  {...(isActionCta(cta)
                    ? { onClick: cta.onClick }
                    : { href: cta.url })}
                  variant="primary"
                  size="md"
                  className="bds-support-plan__cta"
                >
                  {cta.label}
                </Button>
              )}
            </Stack>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default SupportPlan;
