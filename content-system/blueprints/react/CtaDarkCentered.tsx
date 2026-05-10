/**
 * CtaDarkCentered — React renderer. Twin of
 * `../astro/CtaDarkCentered.astro`. Closing CTA on a dark surface,
 * centered layout — heading + optional body + single primary action.
 *
 * Contract: BlueprintProps. `section.cta` is REQUIRED.
 *
 * @summary Closing CTA on dark surface, centered.
 */
import { LinkButton } from '../../../components/ui/Button/LinkButton';
import type { BlueprintProps } from '../astro/types';
import './CtaDarkCentered.css';

interface Props extends BlueprintProps {}

export function CtaDarkCentered({ section }: Props) {
  const headingId = `bp-cta-dark-centered-${section.sectionKey}-h`;

  return (
    <section
      className="bp-cta-dark-centered"
      aria-labelledby={headingId}
      data-blueprint-key="cta_dark_centered"
    >
      <div className="bp-cta-dark-centered__container">
        <h2 id={headingId} className="bp-cta-dark-centered__heading">
          {section.heading}
        </h2>
        {section.body && (
          <p className="bp-cta-dark-centered__body">{section.body}</p>
        )}
        {section.cta && (
          <LinkButton href={section.cta.url} variant="primary" size="lg">
            {section.cta.label}
          </LinkButton>
        )}
      </div>
    </section>
  );
}

export default CtaDarkCentered;
