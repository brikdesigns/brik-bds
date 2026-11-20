/**
 * An open comment form and its pending pin do not survive a client-side
 * navigation (#3157).
 *
 * The widget re-scopes saved pins when the pathname changes (a 400ms poll, see
 * feedback-widget.page-scope.browser.test.ts), but the form and the dropped,
 * not-yet-sent pin used to stay on screen over the new page — and submitting
 * tagged the comment with the new page's path. The chosen behaviour is to close
 * both when the path changes, so a comment can only be sent for the page it was
 * pinned on.
 *
 * Boots the real script with the review API stubbed, drives the real call-site
 * chain (toolbar button, then a click on the page), and navigates with
 * history.pushState, which is exactly what a client-side navigation does.
 *
 * Runs under the `components-browser` vitest project (see vitest.config.ts).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import widgetSource from './feedback-widget.js?raw';

const startUrl = window.location.href;
const settle = (ms = 150) => new Promise((r) => setTimeout(r, ms));
let intervals: ReturnType<typeof setInterval>[] = [];

/** Boot the widget on /admin/companies, turn feedback mode on and drop a pin. */
async function openForm(): Promise<void> {
  window.history.replaceState({}, '', '/admin/companies');
  vi.spyOn(window, 'fetch').mockImplementation(
    async () => new Response(JSON.stringify({ review: { design_feedback: [] } }), { status: 200 }),
  );
  const script = document.createElement('script');
  script.setAttribute('data-review-token', 'tok');
  script.setAttribute('data-api-url', 'https://mock.invalid');
  script.setAttribute('data-variant-key', 'portal');
  script.setAttribute('data-directory-url', 'https://mock.invalid/review/tok');
  script.textContent = widgetSource;
  document.body.appendChild(script);
  await settle();

  Array.from(document.querySelectorAll<HTMLElement>('.bfb-btn'))
    .find((b) => /feedback/.test((b.textContent ?? '').toLowerCase()))
    ?.click();
  await settle();
  document.body.dispatchEvent(new MouseEvent('click', { clientX: 400, clientY: 300, bubbles: true }));
  await settle();

  // Assert the fixture before testing the fix: a form that never opened would
  // make the "closed after navigation" assertions pass for the wrong reason.
  expect(document.querySelector('.bfb-form')).not.toBeNull();
  expect(document.querySelector('.bfb-pin--pending')).not.toBeNull();
}

beforeEach(() => {
  // The widget's 400ms pathname poll outlives its <script>; track each timer so
  // afterEach can stop it before it acts on a later test's DOM.
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
  vi.restoreAllMocks();
  document.documentElement.classList.remove('bfb-crosshair');
  document.body.innerHTML = '';
  document.querySelectorAll('style').forEach((s) => s.remove());
  window.history.replaceState({}, '', startUrl);
});

describe('feedback widget — open form across client-side navigation', () => {
  it('closes the form and removes the pending pin when the path changes', async () => {
    await openForm();

    window.history.pushState({}, '', '/admin/projects');
    await settle(900);

    expect(document.querySelector('.bfb-form')).toBeNull();
    expect(document.querySelector('.bfb-pin--pending')).toBeNull();
  });

  it('leaves the form and pending pin alone while the path is unchanged', async () => {
    await openForm();

    window.history.replaceState({}, '', '/admin/companies?tab=notes#top');
    await settle(900);

    expect(document.querySelector('.bfb-form')).not.toBeNull();
    expect(document.querySelector('.bfb-pin--pending')).not.toBeNull();
  });
});
