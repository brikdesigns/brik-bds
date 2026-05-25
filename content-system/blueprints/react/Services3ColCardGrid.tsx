/**
 * Services3ColCardGrid — Phase D adapter (deprecated direct path).
 *
 * After brik-bds#580, the canonical primitives are `<CardGrid>`
 * (section wrapper) and `<Card preset="display">` (the malleable item
 * card). This file remains as an adapter so the legacy
 * `services_3col_card_grid` blueprint key continues to dispatch through
 * `BlueprintDispatcher` with the same section-data contract that
 * AI-generated pages expect — the adapter performs the section.items[]
 * → composed-children translation internally.
 *
 * New consumers should compose `<CardGrid>` + `<Card preset="display">`
 * directly. This adapter retires alongside Phase E.
 *
 * @deprecated Use `<CardGrid>` + `<Card preset="display">` directly.
 * @summary Legacy adapter — composes `<CardGrid>` + `<Grid>` + `<Card>` items.
 */
import {
  Badge,
  Button,
  Card,
  Frame,
  Grid,
  ServiceTag,
  type ServiceLine,
} from '../../../components';

import type { BlueprintProps } from '../astro/types';
import { CardGrid } from './CardGrid';

interface Props extends BlueprintProps {}

export function Services3ColCardGrid({ section }: Props) {
  return (
    <CardGrid
      sectionKey={section.sectionKey}
      title={section.heading ?? ''}
      subtitle={section.subheading ?? undefined}
      description={section.body ?? undefined}
    >
      <Grid
        as="ul"
        columns={3}
        gap="lg"
        role="list"
        style={{ listStyle: 'none', margin: 0, padding: 0 }}
      >
        {section.items.map((item, idx) => {
          const category = (item.category ?? null) as ServiceLine | null;
          return (
            <li
              key={`${section.sectionKey}-${idx}`}
              style={{ display: 'flex' }}
            >
              <Card
                preset="display"
                title={item.title}
                description={item.description}
                image={
                  item.imageUrl ? (
                    <Frame customRatio="3 / 2" fit="cover">
                      <img
                        src={item.imageUrl}
                        alt={item.imageAlt ?? ''}
                        loading="lazy"
                        decoding="async"
                      />
                    </Frame>
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
                tag={
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
              />
            </li>
          );
        })}
      </Grid>
    </CardGrid>
  );
}

export default Services3ColCardGrid;
