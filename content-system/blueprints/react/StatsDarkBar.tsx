/**
 * StatsDarkBar — React twin of the Astro `stats_bar` blueprint
 * (brik-bds#2012, the deferred half of the #2010 parity reconcile).
 *
 * #2010 de-wired `stats_bar` from the Astro `BLUEPRINT_REGISTRY` to
 * restore Astro↔React parity, because the key had no React twin. The
 * component file and its barrel export stayed on disk, so the blueprint
 * dispatched through neither runtime while remaining `is_active: true` in
 * `blueprint-library.json`. This file is the re-wire half: with a twin in
 * place the key returns to both registries and the parity gate stays green.
 *
 * Horizontal row of proof-point stats on an inverse surface. Intentionally
 * dark-surfaced so the bar reads as a weighty proof moment, visually
 * distinct from the adjacent body of the page.
 *
 * Contract: BlueprintProps.
 *   - section.heading (optional) — rendered as a visually-hidden label so the
 *     stats region has an accessible name
 *   - section.items[] — REQUIRED shape, each: { title, description }
 *     title = the number/string, description = the caption underneath
 *
 * required_facts: []. Section-driven.
 *
 * a11y: semantic list (ul/li). `aria-labelledby` when `section.heading` is
 * present, `aria-label` fallback when it is not. The numbers are content,
 * not decoration — screen readers read them.
 *
 * @summary Proof-point stat row on an inverse surface.
 */
import { bdsClass } from '../../../components/utils';
import type { BlueprintProps } from '../astro/types';
import '../section-shell.css';
import './StatsDarkBar.css';

interface Props extends BlueprintProps {}

export function StatsDarkBar({ section }: Props) {
  const titleId = `${section.sectionKey}-title`;
  const hasHeading = Boolean(section.heading);

  return (
    <section
      className={bdsClass('bds-blueprint-section', 'bds-stats-dark-bar')}
      aria-labelledby={hasHeading ? titleId : undefined}
      aria-label={hasHeading ? undefined : 'Key stats'}
      data-blueprint-key="stats_bar"
    >
      {/* No family `__container` — the shell's centred band (ADR-021) is all
          this bar needs; the Astro twin's `bp-*__container` only re-declared
          the same max-width/inset. */}
      <div className="bds-blueprint-section__container">
        {hasHeading && (
          <h2 id={titleId} className="bds-visually-hidden">
            {section.heading}
          </h2>
        )}

        <ul className="bds-stats-dark-bar__list" role="list">
          {section.items.map((item) => (
            <li key={item.title} className="bds-stats-dark-bar__item">
              <span className="bds-stats-dark-bar__value">{item.title}</span>
              <span className="bds-stats-dark-bar__label">{item.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default StatsDarkBar;
