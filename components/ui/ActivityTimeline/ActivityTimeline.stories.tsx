import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { ActivityTimeline } from './ActivityTimeline';

/**
 * Vertical chronological event feed — icon, label, detail, timestamp per row.
 * @summary Chronological activity event feed
 */
const meta: Meta<typeof ActivityTimeline> = {
  title: 'Containers/activity-timeline',
  component: ActivityTimeline,
  tags: ['surface-product'],
  parameters: { layout: 'centered' },
  argTypes: {
    events: { control: false, description: 'Events top → bottom (chronological). Each: `icon` node, `label`, optional `detail`, `timestamp`, `isOrigin`. Edit the sequence to see any shape — single event, full lifecycle, resolved flow.' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 380 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ActivityTimeline>;

/** @summary Canonical event feed — edit `events` in Controls */
export const Default: Story = {
  args: {
    events: [
      { icon: <Icon icon="ph:plus" />, label: 'Request submitted', detail: 'by Emily Rivera', timestamp: 'Apr 12, 2026, 1:04 PM', isOrigin: true },
      { icon: <Icon icon="ph:user" />, label: 'Assigned', detail: 'to Nick Stanerson', timestamp: 'Apr 12, 2026, 3:15 PM' },
      { icon: <Icon icon="ph:check-circle" />, label: 'Status changed to In Progress', timestamp: 'Apr 12, 2026, 3:15 PM' },
    ],
  },
};
