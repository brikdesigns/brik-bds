/**
 * Cta — canonical `bds-cta` closing-CTA section primitive (Phase D,
 * brik-bds#582). Replaces the legacy `CtaDarkCentered` blueprint, whose
 * `bp-cta-dark-centered` class baked theme (`dark`) and alignment
 * (`centered`) into the name — both banned by ADR-008 §3 because they lie
 * when the section is themed or restructured. The structural truth is a
 * single-column closing CTA; the two-column copy-plus-contact variant is
 * the `--split` modifier (structural, theme-independent).
 *
 * Two layouts:
 *   default  — `bds-cta`         single centered content column
 *   split    — `bds-cta--split`  message left, `aside` (e.g. contact
 *              methods) right
 *
 * Supports a primary + optional secondary action (brik-bds#590 — the
 * "do the thing" + "hedge / talk first" pair common on marketing closing
 * sections, which the single-`cta` legacy contract couldn't express).
 *
 * This is the props-based primitive (mirrors `<SupportPlan>` / `<CardGrid>`).
 * New consumers compose it directly; the `cta_dark_centered` and
 * `cta_split_contact` blueprint keys dispatch through their adapters, which
 * map `section.*` → these props. The adapters retire in Phase E.
 *
 * Slots (all pass `scripts/slot-pattern-check.mjs`):
 *   bds-cta, __container, __message, __title, __description, __actions, __aside
 *
 * Token pairs (paired family ↔ size — never mix):
 *   title (h2)  — --font-family-heading + clamp(--heading-xl … --display-sm)
 *   description — --font-family-body + --heading-sm
 *
 * a11y: `<section>` with `aria-labelledby` → the h2. The default layout is
 * center-aligned but reading order stays natural (heading → body → actions).
 *
 * @summary Closing CTA — single-column default or two-column `--split`, with a primary + optional secondary action.
 */
import { type HTMLAttributes, type ReactNode } from 'react';

import { Button } from '../../../components';
import { bdsClass } from '../../../components/utils';
import type { BlueprintCta } from '../astro/types';
import { isActionCta } from '../astro/types';
import './Cta.css';

export type CtaLayout = 'default' | 'split';

export interface CtaProps extends HTMLAttributes<HTMLElement> {
  /**
   * Stable section identifier. Drives the `aria-labelledby` id — keep it
   * stable across renders for a given section.
   */
  sectionKey: string;
  /** Section heading. Renders as `<h2>`. */
  title: string;
  /** Optional supporting paragraph under the heading. */
  body?: string;
  /** Primary action — the "do the thing" button. Link (`url`) or action (`onClick`). */
  primaryCta?: BlueprintCta;
  /**
   * Optional secondary action — the "talk first / hedge" button
   * (brik-bds#590). Rendered after the primary with a lower-emphasis variant.
   */
  secondaryCta?: BlueprintCta;
  /**
   * `default` = single centered content column (the closing-CTA workhorse).
   * `split` = two-column layout with `aside` on the right.
   */
  layout?: CtaLayout;
  /**
   * Right-column content for the `split` layout (e.g. contact methods).
   * Ignored when `layout` is `default`.
   */
  aside?: ReactNode;
}

function CtaButton({
  cta,
  variant,
  defaultSize,
}: {
  cta: BlueprintCta;
  variant: 'primary' | 'secondary';
  defaultSize: 'md' | 'lg';
}) {
  return (
    <Button
      {...(isActionCta(cta) ? { onClick: cta.onClick } : { href: cta.url })}
      variant={variant}
      size={cta.size ?? defaultSize}
    >
      {cta.label}
    </Button>
  );
}

export function Cta({
  sectionKey,
  title,
  body,
  primaryCta,
  secondaryCta,
  layout = 'default',
  aside,
  className,
  ...rest
}: CtaProps) {
  const titleId = `${sectionKey}-title`;
  const isSplit = layout === 'split';
  // Split copy sits on a light surface at a smaller default size; the default
  // layout is the large closing prompt on the inverse surface.
  const defaultSize = isSplit ? 'md' : 'lg';

  return (
    <section
      className={bdsClass('bds-cta', isSplit && 'bds-cta--split', className)}
      aria-labelledby={titleId}
      {...rest}
    >
      <div className="bds-cta__container">
        <div className="bds-cta__message">
          <h2 id={titleId} className="bds-cta__title">
            {title}
          </h2>
          {body && <p className="bds-cta__description">{body}</p>}
          {(primaryCta || secondaryCta) && (
            <div className="bds-cta__actions">
              {primaryCta && (
                <CtaButton cta={primaryCta} variant="primary" defaultSize={defaultSize} />
              )}
              {secondaryCta && (
                <CtaButton cta={secondaryCta} variant="secondary" defaultSize={defaultSize} />
              )}
            </div>
          )}
        </div>

        {isSplit && aside && <div className="bds-cta__aside">{aside}</div>}
      </div>
    </section>
  );
}

export default Cta;
