/**
 * ServicesDetailTwoColumn — React renderer. Twin of
 * `../astro/ServicesDetailTwoColumn.astro`. Service listing with a
 * 2-column grid of `{ title, description }` items. Used on home pages
 * as a services overview and on services-index pages as the canonical
 * grid.
 *
 * Contract: BlueprintProps.
 *
 * @summary Services overview — 2-column grid of title/description rows.
 */
import type { BlueprintProps } from '../astro/types';
import './ServicesDetailTwoColumn.css';

interface Props extends BlueprintProps {}

export function ServicesDetailTwoColumn({ section }: Props) {
  const titleId = `${section.sectionKey}-title`;

  return (
    <section
      className="bp-services-two-col"
      aria-labelledby={titleId}
      data-blueprint-key="services_detail_two_column"
    >
      <div className="bp-services-two-col__container">
        <header className="bp-services-two-col__header">
          {section.subheading && (
            <p className="bp-services-two-col__subtitle">{section.subheading}</p>
          )}
          <h2 id={titleId} className="bp-services-two-col__title">
            {section.heading}
          </h2>
          {section.body && (
            <p className="bp-services-two-col__lead">{section.body}</p>
          )}
        </header>

        <ul className="bp-services-two-col__list" role="list">
          {section.items.map((item, idx) => (
            <li
              key={`${section.sectionKey}-${idx}`}
              className="bp-services-two-col__item"
            >
              <h3 className="bp-services-two-col__item-title">{item.title}</h3>
              <p className="bp-services-two-col__item-desc">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default ServicesDetailTwoColumn;
