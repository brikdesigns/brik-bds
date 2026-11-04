/**
 * ToastProvider queue + context tests (#1281).
 *
 * JSX is avoided to keep this a `.test.ts` file (the `components` vitest
 * project's include glob is `**\/*.test.ts`).
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ToastProvider, useToast } from './ToastProvider';
import { toastQueueReducer, visibleToasts, type ToastItem } from './toastQueue';

const item = (id: string): ToastItem => ({
  id,
  title: id,
  tone: 'default',
  urgency: 'polite',
  duration: 4000,
});

describe('toastQueueReducer', () => {
  it('appends new toasts last', () => {
    const state = toastQueueReducer([item('a')], { type: 'add', toast: item('b') });
    expect(state.map((t) => t.id)).toEqual(['a', 'b']);
  });

  it('removes a toast by id and ignores unknown ids', () => {
    const state = [item('a'), item('b')];
    expect(toastQueueReducer(state, { type: 'dismiss', id: 'a' }).map((t) => t.id)).toEqual(['b']);
    expect(toastQueueReducer(state, { type: 'dismiss', id: 'zzz' })).toHaveLength(2);
  });
});

describe('visibleToasts', () => {
  it('shows the oldest maxVisible and holds the rest back', () => {
    const queue = ['a', 'b', 'c', 'd'].map(item);
    expect(visibleToasts(queue, 3).map((t) => t.id)).toEqual(['a', 'b', 'c']);
  });

  it('promotes a waiting toast once a visible one is dismissed', () => {
    const queue = ['a', 'b', 'c', 'd'].map(item);
    const after = toastQueueReducer(queue, { type: 'dismiss', id: 'a' });
    expect(visibleToasts(after, 3).map((t) => t.id)).toEqual(['b', 'c', 'd']);
  });
});

describe('ToastProvider', () => {
  it('renders children and no toast container while the queue is empty', () => {
    const html = renderToStaticMarkup(
      createElement(ToastProvider, null, createElement('p', null, 'app')),
    );
    expect(html).toContain('<p>app</p>');
    expect(html).not.toContain('bds-toast-provider');
  });

  it('useToast throws outside a provider', () => {
    const Probe = () => {
      useToast();
      return null;
    };
    expect(() => renderToStaticMarkup(createElement(Probe))).toThrow(
      'useToast must be used within a ToastProvider',
    );
  });
});
