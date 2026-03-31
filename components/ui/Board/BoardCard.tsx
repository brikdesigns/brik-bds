import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';

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

export function BoardCard({
  title,
  subtitle,
  accentColor,
  checked = false,
  onCheckedChange,
  tags,
  trailingTag,
  className,
  style,
  ...props
}: BoardCardProps) {
  return (
    <div
      className={bdsClass(
        'bds-board-card',
        checked && 'bds-board-card--checked',
        className
      )}
      style={{
        ...style,
        ...(accentColor ? { '--bds-board-card-accent': accentColor } as React.CSSProperties : {}),
      }}
      {...props}
    >
      {/* Top row: title + checkbox */}
      <div className="bds-board-card__top">
        <div className="bds-board-card__text">
          <p className="bds-board-card__title">{title}</p>
          {subtitle && <p className="bds-board-card__subtitle">{subtitle}</p>}
        </div>
        {onCheckedChange && (
          <button
            type="button"
            className={bdsClass(
              'bds-board-card__check',
              checked && 'bds-board-card__check--checked'
            )}
            onClick={(e) => { e.stopPropagation(); onCheckedChange(!checked); }}
            aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
            aria-pressed={checked}
          >
            {checked && <span className="bds-board-card__check-icon" />}
          </button>
        )}
      </div>

      {/* Bottom row: tags */}
      {(tags || trailingTag) && (
        <div className="bds-board-card__footer">
          {tags && <div className="bds-board-card__tags">{tags}</div>}
          {trailingTag}
        </div>
      )}
    </div>
  );
}

export default BoardCard;
