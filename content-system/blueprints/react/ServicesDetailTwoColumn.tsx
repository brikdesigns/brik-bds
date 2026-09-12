/**
 * ServicesDetailTwoColumn — blueprint-key adapter (supported: ADR-037 §2).
 *
 * After brik-bds#580, the canonical primitive is `<CardGrid>` composed
 * with consumer-supplied list content. This file remains as an adapter
 * so the legacy `two_column_detail` blueprint key continues to
 * dispatch through `BlueprintDispatcher` with the same section-data
 * contract.
 *
 * The 2-column list shape here doesn't use `<Card layout="stack">` —
 * these are plain title/description rows with no card surface. The
 * typography pairs respect the family↔size rule:
 *   title (h3)  — --font-family-heading + --heading-md
 *   description — --font-family-body + --body-md
 *
 * @summary Key adapter — `<CardGrid>` + 2-col title/desc list.
 */
import { type CSSProperties } from 'react';

import { Grid, Stack } from '../../../components';
import type { BlueprintProps } from '../astro/types';
import { CardGrid } from './CardGrid';

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
  fontSize: 'var(--body-md)',
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-primary)',
};

export function ServicesDetailTwoColumn({ section }: Props) {
  return (
    <CardGrid
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
    </CardGrid>
  );
}

export default ServicesDetailTwoColumn;
