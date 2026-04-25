import { type ReactNode, type KeyboardEvent } from 'react';
import { bdsClass } from '../../utils';
import './NotificationList.css';

// ─── NotificationItem ───────────────────────────────────────────────

export interface NotificationItemData {
  /** Unique identifier */
  id: string;
  /** Primary title text */
  title: string;
  /** Optional body/description */
  body?: string | null;
  /** Formatted time string (e.g. "2h ago") — consumer formats this */
  time: string;
  /** Whether the notification has been read */
  isRead?: boolean;
}

export interface NotificationItemProps {
  /** Notification data */
  notification: NotificationItemData;
  /** Click handler */
  onClick?: (notification: NotificationItemData) => void;
}

/**
 * NotificationItem — single notification row.
 *
 * Pure display component. Shows unread dot, title, body, and timestamp.
 * Unread items get a highlighted background.
 */
export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const isRead = notification.isRead ?? false;

  const handleClick = () => onClick?.(notification);
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(notification);
    }
  };

  return (
    <div
      className={bdsClass('bds-notification-item', !isRead && 'bds-notification-item--unread')}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {!isRead && <div className="bds-notification-item__dot" />}
      <div className="bds-notification-item__content">
        <div className="bds-notification-item__title">{notification.title}</div>
        {notification.body && (
          <div className="bds-notification-item__body">{notification.body}</div>
        )}
        <div className="bds-notification-item__time">{notification.time}</div>
      </div>
    </div>
  );
}

// ─── NotificationList ───────────────────────────────────────────────

export interface NotificationListProps {
  /** Array of notifications to display */
  notifications: NotificationItemData[];
  /** Click handler for individual items */
  onItemClick?: (notification: NotificationItemData) => void;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional className */
  className?: string;
}

/**
 * NotificationList — scrollable list of notification items.
 *
 * Pure display component. Renders NotificationItems with an empty state.
 * Does not manage data fetching, real-time subscriptions, or read state —
 * the consumer provides pre-processed notification data.
 *
 * @example
 * ```tsx
 * <NotificationList
 *   notifications={[
 *     { id: '1', title: 'New Request', body: 'Emily submitted a request', time: '2h ago' },
 *     { id: '2', title: 'Task Assigned', time: '5h ago', isRead: true },
 *   ]}
 *   onItemClick={(n) => console.log(n.id)}
 * />
 * ```
 *
 * @summary Scrollable list of notification items
 */
export function NotificationList({
  notifications,
  onItemClick,
  emptyMessage = 'No notifications yet',
  className = '',
}: NotificationListProps) {
  return (
    <div className={bdsClass('bds-notification-list', className)}>
      {notifications.length === 0 ? (
        <div className="bds-notification-list__empty">{emptyMessage}</div>
      ) : (
        notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onClick={onItemClick} />
        ))
      )}
    </div>
  );
}

// ─── NotificationPopover ────────────────────────────────────────────

export interface NotificationPopoverProps {
  /** Title displayed in the header */
  title?: string;
  /** Notification data */
  notifications: NotificationItemData[];
  /** Click handler for individual items */
  onItemClick?: (notification: NotificationItemData) => void;
  /** "Mark all read" handler — hidden when null/undefined */
  onMarkAllRead?: () => void;
  /** Whether to show the "Mark all read" button */
  showMarkAllRead?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Header action slot (replaces default "Mark all read" button) */
  headerAction?: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * NotificationPopover — presentation shell for a notification dropdown.
 *
 * Renders the popover frame (header, list, empty state) but does NOT handle
 * positioning, open/close state, or portal rendering. The consumer wraps
 * this in their own popover/dropdown mechanism (Radix, BDS Popover, etc.)
 * and controls visibility.
 *
 * This separation keeps BDS free of product-specific notification logic
 * (real-time subscriptions, routing, mark-as-read APIs) while providing
 * a consistent, themeable notification UI across products.
 *
 * @example
 * ```tsx
 * // Consumer controls open state + positioning
 * {isOpen && (
 *   <div className="my-dropdown-position">
 *     <NotificationPopover
 *       notifications={notifications}
 *       onItemClick={handleClick}
 *       onMarkAllRead={handleMarkAllRead}
 *       showMarkAllRead={unreadCount > 0}
 *     />
 *   </div>
 * )}
 * ```
 */
export function NotificationPopover({
  title = 'Notifications',
  notifications,
  onItemClick,
  onMarkAllRead,
  showMarkAllRead = false,
  emptyMessage,
  headerAction,
  className = '',
}: NotificationPopoverProps) {
  return (
    <div className={bdsClass('bds-notification-popover', className)}>
      <div className="bds-notification-popover__header">
        <span className="bds-notification-popover__title">{title}</span>
        {headerAction ?? (
          showMarkAllRead && onMarkAllRead && (
            <button
              type="button"
              className="bds-notification-popover__action"
              onClick={onMarkAllRead}
            >
              Mark all read
            </button>
          )
        )}
      </div>
      <NotificationList
        notifications={notifications}
        onItemClick={onItemClick}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}

export default NotificationList;
