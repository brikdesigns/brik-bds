import type { ReactNode } from 'react';
import { Badge, type BadgeTone } from '../Badge';
import { Icon } from '../Icon';
import { InteractiveListItem } from '../InteractiveListItem';
import { bdsClass } from '../../utils';
import './StatusList.css';

export type StatusListStatus = 'complete' | 'in_progress' | 'not_started' | 'blocked' | 'negative';

export interface StatusListItem {
  /** Stable identity for the row. */
  id: string;
  /** Row title. */
  title: string;
  /**
   * Optional description under the title. `ReactNode` so it can hold inline
   * content such as a `TextLink size="small"`.
   */
  description?: ReactNode;
  /** The row's state. Each state gets its own icon, badge tone and badge label. */
  status: StatusListStatus;
  /**
   * Failure reason, shown under the description. Rendered only when `status`
   * is `negative`, in a `role="alert"` region so assistive technology announces it.
   */
  message?: ReactNode;
}

export interface StatusListProps {
  /** Rows in render order. */
  items: StatusListItem[];
  /** Extra class on the wrapping `<ul>`. */
  className?: string;
}

const STATUS: Record<
  StatusListStatus,
  { icon: string; tone: BadgeTone; label: string; modifier: string }
> = {
  complete: { icon: 'ph:check-circle', tone: 'positive', label: 'Complete', modifier: 'status-complete' },
  in_progress: { icon: 'ph:clock', tone: 'info', label: 'In Progress', modifier: 'status-in-progress' },
  not_started: { icon: 'ph:circle', tone: 'neutral', label: 'Not Started', modifier: 'status-not-started' },
  blocked: { icon: 'ph:warning', tone: 'warning', label: 'Blocked', modifier: 'status-blocked' },
  negative: { icon: 'ph:warning-circle', tone: 'negative', label: 'Failed', modifier: 'tone-negative' },
};

/**
 * StatusList — a read-only list of tracked outputs, each shown as complete, in
 * progress, not started, blocked or failed. Rows are display-only `InteractiveListItem`s
 * (no click target, no strikethrough) with a status icon and a `Badge`. A failed
 * row can carry an `message` that is announced to assistive technology.
 *
 * Use it to read progress. For toggling completion use `Checklist` /
 * `ChecklistGroup`; for position in a linear flow use `ProgressStepper`.
 *
 * @example
 * ```tsx
 * <StatusList
 *   items={[
 *     { id: 'sitemap', title: 'Site Structure', status: 'complete' },
 *     { id: 'seo', title: 'SEO Metadata', status: 'negative', message: 'Agent run failed' },
 *   ]}
 * />
 * ```
 *
 * @summary Read-only status rows with icon, badge and error message
 */
export function StatusList({ items, className }: StatusListProps) {
  return (
    <ul role="list" className={bdsClass('bds-status-list', className)}>
      {items.map((item) => {
        const { icon, tone, label, modifier } = STATUS[item.status];
        const message = item.status === 'negative' ? item.message : undefined;
        const hasMessage = message !== undefined && message !== null && message !== '';
        const hasDescription =
          item.description !== undefined && item.description !== null && item.description !== '';

        return (
          <li key={item.id} className="bds-status-list__item">
            <InteractiveListItem
              interactive={false}
              leading={
                <span
                  className={bdsClass('bds-status-list__icon', `bds-status-list__icon--${modifier}`)}
                  aria-hidden="true"
                >
                  <Icon icon={icon} />
                </span>
              }
              title={item.title}
              subtitle={
                hasDescription || hasMessage ? (
                  <>
                    {hasDescription && item.description}
                    {hasMessage && (
                      <span role="alert" className="bds-status-list__message">
                        {message}
                      </span>
                    )}
                  </>
                ) : undefined
              }
              trailing={
                <Badge tone={tone} size="sm">
                  {label}
                </Badge>
              }
            />
          </li>
        );
      })}
    </ul>
  );
}

export default StatusList;
