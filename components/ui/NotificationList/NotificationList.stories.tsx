import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotificationItem, NotificationList, NotificationPopover } from './NotificationList';
import type { NotificationItemData } from './NotificationList';

/**
 * NotificationList — vertical list of notification items with unread indicators.
 * Ships with three exported pieces: `NotificationItem` (single row),
 * `NotificationList` (the list itself), and `NotificationPopover` (list wrapped
 * in a popover surface with mark-all-read action).
 * @summary Notification list + item + popover variants
 */
const meta: Meta<typeof NotificationList> = {
  title: 'Components/List/notification-list',
  component: NotificationList,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof NotificationList>;

const SAMPLE_NOTIFICATIONS: NotificationItemData[] = [
  { id: '1', title: 'New Request: Broken iPad', body: 'Emily Rivera submitted a Medium priority Device Issue request', time: '2h ago' },
  { id: '2', title: 'Task Assigned: Daily Opening Checklist', body: 'You have been assigned a new task', time: '3h ago' },
  { id: '3', title: 'Request Resolved', body: 'Autoclave repair has been completed', time: '1d ago', isRead: true },
  { id: '4', title: 'Training Due: OSHA Safety', body: 'Complete by end of Q2', time: '2d ago', isRead: true },
  { id: '5', title: 'New Request: Leaking Faucet', body: 'Facilities maintenance requested for Room 3', time: '3d ago', isRead: true },
];

/* ─── NotificationItem (single row) ──────────────────────────── */

/** Single unread item — bold title, brand-colored unread indicator.
 *  @summary Unread notification item */
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

/** Read item — no unread indicator, muted title weight.
 *  @summary Read notification item */
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

/* ─── NotificationList (full list) ───────────────────────────── */

/** Full list with mixed read/unread items.
 *  @summary List with mixed read state */
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

/** Empty list — confirms the empty-state message.
 *  @summary Empty list state */
export const ListEmpty: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <NotificationList notifications={[]} />
    </div>
  ),
};

/* ─── NotificationPopover (popover wrapper) ──────────────────── */

/** Popover wrapper with `useState` to drive read transitions and mark-all-read.
 *  Render is required for the interactive state.
 *  @summary Interactive popover with read transitions */
export const Popover: Story = {
  render: () => {
    const Interactive = () => {
      const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      return (
        <NotificationPopover
          notifications={notifications}
          onItemClick={(n) => setNotifications((prev) => prev.map((item) =>
            item.id === n.id ? { ...item, isRead: true } : item
          ))}
          onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))}
          showMarkAllRead={unreadCount > 0}
        />
      );
    };
    return <Interactive />;
  },
};

/** Empty popover — fallback message when there are no notifications.
 *  @summary Empty popover state */
export const PopoverEmpty: Story = {
  render: () => (
    <NotificationPopover
      notifications={[]}
      emptyMessage="You're all caught up!"
    />
  ),
};
