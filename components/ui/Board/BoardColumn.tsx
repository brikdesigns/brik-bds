import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';

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

export function BoardColumn({
  title,
  count,
  headerAction,
  children,
  className,
  style,
  ...props
}: BoardColumnProps) {
  return (
    <div
      className={bdsClass('bds-board-column', className)}
      style={style}
      {...props}
    >
      {(title || headerAction) && (
        <div className="bds-board-column__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-xs)' }}>
            {title && <h3 className="bds-board-column__title">{title}</h3>}
            {count !== undefined && (
              <span className="bds-board-column__count">{count}</span>
            )}
          </div>
          {headerAction}
        </div>
      )}
      <div className="bds-board-column__items">
        {children}
      </div>
    </div>
  );
}

export default BoardColumn;
