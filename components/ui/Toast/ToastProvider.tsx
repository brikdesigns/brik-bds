import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Stack } from '../Stack';
import { Toast, type ToastTone, type ToastUrgency } from './Toast';
import { toastQueueReducer, visibleToasts, type ToastItem } from './toastQueue';
import './ToastProvider.css';

export const DEFAULT_TOAST_DURATION_MS = 4000;
export const DEFAULT_MAX_VISIBLE_TOASTS = 3;

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  /** Defaults to `assertive` for `negative` toasts and `polite` for everything else. */
  urgency?: ToastUrgency;
  /** Milliseconds before auto-dismiss. `0` keeps the toast until dismissed. */
  duration?: number;
}

export interface ToastContextValue {
  /** Queue a toast. Returns its id for `dismiss`. */
  toast: (options: ToastOptions) => string;
  /** Shorthand for `toast({ title, description, tone: 'positive' })`. */
  success: (title: ReactNode, description?: ReactNode) => string;
  /** Shorthand for `toast({ title, description, tone: 'negative' })`. */
  error: (title: ReactNode, description?: ReactNode) => string;
  warning: (title: ReactNode, description?: ReactNode) => string;
  info: (title: ReactNode, description?: ReactNode) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Only errors escalate. Success and neutral toasts are confirmations — polite is
 * correct, and making everything assertive would make nothing feel urgent.
 */
function defaultUrgency(tone: ToastTone): ToastUrgency {
  return tone === 'negative' ? 'assertive' : 'polite';
}

interface ToastEntryProps {
  item: ToastItem;
  onDismiss: (id: string) => void;
}

/** Owns one toast's timer, so the countdown starts when it becomes visible, not when it is queued. */
function ToastEntry({ item, onDismiss }: ToastEntryProps) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (item.duration <= 0 || paused) return;
    const timer = setTimeout(() => onDismiss(item.id), item.duration);
    return () => clearTimeout(timer);
  }, [item.id, item.duration, paused, onDismiss]);

  return (
    <div
      className="bds-toast-provider__item"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Toast
        title={item.title}
        description={item.description}
        tone={item.tone}
        urgency={item.urgency}
        onDismiss={() => onDismiss(item.id)}
      />
    </div>
  );
}

export interface ToastProviderProps {
  children: ReactNode;
  /** How many toasts show at once; the rest wait in the queue. Default `3`. */
  maxVisible?: number;
  /** Auto-dismiss delay in milliseconds for toasts that do not set their own. Default `4000`. */
  duration?: number;
}

/**
 * ToastProvider — queue, stacking and auto-dismiss around `Toast`.
 *
 * Mount once near the app root, then call `useToast()` anywhere below it.
 * Toasts stack bottom-center, newest last. Hovering or focusing a toast pauses
 * its countdown. The entrance animation is disabled under
 * `prefers-reduced-motion`.
 *
 * @summary Toast queue, stacking and auto-dismiss provider
 */
export function ToastProvider({
  children,
  maxVisible = DEFAULT_MAX_VISIBLE_TOASTS,
  duration = DEFAULT_TOAST_DURATION_MS,
}: ToastProviderProps) {
  const [queue, dispatch] = useReducer(toastQueueReducer, []);
  const nextId = useRef(0);

  const dismiss = useCallback((id: string) => dispatch({ type: 'dismiss', id }), []);

  const toast = useCallback(
    ({ title, description, tone = 'default', urgency, duration: own }: ToastOptions) => {
      const id = `bds-toast-${nextId.current++}`;
      dispatch({
        type: 'add',
        toast: {
          id,
          title,
          description,
          tone,
          urgency: urgency ?? defaultUrgency(tone),
          duration: own ?? duration,
        },
      });
      return id;
    },
    [duration],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (title, description) => toast({ title, description, tone: 'positive' }),
      error: (title, description) => toast({ title, description, tone: 'negative' }),
      warning: (title, description) => toast({ title, description, tone: 'warning' }),
      info: (title, description) => toast({ title, description, tone: 'info' }),
      dismiss,
    }),
    [toast, dismiss],
  );

  const visible = visibleToasts(queue, maxVisible);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {visible.length > 0 && (
        <Stack gap="sm" className="bds-toast-provider">
          {visible.map((item) => (
            <ToastEntry key={item.id} item={item} onDismiss={dismiss} />
          ))}
        </Stack>
      )}
    </ToastContext.Provider>
  );
}

/** The surrounding `ToastProvider`'s API. Throws outside one. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
