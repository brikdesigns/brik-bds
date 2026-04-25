import { type ReactNode, type HTMLAttributes, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import { CaretDown, CaretUp, X, CheckCircle, Circle, WarningCircle } from '../../icons';
import { bdsClass } from '../../utils';
import { IconButton } from '../Button/IconButton';
import { ButtonGroup } from '../ButtonGroup';
import { ProgressBar } from '../ProgressBar';
import { Spinner } from '../Spinner';
import './TaskConsole.css';

/* ─── Types ──────────────────────────────────────────────────── */

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

/* ─── Status icon map ────────────────────────────────────────── */

function StatusIcon({ status }: { status: TaskItemStatus }) {
  switch (status) {
    case 'completed':
      return <Icon icon={CheckCircle} className="bds-task-console__icon bds-task-console__icon--completed" />;
    case 'failed':
      return <Icon icon={WarningCircle} className="bds-task-console__icon bds-task-console__icon--failed" />;
    case 'in_progress':
      return <Spinner size="sm" className="bds-task-console__icon bds-task-console__icon--in-progress" />;
    case 'pending':
    default:
      return <Icon icon={Circle} className="bds-task-console__icon bds-task-console__icon--pending" />;
  }
}

/* ─── Component ──────────────────────────────────────────────── */

/**
 * TaskConsole — floating progress overlay for long-running operations
 *
 * Renders as a portal at document.body. Shows a collapsible checklist
 * of task items with real-time status updates. Inspired by Google Drive's
 * upload progress widget.
 *
 * Category: Feedback (alongside Toast)
 */
export function TaskConsole({
  title,
  items,
  isOpen = true,
  position = 'bottom-right',
  onDismiss,
  defaultCollapsed = false,
  autoDismissDelay = 0,
  subtitle,
  className,
  style,
  ...props
}: TaskConsoleProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const failedCount = items.filter((i) => i.status === 'failed').length;
  const allDone = items.length > 0 && completedCount + failedCount === items.length;
  const allSucceeded = allDone && failedCount === 0;
  const progressValue = items.length > 0
    ? ((completedCount + failedCount) / items.length) * 100
    : 0;

  // Auto-dismiss after all items complete
  useEffect(() => {
    if (!allDone || autoDismissDelay === 0 || !onDismiss) return;
    const timer = setTimeout(onDismiss, autoDismissDelay);
    return () => clearTimeout(timer);
  }, [allDone, autoDismissDelay, onDismiss]);

  const toggleCollapse = useCallback(() => setCollapsed((c) => !c), []);

  if (!isOpen) return null;

  const consoleEl = (
    <div
      className={bdsClass(
        'bds-task-console',
        `bds-task-console--${position}`,
        allSucceeded && 'bds-task-console--success',
        allDone && failedCount > 0 && 'bds-task-console--has-errors',
        className,
      )}
      role="log"
      aria-live="polite"
      aria-label={typeof title === 'string' ? title : 'Task progress'}
      style={style}
      {...props}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bds-task-console__header" onClick={toggleCollapse}>
        <div className="bds-task-console__header-text">
          <span className="bds-task-console__title">{title}</span>
          {subtitle && <span className="bds-task-console__subtitle">{subtitle}</span>}
        </div>
        <ButtonGroup
          className="bds-task-console__header-actions"
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            variant="ghost"
            size="sm"
            icon={<Icon icon={collapsed ? CaretUp : CaretDown} />}
            label={collapsed ? 'Expand' : 'Collapse'}
            onClick={toggleCollapse}
          />
          {onDismiss && (
            <IconButton
              variant="ghost"
              size="sm"
              icon={<Icon icon={X} />}
              label="Dismiss"
              onClick={onDismiss}
            />
          )}
        </ButtonGroup>
      </div>

      {/* ── Progress bar ───────────────────────────────────────── */}
      {!collapsed && items.length > 0 && (
        <ProgressBar
          className={bdsClass(
            'bds-task-console__progress',
            failedCount > 0 && 'bds-task-console__progress--error',
          )}
          value={progressValue}
          label="Task progress"
        />
      )}

      {/* ── Item list ──────────────────────────────────────────── */}
      {!collapsed && (
        <ul className="bds-task-console__list">
          {items.map((item) => (
            <li
              key={item.id}
              className={bdsClass(
                'bds-task-console__item',
                `bds-task-console__item--${item.status}`,
              )}
            >
              <div className="bds-task-console__item-content">
                <span className="bds-task-console__item-label">{item.label}</span>
                {item.detail && item.status === 'in_progress' && (
                  <span className="bds-task-console__item-detail">{item.detail}</span>
                )}
                {item.href && item.status === 'completed' && (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bds-task-console__item-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View →
                  </a>
                )}
              </div>
              <StatusIcon status={item.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(consoleEl, document.body);
}

export default TaskConsole;
