import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataSection } from './DataSection';
import { Field } from '../Field';
import { FieldGrid } from '../FieldGrid';
import { BulletList } from '../BulletList';
import { Button } from '../Button';
import { ButtonGroup } from '../ButtonGroup';

/**
 * DataSection — read-mode page section with title, optional subtitle, action
 * slot, and a content body. Use to group `Field`/`FieldGrid` clusters under a
 * heading on read-mode entity pages.
 * @summary Page section for read-mode field groups
 */
const meta: Meta<typeof DataSection> = {
  title: 'Components/Container/data-section',
  component: DataSection,
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    spacing: { control: 'select', options: ['md', 'lg'] },
    titleAs: { control: 'select', options: ['h2', 'h3'] },
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

/* ─── 1. Playground ──────────────────────────────────────────── */

export const Playground: Story = {
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

/* ─── Header shapes ──────────────────────────────────────────── */

/** Title only — minimal header.
 *  @summary Title-only header */
export const TitleOnly: Story = {
  render: () => (
    <Frame>
      <DataSection title="Identity" actions={<ViewEditToggle />}>
        <FieldGrid columns={2}>
          <Field label="Business Name">Vale Partners</Field>
          <Field label="Industry">Professional Services</Field>
        </FieldGrid>
      </DataSection>
    </Frame>
  ),
};

/** Title + subtitle — secondary line for context.
 *  @summary Title with subtitle */
export const WithSubtitle: Story = {
  render: () => (
    <Frame>
      <DataSection
        title="Identity"
        subtitle="Public-facing name and core identifiers."
        actions={<ViewEditToggle />}
      >
        <FieldGrid columns={2}>
          <Field label="Business Name">Vale Partners</Field>
          <Field label="Industry">Professional Services</Field>
        </FieldGrid>
      </DataSection>
    </Frame>
  ),
};

/** No actions — header without trailing action slot.
 *  @summary Header without actions */
export const NoActions: Story = {
  render: () => (
    <Frame>
      <DataSection title="Identity">
        <FieldGrid columns={2}>
          <Field label="Business Name">Vale Partners</Field>
          <Field label="Industry">Professional Services</Field>
        </FieldGrid>
      </DataSection>
    </Frame>
  ),
};

/** Single-button action — common shape when only "Edit" is needed.
 *  @summary Single-button action slot */
export const SingleButtonAction: Story = {
  render: () => (
    <Frame>
      <DataSection title="Identity" actions={<Button size="sm" variant="secondary">Edit</Button>}>
        <FieldGrid columns={2}>
          <Field label="Business Name">Vale Partners</Field>
          <Field label="Industry">Professional Services</Field>
        </FieldGrid>
      </DataSection>
    </Frame>
  ),
};

/* ─── 3. Patterns ────────────────────────────────────────────── */

export const ReadModePage: Story = {
  name: 'Pattern — Read-Mode Page',
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

/* ─── 4. Vocabulary demo — what the parts are called ───────── */

export const AnatomyVocabulary: Story = {
  name: 'Anatomy — vocabulary',
  render: () => (
    <Frame>
      <DataSection
        title="Identity"
        subtitle="Public-facing name and core identifiers."
        actions={<ViewEditToggle />}
      >
        <FieldGrid columns={2}>
          <Field label="Business Name">Vale Partners</Field>
          <Field label="Industry">Professional Services</Field>
        </FieldGrid>
      </DataSection>
      <div style={{ marginTop: 'var(--padding-xl)', fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        <p style={{ margin: 0 }}><strong>title</strong> — &quot;Identity&quot; renders as <code>&lt;h2&gt;</code>, class <code>.bds-data-section__title</code>.</p>
        <p style={{ margin: 0 }}><strong>subtitle</strong> — secondary line below title, class <code>.bds-data-section__subtitle</code>. Not an eyebrow.</p>
        <p style={{ margin: 0 }}><strong>actions</strong> — slot holding buttons. The text on each button is a <em>button-label</em>; the slot is not itself a label.</p>
        <p style={{ margin: 0 }}><strong>field-label / field-value</strong> — one <code>&lt;Field&gt;</code> pair. Stacked by default.</p>
      </div>
    </Frame>
  ),
};
