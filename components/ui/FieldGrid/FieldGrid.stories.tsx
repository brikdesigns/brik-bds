import type { Meta, StoryObj } from '@storybook/react-vite';
import { FieldGrid } from './FieldGrid';
import { Field } from '../Field';
import { Card } from '../Card';

/**
 * FieldGrid — equal-column grid for laying out Fields side by side.
 * @summary Equal-column grid for laying out Fields side by side
 */
const meta: Meta<typeof FieldGrid> = {
  title: 'Blocks/field-grid',
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

/** @summary Canonical FieldGrid — flip Controls to change columns + gap */
export const Default: Story = {
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

/** @summary Card-wrapped cells produce the stat-tile pattern */
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
