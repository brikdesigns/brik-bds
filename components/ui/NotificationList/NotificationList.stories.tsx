import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { NotificationList, NotificationPopover } from './NotificationList';
import type { NotificationItemData } from './NotificationList';

/**
 * Vertical list of notification rows with read/unread states.
 * @summary Notification list with read/unread rows
 */
const meta: Meta<typeof NotificationList> = {
  title: 'Containers/notification-list',
  component: NotificationList,
  tags: ['surface-product'],
  parameters: { layout: 'centered' },
  argTypes: {
    notifications: { control: false, description: 'Notification rows to render, each with `id` / `title` / `body` / `time` / optional `isRead`.' },
    onItemClick: { control: false, description: 'Called with the notification when a row is clicked.' },
    emptyMessage: { control: 'text', description: 'Message shown when `notifications` is empty.' },
  },
};

export default meta;
type Story = StoryObj<typeof NotificationList>;

/* ─── Sample data ─────────────────────────────────────────────── */

const SAMPLE_NOTIFICATIONS: NotificationItemData[] = [
  { id: '1', title: 'New Request: Broken iPad', body: 'Emily Rivera submitted a Medium priority Device Issue request', time: '2h ago' },
  { id: '2', title: 'Task Assigned: Daily Opening Checklist', body: 'You have been assigned a new task', time: '3h ago' },
  { id: '3', title: 'Request Resolved', body: 'Autoclave repair has been completed', time: '1d ago', isRead: true },
  { id: '4', title: 'Training Due: OSHA Safety', body: 'Complete by end of Q2', time: '2d ago', isRead: true },
  { id: '5', title: 'New Request: Leaking Faucet', body: 'Facilities maintenance requested for Room 3', time: '3d ago', isRead: true },
];

/* ─── Default — clear `notifications` in Controls for the empty state ── */

/** @summary Canonical list — sample mixes unread and read rows */
export const Default: Story = {
  args: {
    notifications: SAMPLE_NOTIFICATIONS,
    onItemClick: fn(),
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <NotificationList {...args} />
    </div>
  ),
};

/** @summary Empty state — no notifications */
export const Empty: Story = {
  args: {
    notifications: [],
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <NotificationList {...args} />
    </div>
  ),
};

/* ─── Popover — Q4 interactive composition ───────────────────── */

/** @summary Interactive popover — bell, unread badge, mark-all */
export const Popover: Story = {
  render: () => {
    const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAllRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleClick = (n: NotificationItemData) => {
      setNotifications(prev => prev.map(item =>
        item.id === n.id ? { ...item, isRead: true } : item
      ));
    };

    return (
      <NotificationPopover
        notifications={notifications}
        onItemClick={handleClick}
        onMarkAllRead={handleMarkAllRead}
        showMarkAllRead={unreadCount > 0}
        emptyMessage="You're all caught up!"
      />
    );
  },
};
