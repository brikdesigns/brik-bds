/**
 * The inspector's "Feedback" button opens the review feedback widget.
 *
 * The inspector panel's `[data-action="report-feedback"]` button emits
 * `brik:inspect:report` on window and exits inspect mode. ADR-007: feedback
 * surfaces consume that event. The React DevFeedbackWidget does; the vanilla
 * review widget (feedback-widget.js, what the portal's staging deploy mounts
 * and what client mockups inject beside the inspector) registered no listener,
 * so the click dispatched an event nobody read and nothing opened.
 *
 * These tests boot the three real scripts together (DevBar, inspector,
 * review widget) and drive the real call-site chain: lock an element, click the
 * panel button, assert the widget's feedback slot is active and pin mode is on.
 * A test on the widget alone would not catch this: the defect is the missing
 * wiring between two scripts.
 *
 * Runs under the `components-browser` vitest project (see vitest.config.ts).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import devbarSource from './devbar.js?raw';
import inspectSource from './inspect-widget.js?raw';
import widgetSource from './feedback-widget.js?raw';

const startUrl = window.location.href;
const settle = (ms = 200) => new Promise((r) => setTimeout(r, ms));
let intervals: ReturnType<typeof setInterval>[] = [];
// Each boot adds window/document listeners that outlive its <script>. A stale
// instance's `brik:inspect:report` or click handler would act on the next test's
// DOM, so record every registration and remove it in afterEach.
let listeners: Array<[EventTarget, string, EventListenerOrEventListenerObject, unknown]> = [];

function inject(source: string, attrs: Record<string, string> = {}): void {
  const script = document.createElement('script');
  for (const [k, v] of Object.entries(attrs)) script.setAttribute(k, v);
  script.textContent = source;
  document.body.appendChild(script);
}

function fire(el: Element, type: string): void {
  el.dispatchEvent(new MouseEvent(type, { bubbles: true, composed: true, clientX: 5, clientY: 5 }));
}

const slot = (id: string) => document.querySelector<HTMLElement>(`.bdb-slot[data-slot-id="${id}"]`);

/** Boot all three scripts, turn the inspector on and lock `#target`. */
async function bootAndLockTarget(): Promise<void> {
  document.body.innerHTML = '<main><p id="target">Hello target text</p></main>';
  vi.spyOn(window, 'fetch').mockImplementation(
    async () => new Response(JSON.stringify({ review: { design_feedback: [] } }), { status: 200 }),
  );
  inject(devbarSource);
  inject(inspectSource, { 'data-auto-enable': '1' });
  inject(widgetSource, {
    'data-review-token': 'tok',
    'data-api-url': 'https://mock.invalid',
    'data-variant-key': 'portal',
    'data-directory-url': 'https://mock.invalid/review/tok',
  });
  await settle();

  slot('inspect')!.click();
  const target = document.getElementById('target')!;
  fire(target, 'mousemove');
  fire(target, 'click');
  await settle();
}

beforeEach(() => {
  for (const target of [window, document] as EventTarget[]) {
    const real = target.addEventListener.bind(target);
    vi.spyOn(target, 'addEventListener').mockImplementation(((
      type: string,
      fn: EventListenerOrEventListenerObject,
      opts?: boolean | AddEventListenerOptions,
    ) => {
      listeners.push([target, type, fn, opts]);
      real(type, fn, opts);
    }) as typeof target.addEventListener);
  }
  // The widget's pathname poll outlives its <script>; stop it between tests.
  const realSetInterval = window.setInterval.bind(window);
  vi.spyOn(window, 'setInterval').mockImplementation(((fn: TimerHandler, ms?: number) => {
    const id = realSetInterval(fn, ms);
    intervals.push(id);
    return id;
  }) as typeof window.setInterval);
});

afterEach(() => {
  intervals.forEach((id) => window.clearInterval(id));
  intervals = [];
  listeners.forEach(([t, type, fn, opts]) =>
    t.removeEventListener(type, fn, opts as boolean | EventListenerOptions | undefined),
  );
  listeners = [];
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.querySelectorAll('style').forEach((s) => s.remove());
  document.documentElement.classList.remove('bfb-crosshair');
  delete (window as unknown as Record<string, unknown>).BrikDevBar;
  delete (window as unknown as Record<string, unknown>).BrikInspect;
  window.history.replaceState({}, '', startUrl);
});

describe('inspector Feedback button with the review feedback widget mounted', () => {
  it('dispatches the report event (the inspector side works)', async () => {
    const reports: unknown[] = [];
    window.addEventListener('brik:inspect:report', (e) => reports.push((e as CustomEvent).detail));
    await bootAndLockTarget();
    document.querySelector<HTMLElement>('.bi-panel [data-action="report-feedback"]')!.click();
    expect(reports).toHaveLength(1);
  });

  it('opens the feedback slot and pin mode', async () => {
    await bootAndLockTarget();
    expect(slot('feedback'), 'review widget did not register its feedback slot').not.toBeNull();
    expect(slot('feedback')!.getAttribute('data-active')).toBe('false');

    document.querySelector<HTMLElement>('.bi-panel [data-action="report-feedback"]')!.click();
    await settle();

    expect(slot('feedback')!.getAttribute('data-active')).toBe('true');
    expect(document.documentElement.classList.contains('bfb-crosshair')).toBe(true);
  });

  it('exits inspect mode so the pin overlay is not intercepted', async () => {
    await bootAndLockTarget();
    document.querySelector<HTMLElement>('.bi-panel [data-action="report-feedback"]')!.click();
    await settle();
    expect(slot('inspect')!.getAttribute('data-active')).toBe('false');
  });

  it('does not toggle feedback mode back off when it is already open', async () => {
    await bootAndLockTarget();
    slot('feedback')!.click();
    expect(document.documentElement.classList.contains('bfb-crosshair')).toBe(true);

    window.dispatchEvent(new CustomEvent('brik:inspect:report', { detail: {} }));
    await settle();

    expect(slot('feedback')!.getAttribute('data-active')).toBe('true');
    expect(document.documentElement.classList.contains('bfb-crosshair')).toBe(true);
  });
});
