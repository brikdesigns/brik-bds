import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataSection } from '../DataSection';
import { Field } from '../Field';
import { FieldGrid } from '../FieldGrid';
import { BulletList } from '../BulletList';
import { Button } from '../Button';
import { ButtonGroup } from '../ButtonGroup';

/**
 * The read-mode page archetype — several `DataSection`s stacked on a page,
 * each with a `[View]`/`[Edit]` `ButtonGroup` in its actions slot. Composes
 * `DataSection` + `FieldGrid` + `Field` (+ `BulletList` / prose); it has no
 * component of its own, so the meta carries no `component`. The `Overview`
 * docs page owns the two section-level edit conventions.
 */
const meta: Meta = {
  title: 'Containers/read-mode-page',
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

/* ─── Story helpers ──────────────────────────────────────────── */

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: '880px', padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
    {children}
  </div>
);

const ViewEditToggle = () => (
  <ButtonGroup>
    <Button size="sm" variant="secondary">View</Button>
    <Button size="sm" variant="secondary">Edit</Button>
  </ButtonGroup>
);

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — the canonical read-mode page composition
   ═══════════════════════════════════════════════════════════════ */

/**
 * The canonical read-mode page — several `DataSection`s stacked on a page,
 * each with a `[View]`/`[Edit]` `ButtonGroup` in the actions slot and mixed
 * body content (FieldGrid, prose, BulletList). Irreducible because the value
 * is the multi-section page rhythm, which a single section can't show.
 *
 * bds-lint-ignore — Q4 page composition; the repeat is several *different*
 * sections, not one prop varied across a scale (#1502).
 * @summary Read-mode page — several stacked DataSections
 */
export const Default: Story = {
  name: 'Default',
  render: () => (
    <Frame>
      <DataSection title="Identity" actions={<ViewEditToggle />}>
        <FieldGrid columns={2}>
          <Field label="Business Name">Vale Partners</Field>
          <Field label="Legal Name">Vale Partners, LLC</Field>
          <Field label="DBA">Vale</Field>
          <Field label="Year Founded">2019</Field>
          <Field label="Industry">Professional Services</Field>
          <Field label="Sub-industry">Consulting</Field>
        </FieldGrid>
      </DataSection>

      <DataSection title="Location" actions={<ViewEditToggle />}>
        <FieldGrid columns={2}>
          <Field label="Address">123 Main St, Suite 400</Field>
          <Field label="City">Denver</Field>
          <Field label="State">CO</Field>
          <Field label="Postal Code">80202</Field>
          <Field label="Country">United States</Field>
          <Field label="Timezone">America/Denver</Field>
        </FieldGrid>
      </DataSection>

      <DataSection title="Directory Listing" actions={<ViewEditToggle />}>
        <Field label="Care Philosophy">
          <p style={{ margin: 0, fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)', color: 'var(--text-primary)', lineHeight: 'var(--font-line-height-normal)' }}>
            We believe in transparent, partner-led engagement. Every client works directly with a senior strategist from discovery through delivery — no handoffs, no junior pass-throughs.
          </p>
        </Field>
        <Field label="Secondary Categories">
          <BulletList items={['Strategy Consulting', 'Operations', 'Brand Advisory']} />
        </Field>
        <Field label="Holiday Exceptions">
          <BulletList
            items={[
              'Closed Thanksgiving Day through weekend',
              'Closed December 24 through January 2',
              'Limited availability July 3–5',
            ]}
          />
        </Field>
      </DataSection>
    </Frame>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   LOADING — the page in skeleton state
   ═══════════════════════════════════════════════════════════════ */

/**
 * The whole page before data resolves — every `DataSection` renders in
 * `loading` state, so the body swaps for Skeleton field rows shaped to the
 * `FieldGrid` each section would otherwise render. Titles stay real; the
 * `actions` slot is suppressed per section.
 *
 * bds-lint-ignore — Q4 page composition; several *different* sections in
 * skeleton state, not one prop varied across a scale (#1502).
 * @summary Read-mode page in skeleton state
 */
export const Loading: Story = {
  name: 'Loading',
  render: () => (
    <Frame>
      <DataSection title="Identity" actions={<ViewEditToggle />} loading>
        <FieldGrid columns={2}>
          <Field label="Business Name">Vale Partners</Field>
          <Field label="Legal Name">Vale Partners, LLC</Field>
          <Field label="DBA">Vale</Field>
          <Field label="Year Founded">2019</Field>
        </FieldGrid>
      </DataSection>

      <DataSection title="Location" actions={<ViewEditToggle />} loading>
        <FieldGrid columns={3}>
          <Field label="Address">123 Main St</Field>
          <Field label="City">Denver</Field>
          <Field label="State">CO</Field>
          <Field label="Postal Code">80202</Field>
          <Field label="Country">United States</Field>
          <Field label="Timezone">America/Denver</Field>
        </FieldGrid>
      </DataSection>
    </Frame>
  ),
};
