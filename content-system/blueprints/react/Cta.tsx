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
 * Two ways to drive it, mirroring `../astro/Cta.astro` (#2352):
 *   - **Composed** — pass `title` / `body` / `primaryCta` / `aside` directly.
 *   - **Dispatched** — pass a `section` (+ `clientFacts`, `theme`) and an optional
 *     `layout`; the block maps `section.*` → its own props. The `split` layout
 *     also builds the contact-method aside from `clientFacts.{phone,email}`.
 *     `BlueprintDispatcher` sends `cta_centered` → `layout="default"` and
 *     `cta_split_contact` → `layout="split"`, with the key as `blueprintKey`.
 *
 * required_facts for `split`: ['phone', 'email'] — the scaffold preflight gates
 * the blueprint before those are populated. If a fact arrives null at runtime the
 * method renders a `data-content-needed` stub in place of the link — CI grep on
 * `dist/` blocks publish on the stub.
 *
 * Slots (all pass `scripts/slot-pattern-check.mjs`):
 *   bds-cta, __container, __message, __title, __description, __actions, __aside
 *
 * Composed with the shared shell (ADR-021): `bds-blueprint-section` on the root,
 * `bds-blueprint-section__container` on the container.
 *
 * Token pairs (paired family ↔ size — never mix):
 *   title (h2)  — --bds-font-family-heading + clamp(--bds-heading-xl … --bds-display-sm)
 *   description — --bds-font-family-body + --bds-heading-sm
 *
 * a11y: `<section>` with `aria-labelledby` → the h2. The default layout is
 * center-aligned but reading order stays natural (heading → body → actions).
 *
 * @summary Closing CTA — single-column default or two-column `--split`, with a primary + optional secondary action.
 */
import { type HTMLAttributes, type ReactNode } from 'react';

import { Button } from '../../../components';
import { bdsClass } from '../../../components/utils';
import type {
  BlueprintAlign,
  BlueprintCta,
  BlueprintProps,
  CtaLayout,
  KnownBlueprintKey,
} from '../astro/types';
import { isActionCta } from '../astro/types';
import '../section-shell.css';
import './Cta.css';

// Declared once in the rails' shared contract module so a layout cannot be
// added to one rail only (#2302); re-exported here so the public
// `import type { CtaLayout } from './Cta'` path is unchanged.
export type { CtaLayout };

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
   * Content placement for the `default` layout (structure axis, ADR-039).
   * `center` (default) is the centred closing prompt; `left` flushes the
   * heading → body → actions to the start. Emits the enum-bound
   * `bds-cta--align-left` modifier. Moot for `split`, which is inherently
   * two-column left-aligned.
   */
  align?: BlueprintAlign;
  /**
   * Right-column content for the `split` layout (e.g. contact methods).
   * Ignored when `layout` is `default`.
   */
  aside?: ReactNode;
}

/**
 * Dispatched-mode props: a `BlueprintSection` plus the key's own `layout` /
 * `blueprintKey` (what `BlueprintDispatcher` passes). `align` is not read here —
 * the dispatched path never carried it (the Astro rail reads it from the section;
 * the React adapters did not, and this collapse must not change the markup).
 */
export interface CtaSectionProps extends BlueprintProps {
  /** `default` (centred closing prompt) or `split` (message + contact aside). */
  layout?: CtaLayout;
  /** Rendered as `data-blueprint-key` so the scaffold contract can assert on it. */
  blueprintKey?: KnownBlueprintKey;
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

function CtaShell({
  sectionKey,
  title,
  body,
  primaryCta,
  secondaryCta,
  layout = 'default',
  align = 'center',
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
      className={bdsClass(
        'bds-blueprint-section',
        'bds-cta',
        isSplit && 'bds-cta--split',
        // Alignment is a choice only for the default single-column layout;
        // split is inherently left-aligned two-column.
        !isSplit && align === 'left' && 'bds-cta--align-left',
        className,
      )}
      aria-labelledby={titleId}
      {...rest}
    >
      <div className="bds-blueprint-section__container bds-cta__container">
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

function ContactMethod({
  fact,
  label,
  value,
  href,
}: {
  fact: string;
  label: string;
  value: string | null;
  href: string | null;
}) {
  if (value && href) {
    return (
      <a href={href} className="bds-cta__method">
        <span className="bds-cta__method-label">{label}</span>
        <span className="bds-cta__method-value">{value}</span>
      </a>
    );
  }
  return (
    <div className="bds-cta__method" data-content-needed={fact} role="presentation">
      <span className="bds-cta__method-label">{label}</span>
      <span className="bds-cta__method-value">{label} missing</span>
    </div>
  );
}

function CtaFromSection({ section, clientFacts, layout = 'default', blueprintKey }: CtaSectionProps) {
  const phone = clientFacts.phone;
  const email = clientFacts.email;

  return (
    <CtaShell
      layout={layout}
      sectionKey={section.sectionKey}
      title={section.heading ?? ''}
      body={section.body ?? undefined}
      primaryCta={section.cta ?? undefined}
      data-blueprint-key={blueprintKey}
      aside={
        layout === 'split' ? (
          <>
            <ContactMethod
              fact="phone"
              label="Call"
              value={phone}
              href={phone ? `tel:${phone.replace(/[^+\d]/g, '')}` : null}
            />
            <ContactMethod
              fact="email"
              label="Email"
              value={email}
              href={email ? `mailto:${email}` : null}
            />
          </>
        ) : undefined
      }
    />
  );
}

export function Cta(props: CtaProps | CtaSectionProps) {
  return 'section' in props ? <CtaFromSection {...props} /> : <CtaShell {...props} />;
}

export default Cta;
