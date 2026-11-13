import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type SyntheticEvent,
} from 'react';
import { Button } from '../Button';
import { TextArea } from '../TextArea';
import { bdsClass } from '../../utils';
import './CommentComposer.css';

/** `@` followed by non-space characters, at the caret, after the start or whitespace. */
const MENTION_TRIGGER = /(^|\s)@([^\s@]*)$/;

export interface CommentMention {
  /** Stable id returned in the submit payload. */
  id: string;
  /** Text inserted after the `@` and matched while typing (e.g. an agent name). */
  label: string;
  /** Muted second line in the suggestion list. */
  description?: string;
}

export interface CommentSubmitPayload {
  /** The trimmed comment text, mentions included as `@label`. */
  body: string;
  /** Mentions picked from the list and still present in `body`, once each. */
  mentions: CommentMention[];
}

export interface CommentComposerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onSubmit' | 'children'> {
  /**
   * Called with the comment. May return a Promise: the composer shows its
   * pending state until it settles, then clears on resolve and keeps the text
   * on reject (the caller shows the failure through `error`).
   */
  onSubmit: (payload: CommentSubmitPayload) => void | Promise<unknown>;
  /** Suggestions offered after typing `@`. Omit for a plain composer. */
  mentions?: CommentMention[];
  /** Accessible name of the textarea. */
  label?: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Submit button text. */
  submitLabel?: string;
  /** Caller-owned pending (e.g. a form action in flight). Adds to the composer's own. */
  pending?: boolean;
  /** Disables the textarea and the submit button. */
  disabled?: boolean;
  /** Error message shown under the textarea, owned by the caller. */
  error?: string;
  /** Visible textarea rows. */
  rows?: number;
}

interface MentionTrigger {
  /** Index of the `@`. */
  start: number;
  /** Text typed after the `@`. */
  query: string;
}

function findTrigger(el: HTMLTextAreaElement): MentionTrigger | null {
  const caret = el.selectionStart ?? el.value.length;
  if (caret !== el.selectionEnd) return null;
  const match = MENTION_TRIGGER.exec(el.value.slice(0, caret));
  if (!match) return null;
  return { start: caret - match[2].length - 1, query: match[2] };
}

/**
 * CommentComposer — a labelled textarea with a submit button and optional
 * `@mention` suggestions from a caller-supplied list.
 *
 * Typing `@` opens a listbox filtered by what follows; ArrowUp/ArrowDown move,
 * Enter or Tab insert `@label`, Esc closes. Cmd/Ctrl+Enter submits. After a
 * submit settles, focus returns to the textarea. The payload names the mentions
 * that were picked, so the caller never re-parses the text.
 *
 * @example
 * ```tsx
 * <CommentComposer
 *   mentions={[{ id: 'a1', label: 'design-system' }]}
 *   onSubmit={async ({ body, mentions }) => { await addComment(body, mentions); }}
 * />
 * ```
 *
 * @summary Comment textarea with submit and optional @mention suggestions
 */
export function CommentComposer({
  onSubmit,
  mentions = [],
  label = 'Add a comment',
  placeholder,
  submitLabel = 'Comment',
  pending = false,
  disabled = false,
  error,
  rows = 3,
  className,
  ...props
}: CommentComposerProps) {
  const baseId = useId();
  const listId = `${baseId}-mentions`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState('');
  const [picked, setPicked] = useState<CommentMention[]>([]);
  const [trigger, setTrigger] = useState<MentionTrigger | null>(null);
  /** `@` index whose list the user closed with Esc; it stays closed until the trigger moves. */
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const isPending = pending || submitting;
  const query = trigger?.query.toLowerCase() ?? '';
  const suggestions =
    trigger && trigger.start !== dismissedAt
      ? mentions.filter((mention) => mention.label.toLowerCase().includes(query))
      : [];
  const open = suggestions.length > 0;
  const active = suggestions[Math.min(activeIndex, suggestions.length - 1)];
  const optionId = (id: string) => `${baseId}-option-${id}`;

  /** Caret index to restore once the picked mention is in the controlled value. */
  const caretAfterPick = useRef<number | null>(null);
  useLayoutEffect(() => {
    const caret = caretAfterPick.current;
    if (caret === null) return;
    caretAfterPick.current = null;
    const el = rootRef.current?.querySelector('textarea');
    el?.focus();
    el?.setSelectionRange(caret, caret);
  }, [value]);

  const textarea = () => rootRef.current?.querySelector('textarea') ?? null;

  const syncTrigger = (el: HTMLTextAreaElement) => {
    const next = mentions.length > 0 ? findTrigger(el) : null;
    if (next?.start !== trigger?.start || next?.query !== trigger?.query) setActiveIndex(0);
    if (!next) setDismissedAt(null);
    setTrigger(next);
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
    syncTrigger(event.target);
  };

  const pick = (mention: CommentMention) => {
    const el = textarea();
    if (!el || !trigger) return;
    const caret = el.selectionStart ?? value.length;
    const insert = `@${mention.label} `;
    const next = value.slice(0, trigger.start) + insert + value.slice(caret);
    const nextCaret = trigger.start + insert.length;
    setValue(next);
    setPicked((prev) => (prev.some((p) => p.id === mention.id) ? prev : [...prev, mention]));
    setTrigger(null);
    caretAfterPick.current = nextCaret;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (open) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        setActiveIndex((i) => (Math.min(i, suggestions.length - 1) + step + suggestions.length) % suggestions.length);
        return;
      }
      if ((event.key === 'Enter' && !event.metaKey && !event.ctrlKey) || event.key === 'Tab') {
        event.preventDefault();
        if (active) pick(active);
        return;
      }
      if (event.key === 'Escape') {
        // Close the list, not whatever surface the composer sits in.
        event.preventDefault();
        event.stopPropagation();
        setDismissedAt(trigger?.start ?? null);
        return;
      }
    }
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void submit();
    }
  };

  const submit = async () => {
    const body = value.trim();
    if (!body || disabled || isPending) return;
    setSubmitting(true);
    try {
      await onSubmit({ body, mentions: picked.filter((mention) => body.includes(`@${mention.label}`)) });
      setValue('');
      setPicked([]);
      setTrigger(null);
    } catch {
      // Keep the text; the caller reports the failure through `error`.
    } finally {
      setSubmitting(false);
      // The pending button was disabled, so focus fell to <body>: put it back.
      textarea()?.focus();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  };

  const handleSelect = (event: SyntheticEvent<HTMLTextAreaElement>) => syncTrigger(event.currentTarget);

  return (
    <div
      ref={rootRef}
      className={bdsClass('bds-comment-composer', isPending && 'bds-comment-composer--pending', className)}
      {...props}
    >
      <form className="bds-comment-composer__form" onSubmit={handleSubmit}>
        <div className="bds-comment-composer__field">
          <TextArea
            aria-label={label}
            fullWidth
            rows={rows}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onSelect={handleSelect}
            onBlur={() => setTrigger(null)}
            disabled={disabled}
            readOnly={isPending}
            error={error}
            aria-busy={isPending || undefined}
            aria-autocomplete={mentions.length > 0 ? 'list' : undefined}
            aria-controls={open ? listId : undefined}
            aria-activedescendant={open && active ? optionId(active.id) : undefined}
          />
          {open && (
            <ul
              id={listId}
              role="listbox"
              aria-label="Mention suggestions"
              className="bds-comment-composer__list"
            >
              {suggestions.map((mention) => (
                <li
                  key={mention.id}
                  id={optionId(mention.id)}
                  role="option"
                  aria-selected={mention === active}
                  className={bdsClass(
                    'bds-comment-composer__option',
                    mention === active && 'bds-comment-composer__option--active',
                  )}
                  // Keep focus in the textarea so it keeps receiving keys.
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseMove={() => setActiveIndex(suggestions.indexOf(mention))}
                  onClick={() => pick(mention)}
                >
                  <span className="bds-comment-composer__option-label">@{mention.label}</span>
                  {mention.description && (
                    <span className="bds-comment-composer__option-description">{mention.description}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bds-comment-composer__actions">
          <Button type="submit" size="md" loading={isPending} disabled={disabled || value.trim() === ''}>
            {submitLabel}
          </Button>
        </div>
      </form>
      <span role="status" className="bds-comment-composer__status">
        {open ? `${suggestions.length} mention ${suggestions.length === 1 ? 'suggestion' : 'suggestions'} available` : ''}
      </span>
    </div>
  );
}

export default CommentComposer;
