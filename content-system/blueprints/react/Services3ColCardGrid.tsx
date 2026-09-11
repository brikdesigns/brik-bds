/**
 * Services3ColCardGrid — blueprint-key adapter (supported: ADR-037 §2).
 *
 * After brik-bds#580, the canonical primitives are `<CardGrid>`
 * (section wrapper) and `<Card layout="stack">` (the malleable item
 * card). This file remains as an adapter so the legacy
 * `card_grid` blueprint key continues to dispatch through
 * `BlueprintDispatcher` with the same section-data contract that
 * AI-generated pages expect — the adapter performs the section.items[]
 * → composed-children translation internally.
 *
 * New consumers should compose `<CardGrid>` + `<Card layout="stack">`
 * directly. It is the supported dispatch path for its blueprint key, which three
 * published client sites resolve; it is not deprecated (ADR-037 §2).
 *
 * @summary Key adapter — composes `<CardGrid>` + `<Grid>` + `<Card>` items.
 */
import {
  Badge,
  Button,
  Card,
  CardDescription,
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
                layout="stack"
                title={item.title}
                media={
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
    </CardGrid>
  );
}

export default Services3ColCardGrid;
