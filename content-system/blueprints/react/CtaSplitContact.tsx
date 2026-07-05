/**
 * CtaSplitContact — Phase D adapter (deprecated direct path).
 *
 * Adds the React twin the Astro-only `cta_split_contact` blueprint lacked
 * (brik-bds#582). Maps section data + `clientFacts.{phone,email}` onto
 * `<Cta layout="split">`, building the contact-method aside. New consumers
 * compose `<Cta layout="split">` directly. Retires alongside Phase E.
 *
 * required_facts: ['phone', 'email'] — the scaffold preflight gates this
 * blueprint before those are populated. If a fact arrives null at runtime the
 * method renders a `data-content-needed` stub in place of the link, matching
 * the Astro twin — CI grep on `dist/` blocks publish on the stub.
 *
 * @deprecated Use `<Cta layout="split">` directly.
 * @summary Legacy adapter — section + contact facts → `<Cta layout="split">`.
 */
import type { BlueprintProps } from '../astro/types';
import { Cta } from './Cta';

interface Props extends BlueprintProps {}

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

export function CtaSplitContact({ section, clientFacts }: Props) {
  const phone = clientFacts.phone;
  const email = clientFacts.email;

  return (
    <Cta
      layout="split"
      sectionKey={section.sectionKey}
      title={section.heading ?? ''}
      body={section.body ?? undefined}
      primaryCta={section.cta ?? undefined}
      data-blueprint-key="cta_split_contact"
      aside={
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
      }
    />
  );
}

export default CtaSplitContact;
