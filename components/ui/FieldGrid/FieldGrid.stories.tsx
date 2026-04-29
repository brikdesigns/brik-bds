import type { Meta, StoryObj } from '@storybook/react-vite';
import { FieldGrid } from './FieldGrid';
import { Field } from '../Field';
import { Card } from '../Card';

/**
 * FieldGrid — n-column grid of `Field` children with locked spacing. Replaces
 * ad-hoc `display: grid` wrappers around Field rows.
 * @summary 2/3/4-column grid of Field children
 */
const meta: Meta<typeof FieldGrid> = {
  title: 'Components/Form/field-grid',
  component: FieldGrid,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: '540px', padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    columns: { control: 'select', options: [2, 3, 4] },
    gap: { control: 'select', options: ['md', 'lg', 'xl'] },
  },
};

export default meta;
type Story = StoryObj<typeof FieldGrid>;

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { columns: 2, gap: 'xl' },
  render: (args) => (
    <FieldGrid {...args}>
      <Field label="Owner">Nick Stanerson</Field>
      <Field label="Status">Active</Field>
      <Field label="Industry">Design & Engineering</Field>
      <Field label="Location">Thompson Station, TN</Field>
    </FieldGrid>
  ),
};

/** Side-by-side comparison of the three column counts. ADR-006 axis-gallery
 *  exception — the comparison is the whole point.
 *  @summary All column counts rendered together */
export const Columns: Story = {
  render: () => (
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
  ),
};

/** Cards in a FieldGrid — the canonical stat-tile recipe.
 *  @summary FieldGrid wrapping outlined Cards */
export const StatTiles: Story = {
  render: () => (
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
  ),
};
