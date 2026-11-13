import { type HTMLAttributes, type ReactNode } from 'react';
import { ActivityTimeline, type TimelineEvent } from '../ActivityTimeline';
import { CommentComposer, type CommentComposerProps } from '../CommentComposer';
import { Icon } from '../Icon';
import { Tag, type TagColor } from '../Tag';
import { Comment } from '../../icons';
import { bdsClass } from '../../utils';
import './CommentThread.css';

export interface CommentThreadEvent {
  /** Stable React key. */
  id: string;
  /** Who did it (the event's primary line). */
  actor: string;
  /** What they did, e.g. "commented" or "moved this to In progress". */
  action?: string;
  /** Read-only kind label shown as a `Tag`, e.g. "Comment" or "Status". */
  kind?: string;
  /** Hue of the kind `Tag`. */
  kindColor?: TagColor;
  /** Comment text or any node (a `TextLink` to a reference, for instance). */
  body?: ReactNode;
  /** Pre-formatted timestamp. */
  timestamp: string;
  /** ISO 8601 value for the `<time datetime>` attribute. */
  dateTime?: string;
  /** Icon in the timeline dot. Defaults to a chat bubble. */
  icon?: ReactNode;
}

export interface CommentThreadProps
  extends Pick<
      CommentComposerProps,
      'mentions' | 'label' | 'placeholder' | 'submitLabel' | 'pending' | 'disabled' | 'error'
    >,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onSubmit'> {
  /** Events oldest first, so the newest sits last, next to the composer. */
  events: CommentThreadEvent[];
  /**
   * Called with a new comment (see `CommentComposer`). Omit it for a read-only
   * thread — no composer renders.
   */
  onSubmit?: CommentComposerProps['onSubmit'];
  /** Shown when `events` is empty. */
  emptyMessage?: string;
}

/**
 * CommentThread — an `ActivityTimeline` of events with a `CommentComposer`
 * below it. The consumer owns the data and the heading above the thread.
 *
 * @example
 * ```tsx
 * <CommentThread
 *   events={[{ id: '1', actor: 'Emily Rivera', action: 'commented', kind: 'Comment', body: 'Looks good.', timestamp: 'Apr 12, 1:04 PM' }]}
 *   mentions={[{ id: 'a1', label: 'design-system' }]}
 *   onSubmit={async ({ body }) => { await addComment(body); }}
 * />
 * ```
 *
 * @summary Activity timeline with a comment composer
 */
export function CommentThread({
  events,
  onSubmit,
  emptyMessage = 'No activity yet.',
  mentions,
  label,
  placeholder,
  submitLabel,
  pending,
  disabled,
  error,
  className,
  ...props
}: CommentThreadProps) {
  const timelineEvents: TimelineEvent[] = events.map((event) => ({
    id: event.id,
    icon: event.icon ?? <Icon icon={Comment} />,
    label: event.actor,
    detail: event.action,
    content:
      event.kind || event.body ? (
        <>
          {event.kind && (
            <Tag size="sm" color={event.kindColor}>
              {event.kind}
            </Tag>
          )}
          {event.body && <div className="bds-comment-thread__body">{event.body}</div>}
        </>
      ) : undefined,
    timestamp: event.timestamp,
    dateTime: event.dateTime,
  }));

  return (
    <div className={bdsClass('bds-comment-thread', className)} {...props}>
      {events.length === 0 ? (
        <p className="bds-comment-thread__empty">{emptyMessage}</p>
      ) : (
        <ActivityTimeline events={timelineEvents} />
      )}
      {onSubmit && (
        <CommentComposer
          onSubmit={onSubmit}
          mentions={mentions}
          label={label}
          placeholder={placeholder}
          submitLabel={submitLabel}
          pending={pending}
          disabled={disabled}
          error={error}
        />
      )}
    </div>
  );
}

export default CommentThread;
