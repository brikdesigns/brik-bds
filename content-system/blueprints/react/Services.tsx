/**
 * Services — section wrapper for the bds-services blueprint family.
 *
 * Per ADR-008, one block per family with structural composition pushed to
 * layout primitives. This component owns ONLY the section-level concerns
 * (heading, container, padding rhythm, aria semantics). Item layout (grid
 * vs list, column count, card shape) is consumer-composed via children —
 * typically `<Grid>` + `<Card>` for card grids, or a plain list for
 * two-column title/description layouts.
 *
 * The legacy `Services3ColCardGrid` and `ServicesDetailTwoColumn`
 * blueprints (Phase D consolidation target — brik-bds#580) become thin
 * adapters that compose this component. AI-render path via
 * `BlueprintDispatcher` is preserved through those adapters; direct
 * consumers (brikdesigns/brikdesigns#100 dogfood) skip the adapters and
 * compose the new primitive directly.
 *
 * @example Direct composition (preferred for new consumers):
 * ```tsx
 * <Services
 *   sectionKey="other-services"
 *   title="Other Marketing Design Services"
 *   subtitle="More work for your audience"
 * >
 *   <Grid columns={3} gap="lg">
 *     {items.map(item => (
 *       <Card key={item.slug} variant="outlined">…</Card>
 *     ))}
 *   </Grid>
 * </Services>
 * ```
 *
 * @example Two-column title/description list:
 * ```tsx
 * <Services sectionKey="what-we-do" title="What we do">
 *   <Grid as="ul" columns={2} gap="xl" role="list">
 *     {items.map(item => (
 *       <li key={item.title}>
 *         <h3>{item.title}</h3>
 *         <p>{item.description}</p>
 *       </li>
 *     ))}
 *   </Grid>
 * </Services>
 * ```
 *
 * @summary Section wrapper for service-line blueprints; consumer composes items.
 */
import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../../components/utils';
import './Services.css';

export interface ServicesProps extends HTMLAttributes<HTMLElement> {
  /**
   * Stable section identifier. Used to derive the `aria-labelledby` id —
   * the same `sectionKey` value SHOULD be used across renders for a
   * given section to keep the a11y plumbing stable.
   */
  sectionKey: string;
  /** Section heading text. Renders as `<h2>`. */
  title: string;
  /** Optional eyebrow text rendered above the title (uppercased via CSS). */
  subtitle?: string;
  /**
   * Optional one-line lead paragraph under the title. Renders as `<p>`
   * with the `__description` slot — the same slot reused for any
   * section-level description copy on the family block.
   */
  description?: string;
  /** Composed item content — typically `<Grid>` + `<Card>` or a list. */
  children: ReactNode;
}

export function Services({
  sectionKey,
  title,
  subtitle,
  description,
  children,
  className,
  ...rest
}: ServicesProps) {
  const titleId = `${sectionKey}-title`;
  return (
    <section
      className={bdsClass('bds-services', className)}
      aria-labelledby={titleId}
      data-blueprint-key="services"
      {...rest}
    >
      <div className="bds-services__container">
        <header className="bds-services__header">
          {subtitle && (
            <p className="bds-services__subtitle">{subtitle}</p>
          )}
          <h2 id={titleId} className="bds-services__title">
            {title}
          </h2>
          {description && (
            <p className="bds-services__description">{description}</p>
          )}
        </header>
        {children}
      </div>
    </section>
  );
}

export default Services;
