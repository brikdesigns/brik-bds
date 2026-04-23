import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataSection } from './DataSection';
import { Field } from '../Field';
import { FieldGrid } from '../FieldGrid';
import { BulletList } from '../BulletList';
import { Button } from '../Button';
import { ButtonGroup } from '../ButtonGroup';

const meta: Meta<typeof DataSection> = {
  title: 'Displays/Data/data-section',
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

/* ─── 2. Variants ────────────────────────────────────────────── */

export const Variants: Story = {
  render: () => (
    <Frame>
      <DataSection title="Title only" actions={<ViewEditToggle />}>
        <FieldGrid columns={2}>
          <Field label="Business Name">Vale Partners</Field>
          <Field label="Industry">Professional Services</Field>
        </FieldGrid>
      </DataSection>

      <DataSection
        title="Title + subtitle"
        subtitle="Public-facing name and core identifiers."
        actions={<ViewEditToggle />}
      >
        <FieldGrid columns={2}>
          <Field label="Business Name">Vale Partners</Field>
          <Field label="Industry">Professional Services</Field>
        </FieldGrid>
      </DataSection>

      <DataSection title="No actions">
        <FieldGrid columns={2}>
          <Field label="Business Name">Vale Partners</Field>
          <Field label="Industry">Professional Services</Field>
        </FieldGrid>
      </DataSection>

      <DataSection title="Single button in actions" actions={<Button size="sm" variant="secondary">Edit</Button>}>
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
