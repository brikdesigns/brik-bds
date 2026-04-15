import { type HTMLAttributes, type ReactNode } from 'react';
/**
 * BoardColumn — A single vertical lane within a Board.
 *
 * Renders a column header (title + optional count) and a scrollable
 * item list. Children should be `BoardItem` components.
 *
 * @example
 * ```tsx
 * <BoardColumn title="In Progress" count={5}>
 *   <BoardItem name="Alex" subtitle="Front Desk" progress={60} />
 * </BoardColumn>
 * ```
 */
export interface BoardColumnProps extends HTMLAttributes<HTMLDivElement> {
    /** Column heading text */
    title?: string;
    /** Item count displayed beside the title */
    count?: number;
    /** Optional header action slot (e.g. add button, menu) */
    headerAction?: ReactNode;
    children: ReactNode;
}
export declare function BoardColumn({ title, count, headerAction, children, className, style, ...props }: BoardColumnProps): import("react/jsx-runtime").JSX.Element;
export default BoardColumn;
