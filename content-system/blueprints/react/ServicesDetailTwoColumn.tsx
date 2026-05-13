/**
 * ServicesDetailTwoColumn — Phase D adapter (deprecated direct path).
 *
 * After ADR-008 / brik-bds#580, the canonical primitive is `<Services>`
 * (`./Services.tsx`) composed with `<Grid>` + a list of title/description
 * items. This file remains as an adapter so the legacy
 * `services_detail_two_column` blueprint key continues to dispatch
 * through `BlueprintDispatcher` with the same section-data contract that
 * AI-generated pages expect — the adapter performs the section.items[] →
 * composed-children translation internally.
 *
 * New consumers should compose `<Services>` directly per the example in
 * `Services.tsx`. This adapter is kept for backwards compatibility with
 * the dispatcher path and industries-TS-files registry until Phase E.
 *
 * @deprecated Use `<Services>` directly with children composition.
 * @summary Legacy adapter — composes `<Services>` + 2-column list.
 */
import { type CSSProperties } from 'react';

import { Grid, Stack } from '../../../components';
import type { BlueprintProps } from '../astro/types';
import { Services } from './Services';

interface Props extends BlueprintProps {}

const LIST_STYLE: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

const TITLE_STYLE: CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--heading-md)',
  fontWeight: 'var(--font-weight-semibold)',
  lineHeight: 'var(--font-line-height-tight)',
  color: 'var(--text-primary)',
};

const DESC_STYLE: CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-xl)',
  lineHeight: 'var(--font-line-height-relaxed)',
  color: 'var(--text-primary)',
};

export function ServicesDetailTwoColumn({ section }: Props) {
  return (
    <Services
      sectionKey={section.sectionKey}
      title={section.heading ?? ''}
      subtitle={section.subheading ?? undefined}
      description={section.body ?? undefined}
    >
      <Grid as="ul" columns={2} gap="xl" role="list" style={LIST_STYLE}>
        {section.items.map((item, idx) => (
          <li key={`${section.sectionKey}-${idx}`}>
            <Stack gap="sm">
              <h3 style={TITLE_STYLE}>{item.title}</h3>
              <p style={DESC_STYLE}>{item.description}</p>
            </Stack>
          </li>
        ))}
      </Grid>
    </Services>
  );
}

export default ServicesDetailTwoColumn;
