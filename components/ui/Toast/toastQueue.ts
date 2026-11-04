import type { ReactNode } from 'react';
import type { ToastTone, ToastUrgency } from './Toast';

export interface ToastItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  tone: ToastTone;
  urgency: ToastUrgency;
  /** Milliseconds before auto-dismiss once visible. `0` keeps the toast until dismissed. */
  duration: number;
}

export type ToastQueueAction =
  | { type: 'add'; toast: ToastItem }
  | { type: 'dismiss'; id: string };

/** Newest toast goes last; only the first `maxVisible` render, the rest wait. */
export function toastQueueReducer(state: ToastItem[], action: ToastQueueAction): ToastItem[] {
  switch (action.type) {
    case 'add':
      return [...state, action.toast];
    case 'dismiss':
      return state.filter((t) => t.id !== action.id);
  }
}

export function visibleToasts(queue: ToastItem[], maxVisible: number): ToastItem[] {
  return queue.slice(0, maxVisible);
}
