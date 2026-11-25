import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { TableOfContents } from './index';

/**
 * Scroll-spy decision guard for #2547.
 *
 * IntersectionObserver fires only when a section's *intersection* changes, not
 * when it merely moves, so a position captured in an earlier callback is stale
 * by the time a later one decides. These tests drive the observer callback by
 * hand and move the sections between callbacks to prove the active section is
 * chosen from positions read at decision time, with ties broken by item order.
 */

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

let callback: Callback;
let root: Root;
let host: HTMLElement;
const tops = new Map<string, number>();

class StubObserver {
  constructor(cb: Callback) {
    callback = cb;
  }
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

function section(id: string) {
  const el = document.createElement('section');
  el.id = id;
  el.getBoundingClientRect = () => ({ top: tops.get(id) ?? 0 }) as DOMRect;
  document.body.appendChild(el);
  return el;
}

function fire(...hits: { id: string; isIntersecting: boolean }[]) {
  act(() => {
    callback(
      hits.map(({ id, isIntersecting }) => ({
        target: document.getElementById(id)!,
        boundingClientRect: { top: tops.get(id) ?? 0 } as DOMRectReadOnly,
        isIntersecting,
      })),
    );
  });
}

function activeLabel() {
  return host.querySelector('[aria-current="page"]')?.textContent?.trim();
}

const items = [
  { id: 'toc-a', label: 'A' },
  { id: 'toc-b', label: 'B' },
  { id: 'toc-c', label: 'C' },
];

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', StubObserver);
  tops.clear();
  items.forEach((i) => section(i.id));
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => {
    root.render(React.createElement(TableOfContents, { items }));
  });
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  items.forEach((i) => document.getElementById(i.id)?.remove());
  vi.unstubAllGlobals();
});

describe('TableOfContents scroll-spy (#2547)', () => {
  it('chooses the active section from positions measured at decision time', () => {
    tops.set('toc-a', -300);
    fire({ id: 'toc-a', isIntersecting: true });
    expect(activeLabel()).toBe('A');

    // Scrolled up: A is still intersecting (no callback for it) but now sits
    // lower than B, which just entered the band at the top.
    tops.set('toc-a', 250);
    tops.set('toc-b', 20);
    fire({ id: 'toc-b', isIntersecting: true });

    expect(activeLabel()).toBe('B');
  });

  it('breaks ties by item order, not by the order entries arrived', () => {
    tops.set('toc-a', 0);
    tops.set('toc-b', 0);
    fire({ id: 'toc-b', isIntersecting: true }, { id: 'toc-a', isIntersecting: true });

    expect(activeLabel()).toBe('A');
  });
});
