/**
 * CardGrid — generic section wrapper for any "header + grid of cards"
 * layout. Content-agnostic by design: serves services, blog posts,
 * customer stories, property listings, team bios, support plans, or
 * any other content shape that fits a card grid.
 *
 * Per the alignment ritual on brik-bds#580 (PR #584 closed, this is the
 * follow-up), the original `Services` framing was content-coupled —
 * same failure mode ADR-008 addressed at the blueprint layer applied
 * to the family layer. `bds-card-grid` is the structural primitive;
 * the consumer composes whatever items belong in the grid (typically
 * `<Card preset="display">`, but any ReactNode works).
 *
 * @example Direct composition (preferred):
 * ```tsx
 * <CardGrid
 *   sectionKey="other-services"
 *   title="Other Marketing Design Services"
 *   subtitle="More work for your audience"
 * >
 *   <Grid columns={3} gap="lg">
 *     {items.map(item => (
 *       <Card
 *         key={item.slug}
 *         preset="display"
 *         image={<Frame customRatio="3 / 2" fit="cover"><img src={item.imageUrl} alt=""/></Frame>}
 *         tag={<ServiceTag category={item.category} variant="icon-text" size="sm" serviceName={item.title}/>}
 *         title={item.title}
 *         description={item.description}
 *         action={<LinkButton href={item.href} variant="primary" size="sm">Learn more</LinkButton>}
 *       />
 *     ))}
 *   </Grid>
 * </CardGrid>
 * ```
 *
 * Token pairs (paired family ↔ size — never mix):
 *   subtitle    — --font-family-subtitle + --subtitle-lg + --text-transform-subtitle
 *   title (h2)  — --font-family-heading + clamp(--heading-lg, ..., --heading-huge)
 *   description — --font-family-body + --body-md
 *
 * @summary Generic section wrapper for any header + grid-of-cards layout.
 */
import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../../components/utils';
import './CardGrid.css';

export interface CardGridProps extends HTMLAttributes<HTMLElement> {
  /**
   * Stable section identifier. Drives the `aria-labelledby` id — the
   * same `sectionKey` SHOULD be used across renders for a given
   * section to keep the a11y plumbing stable.
   */
  sectionKey: string;
  /** Section heading text. Renders as `<h2>`. */
  title: string;
  /**
   * Optional eyebrow text rendered above the title. Uses
   * `--font-family-subtitle` with `--text-transform-subtitle: uppercase`
   * for the canonical eyebrow treatment.
   */
  subtitle?: string;
  /**
   * Optional one-line lead paragraph under the title. Pairs
   * `--font-family-body` with `--body-md` (a matched body family/size
   * pair — never reach across families for size).
   */
  description?: string;
  /** Composed grid + item content. */
  children: ReactNode;
}

export function CardGrid({
  sectionKey,
  title,
  subtitle,
  description,
  children,
  className,
  ...rest
}: CardGridProps) {
  const titleId = `${sectionKey}-title`;
  return (
    <section
      className={bdsClass('bds-card-grid', className)}
      aria-labelledby={titleId}
      data-blueprint-key="card_grid"
      {...rest}
    >
      <div className="bds-card-grid__container">
        <header className="bds-card-grid__header">
          {subtitle && (
            <p className="bds-card-grid__subtitle">{subtitle}</p>
          )}
          <h2 id={titleId} className="bds-card-grid__title">
            {title}
          </h2>
          {description && (
            <p className="bds-card-grid__description">{description}</p>
          )}
        </header>
        {children}
      </div>
    </section>
  );
}

export default CardGrid;
