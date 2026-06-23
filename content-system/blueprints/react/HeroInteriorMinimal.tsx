/**
 * HeroInteriorMinimal — React renderer. Twin of
 * `../astro/HeroInteriorMinimal.astro`. Text-only interior page hero —
 * eyebrow + headline + optional lead, no image. Owns the h1 for the
 * page.
 *
 * Contract: BlueprintProps (section + clientFacts + theme).
 *
 * Token-name note: the Astro source uses several token names that
 * silently fall back to browser defaults today (e.g. `--space-xl`,
 * `--line-height-tight`). The React port consumes canonical names
 * that resolve in `dist/tokens.css` (`--padding-lg`, `--font-line-
 * height-tight`). Visual output is closer to designer intent than the
 * Astro version currently produces; the gap-fills fix is tracked
 * separately.
 *
 * @summary Interior page hero — eyebrow + h1 + optional lead, no image.
 */
import { Button } from '../../../components/ui/Button';
import type { BlueprintProps } from '../astro/types';
import { isActionCta } from '../astro/types';
import './HeroInteriorMinimal.css';

interface Props extends BlueprintProps {}

export function HeroInteriorMinimal({ section }: Props) {
  const titleId = `${section.sectionKey}-title`;
  const eyebrow = section.subheading;
  const headline = section.heading ?? '';
  const lead = section.body;
  const cta = section.cta;

  return (
    <section
      className="bp-hero-interior-minimal"
      aria-labelledby={titleId}
      data-blueprint-key="hero_interior_minimal"
    >
      <div className="bp-hero-interior-minimal__container">
        {eyebrow && (
          <p className="bp-hero-interior-minimal__subtitle">{eyebrow}</p>
        )}
        <h1 id={titleId} className="bp-hero-interior-minimal__title">
          {headline}
        </h1>
        {lead && <p className="bp-hero-interior-minimal__lead">{lead}</p>}
        {cta && (
          <Button
            {...(isActionCta(cta) ? { onClick: cta.onClick } : { href: cta.url })}
            variant="primary"
            size="md"
          >
            {cta.label}
          </Button>
        )}
      </div>
    </section>
  );
}

export default HeroInteriorMinimal;
