/**
 * LogoWall — logo / partner / trust strip. Astro twin: `../astro/LogoWall.astro`.
 *
 * The first block to adopt the content-motion axis (ADR-039 §Decision 2,
 * brik-bds#2529): its logo strip dispatches through the shared
 * `BlockContentMotion` — `contentMotion: marquee` scrolls the strip through the
 * `Marquee` primitive, `none` (default) renders a static centered wrapped row.
 * A blueprint component unreachable from the dispatcher cannot ship (#2012), so
 * `BlockContentMotion` lands with this block rather than standalone.
 *
 * Content-agnostic: serves client logos, partner badges, press mentions, trust
 * marks. Section-driven — each `section.items[]` entry is one logo:
 *   - `imageUrl` — the logo asset (consumer supplies a pre-monochromed SVG/PNG)
 *   - `imageAlt` — accessible name; falls back to `title` (the brand name)
 *   - `href`     — optional link wrapping the logo
 *
 * required_facts: []. Section-driven.
 *
 * a11y: a labelled region — `aria-labelledby` when `section.heading` is present
 * (rendered as a visible eyebrow), `aria-label` fallback when it is not. Logo
 * images carry their own alt; `marquee`'s duplicate track group is aria-hidden
 * by the `Marquee` primitive so the set is announced once.
 *
 * @summary Logo / partner / trust strip — static or marquee-scrolled via the content-motion axis.
 */
import { bdsClass } from '../../../components/utils';
import type { BlueprintProps } from '../astro/types';
import { BlockContentMotion } from './BlockContentMotion';
import '../section-shell.css';
import './LogoWall.css';

interface Props extends BlueprintProps {}

export function LogoWall({ section }: Props) {
  const titleId = `${section.sectionKey}-title`;
  const hasHeading = Boolean(section.heading);
  const motion = section.contentMotion ?? 'none';

  const logos = section.items.map((item, i) =>
    item.href ? (
      <a key={`${item.title}-${i}`} href={item.href}>
        <img src={item.imageUrl} alt={item.imageAlt ?? item.title} loading="lazy" />
      </a>
    ) : (
      <img key={`${item.title}-${i}`} src={item.imageUrl} alt={item.imageAlt ?? item.title} loading="lazy" />
    ),
  );

  return (
    <section
      className={bdsClass('bds-blueprint-section', 'bds-logo-wall')}
      aria-labelledby={hasHeading ? titleId : undefined}
      aria-label={hasHeading ? undefined : 'Trusted by'}
      data-blueprint-key="logo_wall"
    >
      <div className="bds-blueprint-section__container">
        {hasHeading && (
          <h2 id={titleId} className="bds-logo-wall__title">
            {section.heading}
          </h2>
        )}

        <div className="bds-logo-wall__strip" data-motion={motion}>
          <BlockContentMotion contentMotion={motion}>{logos}</BlockContentMotion>
        </div>
      </div>
    </section>
  );
}

export default LogoWall;
