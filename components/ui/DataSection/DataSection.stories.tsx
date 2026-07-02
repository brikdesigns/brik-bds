import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataSection } from './DataSection';
import { Field } from '../Field';
import { FieldGrid } from '../FieldGrid';
import { BulletList } from '../BulletList';
import { Button } from '../Button';
import { ButtonGroup } from '../ButtonGroup';

const meta: Meta<typeof DataSection> = {
  title: 'Containers/data-section',
  component: DataSection,
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text', description: 'Section title — renders as a heading (default `<h2>`).' },
    subtitle: { control: 'text', description: 'Optional secondary line below the title.' },
    spacing: {
      control: 'select',
      options: ['md', 'lg'],
      description: 'Vertical rhythm between this section and the next.',
    },
    titleAs: {
      control: 'select',
      options: ['h2', 'h3'],
      description: 'Heading element for the title. `h3` only when nested under an existing `<h2>`.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DataSection>;

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
   DEFAULT — args-driven sandbox
   ═══════════════════════════════════════════════════════════════ */

/**
 * Canonical section. Edit `title` / `subtitle` and toggle `spacing` /
 * `titleAs` via Controls; the `actions` slot holds a `[View]`/`[Edit]`
 * `ButtonGroup` and the body a `<FieldGrid>` of `<Field>`s.
 *
 * @summary Page-side wrapper for read-mode data sections
 */
export const Default: Story = {
  args: {
    title: 'Identity',
    subtitle: undefined,
    spacing: 'lg',
    titleAs: 'h2',
  },
  render: (args) => (
    <Frame>
      <DataSection {...args} actions={<ViewEditToggle />}>
        <FieldGrid columns={2}>
          <Field label="Business Name">Vale Partners</Field>
          <Field label="Legal Name">Vale Partners, LLC</Field>
          <Field label="DBA">Vale</Field>
          <Field label="Year Founded">2019</Field>
        </FieldGrid>
      </DataSection>
    </Frame>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   VARIANTS — irreducible composition (stacked read-mode page)
   ═══════════════════════════════════════════════════════════════ */

/**
 * The canonical read-mode page composition — several `DataSection`s stacked
 * on a page, each with a `[View]`/`[Edit]` `ButtonGroup` in the actions slot
 * and mixed body content (FieldGrid, prose, BulletList). Irreducible because
 * the value is the multi-section page rhythm, which a single section can't show.
 *
 * @summary Read-mode page — several stacked DataSections
 */
export const ReadModePage: Story = {
  name: 'Read-Mode Page',
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
