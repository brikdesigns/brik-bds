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
 * `<Card layout="stack">`, but any ReactNode works).
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
 *         layout="stack"
 *         media={<Frame customRatio="3 / 2" fit="cover"><img src={item.imageUrl} alt=""/></Frame>}
 *         overline={<ServiceTag category={item.category} variant="icon-text" size="sm" serviceName={item.title}/>}
 *         title={item.title}
 *         action={<LinkButton href={item.href} variant="primary" size="sm">Learn more</LinkButton>}
 *       >
 *         <CardDescription>{item.description}</CardDescription>
 *       </Card>
 *     ))}
 *   </Grid>
 * </CardGrid>
 * ```
 *
 * Two ways to drive it, mirroring `../astro/CardGrid.astro` (#2352): **composed**
 * (the example above — the consumer supplies `children`) or **dispatched** (a
 * `section` + a `layout`; the block renders `section.items` itself).
 * `BlueprintDispatcher` sends `card_grid` → `layout="card-grid"` (3-column
 * `<Card layout="stack">` grid) and `two_column_detail` → `layout="two-column-list"`
 * (2-column title/description rows, no card surface). Both emit
 * `data-blueprint-key="card_grid"`.
 *
 * Token pairs (paired family ↔ size — never mix):
 *   subtitle    — --bds-font-family-subtitle + --bds-subtitle-lg + --bds-text-transform-subtitle
 *   title (h2)  — --bds-font-family-heading + clamp(--bds-heading-lg, ..., --bds-heading-huge)
 *   description — --bds-font-family-body + --bds-body-md
 *
 * Composed with the shared shell (ADR-021): `bds-blueprint-section` on the root,
 * `bds-blueprint-section__container` on the container. This family keeps its heavier
 * bottom inset as a documented rhythm exception in CardGrid.css.
 *
 * @summary Generic section wrapper for any header + grid-of-cards layout.
 */
import { type HTMLAttributes, type ReactNode } from 'react';
import {
  Badge,
  Button,
  Card,
  CardDescription,
  Frame,
  Grid,
  ServiceTag,
  Stack,
  type ServiceLine,
} from '../../../components';
import { bdsClass } from '../../../components/utils';
import type { BlueprintProps, CardGridLayout } from '../astro/types';
import { BlockMedia } from './BlockMedia';
import '../section-shell.css';
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
   * `--bds-font-family-subtitle` with `--bds-text-transform-subtitle: uppercase`
   * for the canonical eyebrow treatment.
   */
  subtitle?: string;
  /**
   * Optional one-line lead paragraph under the title. Pairs
   * `--bds-font-family-body` with `--bds-body-md` (a matched body family/size
   * pair — never reach across families for size).
   */
  description?: string;
  /** Composed grid + item content. */
  children: ReactNode;
}

/** Dispatched-mode props: a `BlueprintSection` plus the item `layout`. */
export interface CardGridSectionProps extends BlueprintProps {
  /** Item layout rendered from `section.items`. Defaults to `card-grid`. */
  layout?: CardGridLayout;
}

// Reset for the `<ul>` item lists below — no token values, so inline is fine.
const LIST_RESET = { listStyle: 'none', margin: 0, padding: 0 } as const;

function CardGridShell({
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
      className={bdsClass('bds-blueprint-section', 'bds-card-grid', className)}
      aria-labelledby={titleId}
      data-blueprint-key="card_grid"
      {...rest}
    >
      <div className="bds-blueprint-section__container">
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

function CardGridFromSection({ section, layout = 'card-grid' }: CardGridSectionProps) {
  return (
    <CardGridShell
      sectionKey={section.sectionKey}
      title={section.heading ?? ''}
      subtitle={section.subheading ?? undefined}
      description={section.body ?? undefined}
    >
      {layout === 'two-column-list' ? (
        <Grid as="ul" columns={2} gap="xl" role="list" style={LIST_RESET}>
          {section.items.map((item, idx) => (
            <li key={`${section.sectionKey}-${idx}`}>
              <Stack gap="sm">
                <h3 className="bds-card-grid__item-title">{item.title}</h3>
                <p className="bds-card-grid__item-description">{item.description}</p>
              </Stack>
            </li>
          ))}
        </Grid>
      ) : (
        <Grid as="ul" columns={3} gap="lg" role="list" style={LIST_RESET}>
          {section.items.map((item, idx) => {
            const category = (item.category ?? null) as ServiceLine | null;
            return (
              <li key={`${section.sectionKey}-${idx}`} style={{ display: 'flex' }}>
                <Card
                  layout="stack"
                  title={item.title}
                  media={
                    item.imageUrl ? (
                      <BlockMedia
                        media="image"
                        src={item.imageUrl}
                        alt={item.imageAlt ?? ''}
                        ratio="3-2"
                        fit="cover"
                      />
                    ) : category ? (
                      <Frame customRatio="3 / 2" fit="cover">
                        <ServiceTag
                          category={category}
                          variant="icon"
                          size="lg"
                          serviceName={item.title}
                        />
                      </Frame>
                    ) : undefined
                  }
                  overline={
                    category ? (
                      <ServiceTag
                        category={category}
                        variant="icon-text"
                        size="sm"
                        serviceName={item.title}
                      />
                    ) : undefined
                  }
                  badge={
                    item.hasOptions ? (
                      <Badge status="positive" size="sm" appearance="solid">
                        Has Options
                      </Badge>
                    ) : undefined
                  }
                  action={
                    item.href ? (
                      <Button href={item.href} variant="primary" size="sm">
                        Learn more
                      </Button>
                    ) : undefined
                  }
                >
                  {item.description ? (
                    <CardDescription>{item.description}</CardDescription>
                  ) : undefined}
                </Card>
              </li>
            );
          })}
        </Grid>
      )}
    </CardGridShell>
  );
}

export function CardGrid(props: CardGridProps | CardGridSectionProps) {
  return 'section' in props ? (
    <CardGridFromSection {...props} />
  ) : (
    <CardGridShell {...props} />
  );
}

export default CardGrid;
