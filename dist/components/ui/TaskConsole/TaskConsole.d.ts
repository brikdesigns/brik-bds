import { type ReactNode, type HTMLAttributes } from 'react';
import './TaskConsole.css';
export type TaskItemStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type TaskConsolePosition = 'bottom-right' | 'bottom-left';
export interface TaskConsoleItem {
    /** Unique identifier for the task item */
    id: string;
    /** Display label */
    label: string;
    /** Current status */
    status: TaskItemStatus;
    /** Optional detail text (shown below label when in_progress) */
    detail?: string;
    /** Optional URL — shown as "View" link when completed */
    href?: string;
}
export interface TaskConsoleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    /** Console header title (e.g., "Generating 14 pages") */
    title: ReactNode;
    /** List of task items to display */
    items: TaskConsoleItem[];
    /** Whether the console is visible */
    isOpen?: boolean;
    /** Screen position */
    position?: TaskConsolePosition;
    /** Called when the close button is clicked */
    onDismiss?: () => void;
    /** Whether to start collapsed */
    defaultCollapsed?: boolean;
    /** Auto-dismiss delay in ms after all items complete (0 = no auto-dismiss) */
    autoDismissDelay?: number;
    /** Optional subtitle (e.g., "Less than a minute left") */
    subtitle?: ReactNode;
}
/**
 * TaskConsole — floating progress overlay for long-running operations
 *
 * Renders as a portal at document.body. Shows a collapsible checklist
 * of task items with real-time status updates. Inspired by Google Drive's
 * upload progress widget.
 *
 * Category: Feedback (alongside Toast, Snackbar)
 */
export declare function TaskConsole({ title, items, isOpen, position, onDismiss, defaultCollapsed, autoDismissDelay, subtitle, className, style, ...props }: TaskConsoleProps): import("react").ReactPortal | null;
export default TaskConsole;
