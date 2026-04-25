import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { ActivityTimeline } from './ActivityTimeline';

const meta: Meta<typeof ActivityTimeline> = {
  title: 'Displays/Timeline/activity-timeline',
  component: ActivityTimeline,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ActivityTimeline>;

/* ═══════════════════════════════════════════════════════════════ */

export const Default: Story = {
  render: () => (
    <div style={{ width: 380 }}>
      <ActivityTimeline events={[
        { icon: <Icon icon="ph:plus" />, label: 'Request submitted', detail: 'by Emily Rivera', timestamp: 'Apr 12, 2026, 1:04 PM', isOrigin: true },
        { icon: <Icon icon="ph:user" />, label: 'Assigned', detail: 'to Nick Stanerson', timestamp: 'Apr 12, 2026, 3:15 PM' },
        { icon: <Icon icon="ph:check-circle" />, label: 'Status changed to In Progress', timestamp: 'Apr 12, 2026, 3:15 PM' },
      ]} />
    </div>
  ),
};

export const TaskLifecycle: Story = {
  render: () => (
    <div style={{ width: 380 }}>
      <ActivityTimeline events={[
        { icon: <Icon icon="ph:plus-circle" />, label: 'Task created', detail: 'from template: Daily Opening Checklist', timestamp: 'Apr 10, 2026, 8:00 AM', isOrigin: true },
        { icon: <Icon icon="ph:user-circle" />, label: 'Assigned', detail: 'to Sarah Mitchell', timestamp: 'Apr 10, 2026, 8:05 AM' },
        { icon: <Icon icon="ph:play-circle" />, label: 'Status changed to In Progress', timestamp: 'Apr 10, 2026, 8:30 AM' },
        { icon: <Icon icon="ph:warning-circle" />, label: 'Marked as Blocked', detail: 'Missing supplies — waiting on reorder', timestamp: 'Apr 10, 2026, 9:15 AM' },
        { icon: <Icon icon="ph:check-circle" />, label: 'Completed', timestamp: 'Apr 10, 2026, 11:00 AM' },
      ]} />
    </div>
  ),
};

export const SingleEvent: Story = {
  render: () => (
    <div style={{ width: 380 }}>
      <ActivityTimeline events={[
        { icon: <Icon icon="ph:plus" />, label: 'Created', detail: 'by System', timestamp: 'Just now', isOrigin: true },
      ]} />
    </div>
  ),
};

export const Resolved: Story = {
  render: () => (
    <div style={{ width: 380 }}>
      <ActivityTimeline events={[
        { icon: <Icon icon="ph:plus" />, label: 'Request submitted', detail: 'by Tyler Nguyen', timestamp: 'Apr 8, 2026, 2:00 PM', isOrigin: true },
        { icon: <Icon icon="ph:user" />, label: 'Assigned', detail: 'to Amanda Chen', timestamp: 'Apr 8, 2026, 2:30 PM' },
        { icon: <Icon icon="ph:truck" />, label: 'Status: Waiting on Vendor', detail: 'Patterson Dental contacted', timestamp: 'Apr 9, 2026, 10:00 AM' },
        { icon: <Icon icon="ph:check-circle" />, label: 'Resolved', detail: 'Replacement part installed and tested', timestamp: 'Apr 11, 2026, 3:45 PM' },
      ]} />
    </div>
  ),
};
