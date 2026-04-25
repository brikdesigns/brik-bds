import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotificationItem, NotificationList, NotificationPopover } from './NotificationList';
import type { NotificationItemData } from './NotificationList';

const meta: Meta<typeof NotificationList> = {
  title: 'Displays/Notifications/notification-list',
  component: NotificationList,
  parameters: { layout: 'centered' },
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

/* ═══════════════════════════════════════════════════════════════ */

export const Item: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <NotificationItem
        notification={SAMPLE_NOTIFICATIONS[0]}
        onClick={(n) => console.log('Clicked:', n.id)}
      />
    </div>
  ),
};

export const ItemRead: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <NotificationItem
        notification={SAMPLE_NOTIFICATIONS[2]}
        onClick={(n) => console.log('Clicked:', n.id)}
      />
    </div>
  ),
};

export const List: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <NotificationList
        notifications={SAMPLE_NOTIFICATIONS}
        onItemClick={(n) => console.log('Clicked:', n.id)}
      />
    </div>
  ),
};

export const ListEmpty: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <NotificationList notifications={[]} />
    </div>
  ),
};

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
      />
    );
  },
};

export const PopoverEmpty: Story = {
  render: () => (
    <NotificationPopover
      notifications={[]}
      emptyMessage="You're all caught up!"
    />
  ),
};
