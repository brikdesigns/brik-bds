/**
 * Services3ColCardGrid — Phase D adapter (deprecated direct path).
 *
 * After ADR-008 / brik-bds#580, the canonical primitive is `<Services>`
 * (`./Services.tsx`) composed with `<Grid>` + `<Card>` children. This
 * file remains as an adapter so the legacy `services_3col_card_grid`
 * blueprint key continues to dispatch through `BlueprintDispatcher` with
 * the same section-data contract that AI-generated pages expect — the
 * adapter performs the section.items[] → composed-children translation
 * internally.
 *
 * New consumers should compose `<Services>` directly per the example in
 * `Services.tsx`. This adapter is kept for backwards compatibility with
 * the dispatcher path and industries-TS-files registry until Phase E.
 *
 * @deprecated Use `<Services>` directly with children composition.
 * @summary Legacy adapter — composes `<Services>` + `<Grid>` + `<Card>`.
 */
import { type CSSProperties } from 'react';

import {
  Badge,
  Card,
  Frame,
  Grid,
  LinkButton,
  ServiceTag,
  Stack,
  type ServiceCategory,
} from '../../../components';

import type { BlueprintProps } from '../astro/types';
import { Services } from './Services';

interface Props extends BlueprintProps {}

const CARD_STYLE: CSSProperties = {
  overflow: 'hidden',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
};

const MEDIA_WRAP_STYLE: CSSProperties = {
  position: 'relative',
};

const HAS_OPTIONS_STYLE: CSSProperties = {
  position: 'absolute',
  top: 'var(--gap-md)',
  right: 'var(--gap-md)',
  display: 'inline-flex',
};

const DESCRIPTION_STYLE: CSSProperties = {
  padding: 'var(--padding-lg)',
  flex: '1 1 auto',
};

const CTA_ROW_STYLE: CSSProperties = {
  marginTop: 'auto',
};

const ARROW_STYLE: CSSProperties = { display: 'inline-block' };

export function Services3ColCardGrid({ section }: Props) {
  return (
    <Services
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
          const category = (item.category ?? null) as ServiceCategory | null;
          return (
            <li
              key={`${section.sectionKey}-${idx}`}
              style={{ display: 'flex' }}
            >
              <Card variant="outlined" padding="none" style={CARD_STYLE}>
                <div style={MEDIA_WRAP_STYLE}>
                  <Frame customRatio="3 / 2" fit="cover">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.imageAlt ?? ''}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      category && (
                        <span aria-hidden="true">
                          <ServiceTag
                            category={category}
                            variant="icon"
                            size="lg"
                            serviceName={item.title}
                          />
                        </span>
                      )
                    )}
                  </Frame>
                  {item.hasOptions && (
                    <span style={HAS_OPTIONS_STYLE}>
                      <Badge status="positive" size="sm" appearance="solid">
                        Has Options
                      </Badge>
                    </span>
                  )}
                </div>

                <Stack gap="md" style={DESCRIPTION_STYLE}>
                  {category && (
                    <ServiceTag
                      category={category}
                      variant="icon-text"
                      size="sm"
                      serviceName={item.title}
                    />
                  )}
                  <h3>{item.title}</h3>
                  {item.description && <p>{item.description}</p>}
                  {item.href && (
                    <div style={CTA_ROW_STYLE}>
                      <LinkButton
                        href={item.href}
                        variant="ghost"
                        size="sm"
                        iconAfter={
                          <span aria-hidden="true" style={ARROW_STYLE}>
                            →
                          </span>
                        }
                      >
                        Learn more
                      </LinkButton>
                    </div>
                  )}
                </Stack>
              </Card>
            </li>
          );
        })}
      </Grid>
    </Services>
  );
}

export default Services3ColCardGrid;
