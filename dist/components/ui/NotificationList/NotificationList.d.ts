import { type ReactNode } from 'react';
import './NotificationList.css';
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
export declare function NotificationItem({ notification, onClick }: NotificationItemProps): import("react/jsx-runtime").JSX.Element;
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
 */
export declare function NotificationList({ notifications, onItemClick, emptyMessage, className, }: NotificationListProps): import("react/jsx-runtime").JSX.Element;
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
export declare function NotificationPopover({ title, notifications, onItemClick, onMarkAllRead, showMarkAllRead, emptyMessage, headerAction, className, }: NotificationPopoverProps): import("react/jsx-runtime").JSX.Element;
export default NotificationList;
