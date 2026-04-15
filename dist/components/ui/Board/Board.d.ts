import { type HTMLAttributes, type ReactNode } from 'react';
import './Board.css';
/**
 * Board — Horizontal kanban-style container for columns.
 *
 * Renders a horizontally scrollable flex layout. Each child should
 * be a `BoardColumn`. Columns flex equally but respect min/max widths.
 *
 * @example
 * ```tsx
 * <Board>
 *   <BoardColumn title="To Do" count={3}>
 *     <BoardItem name="Jane" subtitle="Hygienist" progress={45} />
 *   </BoardColumn>
 * </Board>
 * ```
 */
export interface BoardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}
export declare function Board({ children, className, style, ...props }: BoardProps): import("react/jsx-runtime").JSX.Element;
export default Board;
