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

// Bodies of the feedback POSTs the widget sent, in order.
let posts: Array<Record<string, unknown>> = [];

/** Boot all three scripts, turn the inspector on and lock `#target`. */
async function bootAndLockTarget(): Promise<void> {
  document.body.innerHTML =
    '<main><div class="bds-card"><p id="target">Hello target text</p></div></main>';
  posts = [];
  vi.spyOn(window, 'fetch').mockImplementation(async (_url, init) => {
    if (init?.method === 'POST') {
      posts.push(JSON.parse(String(init.body)));
      return new Response(JSON.stringify({ feedback: { id: `fb-${posts.length}` } }), { status: 200 });
    }
    return new Response(JSON.stringify({ review: { design_feedback: [] } }), { status: 200 });
  });
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

/** Drop a pin on `#target` (pin mode must be on), fill the form, submit. */
async function dropPinAndSubmit(comment: string): Promise<void> {
  fire(document.getElementById('target')!, 'click');
  await settle();
  document.querySelector<HTMLInputElement>('.bfb-form .bfb-name')!.value = 'Reviewer';
  document.querySelector<HTMLTextAreaElement>('.bfb-form .bfb-comment')!.value = comment;
  document.querySelector<HTMLElement>('.bfb-form .bfb-submit')!.click();
  await settle();
}

const sectionContextOf = (i: number) => posts[i].section_context as Record<string, string> | undefined;

describe('inspector context reaches the review submission (#3158)', () => {
  it('carries dom_path and component from the report into section_context', async () => {
    await bootAndLockTarget();
    document.querySelector<HTMLElement>('.bi-panel [data-action="report-feedback"]')!.click();
    await settle();

    await dropPinAndSubmit('Tighten this copy');

    expect(posts).toHaveLength(1);
    const ctx = sectionContextOf(0);
    expect(ctx?.dom_path, 'section_context.dom_path missing from the POST').toContain('.bds-card');
    expect(ctx?.dom_path).toContain('p:nth-of-type(1)');
    expect(ctx?.component).toBe('bds-card');
    expect(ctx?.element_tag).toBe('p');
  });

  it('does not attach a prior report to a later comment with no report', async () => {
    await bootAndLockTarget();
    document.querySelector<HTMLElement>('.bi-panel [data-action="report-feedback"]')!.click();
    await settle();
    await dropPinAndSubmit('From the inspector');

    slot('feedback')!.click();
    await dropPinAndSubmit('Plain pin, no inspector');

    expect(posts).toHaveLength(2);
    expect(sectionContextOf(1)?.dom_path).toBeUndefined();
    expect(sectionContextOf(1)?.component).toBeUndefined();
  });

  it('drops an unused report when pin mode is toggled off', async () => {
    await bootAndLockTarget();
    document.querySelector<HTMLElement>('.bi-panel [data-action="report-feedback"]')!.click();
    await settle();

    slot('feedback')!.click(); // pin mode off, no pin was dropped
    slot('feedback')!.click(); // pin mode on again, no new report
    await dropPinAndSubmit('Plain pin after toggle');

    expect(sectionContextOf(0)?.dom_path).toBeUndefined();
  });

  it('drops an unused report on client-side navigation', async () => {
    await bootAndLockTarget();
    document.querySelector<HTMLElement>('.bi-panel [data-action="report-feedback"]')!.click();
    await settle();

    window.history.pushState({}, '', '/admin/projects');
    await settle(600);
    await dropPinAndSubmit('Plain pin after nav');

    expect(sectionContextOf(0)?.dom_path).toBeUndefined();
  });
});
