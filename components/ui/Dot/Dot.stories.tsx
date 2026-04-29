import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dot } from './Dot';

/**
 * Dot — small circular status indicator. Use for status lists, online/offline
 * markers, activity timeline rails, and inline status next to a label.
 * @summary Small circular status indicator
 */
const meta: Meta<typeof Dot> = {
  title: 'Components/Indicator/dot',
  component: Dot,
  parameters: { layout: 'centered' },
  argTypes: {
    status: { control: 'select', options: ['default', 'positive', 'warning', 'error', 'info', 'neutral'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Dot>;

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--gap-lg)', flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { status: 'default', size: 'md' },
};

/** All six status values side-by-side. ADR-006 axis-gallery exception.
 *  @summary All status colors */
export const Statuses: Story = {
  render: () => (
    <Row>
      <Dot status="default" />
      <Dot status="positive" />
      <Dot status="warning" />
      <Dot status="error" />
      <Dot status="info" />
      <Dot status="neutral" />
    </Row>
  ),
};

/** All three sizes side-by-side.
 *  @summary All sizes */
export const Sizes: Story = {
  render: () => (
    <Row>
      <Dot status="positive" size="sm" />
      <Dot status="positive" size="md" />
      <Dot status="positive" size="lg" />
    </Row>
  ),
};
