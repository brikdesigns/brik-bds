import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
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

export function Board({ children, className, style, ...props }: BoardProps) {
  return (
    <div
      className={bdsClass('bds-board', className)}
      style={style}
      role="region"
      aria-label="Board"
      {...props}
    >
      {children}
    </div>
  );
}

export default Board;
