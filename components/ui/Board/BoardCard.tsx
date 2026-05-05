import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import { CompletionToggle } from '../CompletionToggle';

/**
 * BoardCard — A task card within a BoardColumn.
 *
 * Renders a task with title, subtitle, completion toggle, and a
 * tags slot. The left border color indicates category (department,
 * status, etc.) — set via `accentColor`.
 *
 * The completion toggle delegates to `<CompletionToggle>`, the BDS
 * primitive for circular completion controls. Same visual is reused
 * by `<Checklist>` for row-style completion lists.
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
          <CompletionToggle
            className="bds-board-card__check"
            checked={checked}
            onCheckedChange={onCheckedChange}
          />
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
