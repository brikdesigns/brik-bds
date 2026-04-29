import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { ActivityTimeline } from './ActivityTimeline';

/**
 * ActivityTimeline — vertical timeline of chronological events. Pure display
 * component: pass an array of events; the first (or any `isOrigin: true`)
 * renders with the brand-colored dot.
 * @summary Vertical timeline of chronological events
 */
const meta: Meta<typeof ActivityTimeline> = {
  title: 'Components/List/activity-timeline',
  component: ActivityTimeline,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof ActivityTimeline>;

/** Default event sequence — request submitted, assigned, status changed.
 *  @summary Standard request-flow timeline */
export const Default: Story = {
  args: {
    events: [
      { icon: <Icon icon="ph:plus" />, label: 'Request submitted', detail: 'by Emily Rivera', timestamp: 'Apr 12, 2026, 1:04 PM', isOrigin: true },
      { icon: <Icon icon="ph:user" />, label: 'Assigned', detail: 'to Nick Stanerson', timestamp: 'Apr 12, 2026, 3:15 PM' },
      { icon: <Icon icon="ph:check-circle" />, label: 'Status changed to In Progress', timestamp: 'Apr 12, 2026, 3:15 PM' },
    ],
  },
};

/** Longer task lifecycle — covers create → assign → progress → block → complete.
 *  @summary Full task lifecycle */
export const TaskLifecycle: Story = {
  args: {
    events: [
      { icon: <Icon icon="ph:plus-circle" />, label: 'Task created', detail: 'from template: Daily Opening Checklist', timestamp: 'Apr 10, 2026, 8:00 AM', isOrigin: true },
      { icon: <Icon icon="ph:user-circle" />, label: 'Assigned', detail: 'to Sarah Mitchell', timestamp: 'Apr 10, 2026, 8:05 AM' },
      { icon: <Icon icon="ph:play-circle" />, label: 'Status changed to In Progress', timestamp: 'Apr 10, 2026, 8:30 AM' },
      { icon: <Icon icon="ph:warning-circle" />, label: 'Marked as Blocked', detail: 'Missing supplies — waiting on reorder', timestamp: 'Apr 10, 2026, 9:15 AM' },
      { icon: <Icon icon="ph:check-circle" />, label: 'Completed', timestamp: 'Apr 10, 2026, 11:00 AM' },
    ],
  },
};

/** Single event — confirms the rail / dot rendering for a one-event timeline.
 *  @summary Single-event timeline */
export const SingleEvent: Story = {
  args: {
    events: [
      { icon: <Icon icon="ph:plus" />, label: 'Created', detail: 'by System', timestamp: 'Just now', isOrigin: true },
    ],
  },
};

/** Resolved request — terminal "completed" state with vendor handoff in the middle.
 *  @summary Resolved request with vendor handoff */
export const Resolved: Story = {
  args: {
    events: [
      { icon: <Icon icon="ph:plus" />, label: 'Request submitted', detail: 'by Tyler Nguyen', timestamp: 'Apr 8, 2026, 2:00 PM', isOrigin: true },
      { icon: <Icon icon="ph:user" />, label: 'Assigned', detail: 'to Amanda Chen', timestamp: 'Apr 8, 2026, 2:30 PM' },
      { icon: <Icon icon="ph:truck" />, label: 'Status: Waiting on Vendor', detail: 'Patterson Dental contacted', timestamp: 'Apr 9, 2026, 10:00 AM' },
      { icon: <Icon icon="ph:check-circle" />, label: 'Resolved', detail: 'Replacement part installed and tested', timestamp: 'Apr 11, 2026, 3:45 PM' },
    ],
  },
};
