import type { Meta, StoryObj } from '@storybook/react-vite';
import { Counter } from './Counter';

/**
 * Counter — small numeric badge for unread counts, queue depth, error counts.
 * Supports `max` to cap the displayed number (e.g. `max={99}` → "99+").
 * @summary Small numeric indicator with status colors
 */
const meta: Meta<typeof Counter> = {
  title: 'Components/Indicator/counter',
  component: Counter,
  parameters: { layout: 'centered' },
  argTypes: {
    count: { control: { type: 'number', min: 0, max: 999 } },
    status: { control: 'select', options: ['success', 'error', 'warning', 'neutral', 'progress', 'brand'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    max: { control: { type: 'number', min: 1, max: 999 } },
  },
};

export default meta;
type Story = StoryObj<typeof Counter>;

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--gap-md)', flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { count: 5, status: 'success', size: 'sm' },
};

/** All six status values side-by-side. ADR-006 axis-gallery exception.
 *  @summary All status colors */
export const Statuses: Story = {
  render: () => (
    <Row>
      <Counter count={1} status="success" />
      <Counter count={1} status="error" />
      <Counter count={1} status="warning" />
      <Counter count={1} status="neutral" />
      <Counter count={1} status="progress" />
      <Counter count={1} status="brand" />
    </Row>
  ),
};

/** All three sizes side-by-side.
 *  @summary All sizes */
export const Sizes: Story = {
  render: () => (
    <Row>
      <Counter count={3} size="sm" />
      <Counter count={3} size="md" />
      <Counter count={3} size="lg" />
    </Row>
  ),
};

/** `max` caps the displayed count. Useful for unread counts that would
 *  otherwise overflow the badge.
 *  @summary Counter with max overflow */
export const MaxOverflow: Story = {
  render: () => (
    <Row>
      <Counter count={5} max={99} status="error" />
      <Counter count={99} max={99} status="error" />
      <Counter count={150} max={99} status="error" />
    </Row>
  ),
};
