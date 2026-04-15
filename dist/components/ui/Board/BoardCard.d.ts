import { type HTMLAttributes, type ReactNode } from 'react';
/**
 * BoardCard — A task card within a BoardColumn.
 *
 * Renders a task with title, subtitle, completion toggle, and a
 * tags slot. The left border color indicates category (department,
 * status, etc.) — set via `accentColor`.
 *
 * @example
 * ```tsx
 * <BoardCard
 *   title="Check hand sanitizer stations"
 *   subtitle="Due today"
 *   accentColor="#cee2fa"
 *   checked={false}
 *   onCheckedChange={() => {}}
 *   tags={<><Tag>Engineering</Tag><Tag>Daily</Tag></>}
 *   trailingTag={<Tag>Critical</Tag>}
 * />
 * ```
 */
export interface BoardCardProps extends HTMLAttributes<HTMLDivElement> {
    /** Task title */
    title: string;
    /** Secondary text (due date, description, etc.) */
    subtitle?: string;
    /** Left border color — represents department or category */
    accentColor?: string;
    /** Whether the task is completed */
    checked?: boolean;
    /** Called when the check toggle is clicked */
    onCheckedChange?: (checked: boolean) => void;
    /** Tags rendered in the bottom-left (department, frequency, etc.) */
    tags?: ReactNode;
    /** Tag rendered in the bottom-right (priority) */
    trailingTag?: ReactNode;
}
export declare function BoardCard({ title, subtitle, accentColor, checked, onCheckedChange, tags, trailingTag, className, style, ...props }: BoardCardProps): import("react/jsx-runtime").JSX.Element;
export default BoardCard;
