/**
 * CtaDarkCentered — React renderer. Twin of
 * `../astro/CtaDarkCentered.astro`. Closing CTA on a dark surface,
 * centered layout — heading + optional body + single primary action.
 *
 * Contract: BlueprintProps. `section.cta` is REQUIRED.
 *
 * @summary Closing CTA on dark surface, centered.
 */
import { Button } from '../../../components/ui/Button';
import type { BlueprintProps } from '../astro/types';
import './CtaDarkCentered.css';

interface Props extends BlueprintProps {}

export function CtaDarkCentered({ section }: Props) {
  const titleId = `${section.sectionKey}-title`;

  return (
    <section
      className="bp-cta-dark-centered"
      aria-labelledby={titleId}
      data-blueprint-key="cta_dark_centered"
    >
      <div className="bp-cta-dark-centered__container">
        <h2 id={titleId} className="bp-cta-dark-centered__title">
          {section.heading}
        </h2>
        {section.body && (
          <p className="bp-cta-dark-centered__description">{section.body}</p>
        )}
        {section.cta && (
          <Button href={section.cta.url} variant="primary" size="lg">
            {section.cta.label}
          </Button>
        )}
      </div>
    </section>
  );
}

export default CtaDarkCentered;
