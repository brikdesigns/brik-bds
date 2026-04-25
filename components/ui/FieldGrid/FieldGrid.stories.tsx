import type { Meta, StoryObj } from '@storybook/react-vite';
import { FieldGrid } from './FieldGrid';
import { Field } from '../Field';
import { Card } from '../Card';

const meta: Meta<typeof FieldGrid> = {
  title: 'Components/Form/field-grid',
  component: FieldGrid,
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
  argTypes: {
    columns: { control: 'select', options: [2, 3, 4] },
    gap: { control: 'select', options: ['md', 'lg', 'xl'] },
  },
};

export default meta;
type Story = StoryObj<typeof FieldGrid>;

const Frame = ({ width = '540px', children }: { width?: string; children: React.ReactNode }) => (
  <div style={{ width, padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
    {children}
  </div>
);

/* ─── 1. Playground ──────────────────────────────────────────── */

export const Playground: Story = {
  args: {
    columns: 2,
    gap: 'xl',
  },
  render: (args) => (
    <Frame>
      <FieldGrid {...args}>
        <Field label="Owner">Nick Stanerson</Field>
        <Field label="Status">Active</Field>
        <Field label="Industry">Design & Engineering</Field>
        <Field label="Location">Thompson Station, TN</Field>
      </FieldGrid>
    </Frame>
  ),
};

/* ─── 2. Columns ─────────────────────────────────────────────── */

export const Columns: Story = {
  render: () => (
    <Frame>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
        <FieldGrid columns={2}>
          <Field label="Owner">Nick Stanerson</Field>
          <Field label="Status">Active</Field>
        </FieldGrid>

        <FieldGrid columns={3}>
          <Field label="Source" layout="inline">birdwelldentist.com</Field>
          <Field label="Scraped" layout="inline">8</Field>
          <Field label="Failed" layout="inline">12</Field>
        </FieldGrid>

        <FieldGrid columns={4}>
          <Field label="Gold">#c49a2f</Field>
          <Field label="Gray">#b0b0b0</Field>
          <Field label="White">#ffffff</Field>
          <Field label="Black">#000000</Field>
        </FieldGrid>
      </div>
    </Frame>
  ),
};

/* ─── 3. Stat tiles — Cards in a FieldGrid ───────────────────── */

export const StatTiles: Story = {
  render: () => (
    <Frame>
      <FieldGrid columns={3} gap="md">
        <Card variant="outlined">
          <Field label="Source">birdwelldentist.com</Field>
        </Card>
        <Card variant="outlined">
          <Field label="Scraped">8</Field>
        </Card>
        <Card variant="outlined">
          <Field label="Failed">12</Field>
        </Card>
      </FieldGrid>
    </Frame>
  ),
};

/* ─── 4. Patterns — mixed with SheetSection ─────────────────── */

export const Patterns: Story = {
  render: () => (
    <Frame width="520px">
      <FieldGrid columns={2}>
        <Field label="Entity name">Birdwell & Mutlak, LLC</Field>
        <Field label="Founded">2014</Field>
        <Field label="Owner">Nick Stanerson</Field>
        <Field label="Parent" empty="Independent" />
        <Field label="Primary location">Thompson Station, TN</Field>
        <Field label="Locations">3</Field>
      </FieldGrid>
    </Frame>
  ),
};
