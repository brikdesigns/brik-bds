/**
 * Pins are scoped to the page they were left on.
 *
 * One widget instance can serve many pages under a single variant key — the
 * client portal mounts it once in its layout with a constant
 * data-variant-key="portal". The widget used to load every pin for that variant
 * and draw all of them on every page. These tests boot the real script with the
 * review API stubbed and assert the pin labels rendered per location.
 *
 * Run against a widget without page scoping, every "other page" case fails.
 *
 * The page location is driven with history.pushState (same-origin, no reload),
 * which is also exactly what a client-side navigation does.
 *
 * Runs under the `components-browser` vitest project (see vitest.config.ts).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import widgetSource from './feedback-widget.js?raw';

const ORIGIN = window.location.origin;
const PAGE_X = `${ORIGIN}/admin/companies`;
const PAGE_Y = `${ORIGIN}/admin/projects`;

type Row = Record<string, unknown>;

function row(id: string, pageUrl: string | null | undefined, extra: Row = {}): Row {
  const r: Row = {
    id,
    variant_key: 'portal',
    author_name: 'Nick',
    comment: `comment ${id}`,
    pin_x: 42.5,
    pin_y: 310,
    viewport_width: 1440,
    status: 'new',
    created_at: '2026-11-13T00:00:00Z',
    client_completed_at: null,
    ...extra,
  };
  if (pageUrl !== undefined) r.page_url = pageUrl;
  return r;
}

const startUrl = window.location.href;
const settle = (ms = 150) => new Promise((r) => setTimeout(r, ms));
let intervals: ReturnType<typeof setInterval>[] = [];
let fetches = 0;

/** Boot the widget at `url` with `feedback` as the review's stored rows. */
async function load(url: string, feedback: Row[]): Promise<void> {
  window.history.replaceState({}, '', new URL(url).pathname + new URL(url).search + new URL(url).hash);
  vi.spyOn(window, 'fetch').mockImplementation(async () => {
    fetches += 1;
    return new Response(JSON.stringify({ review: { design_feedback: feedback } }), { status: 200 });
  });
  const script = document.createElement('script');
  script.setAttribute('data-review-token', 'tok');
  script.setAttribute('data-api-url', 'https://mock.invalid');
  script.setAttribute('data-variant-key', 'portal');
  script.setAttribute('data-directory-url', 'https://mock.invalid/review/tok');
  script.textContent = widgetSource;
  document.body.appendChild(script);
  await settle();
}

const pinLabels = () =>
  Array.from(document.querySelectorAll('.bfb-pin:not(.bfb-pin--pending)')).map((p) => p.textContent);

beforeEach(() => {
  fetches = 0;
  // The widget's 400ms pathname poll outlives its <script>; a stale instance
  // would re-scope and repaint pins (it removes every `.bfb-pin` in the
  // document) during a later test. Track each timer so afterEach can stop it.
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
  document.body.innerHTML = '';
  document.querySelectorAll('style').forEach((s) => s.remove());
  window.history.replaceState({}, '', startUrl);
});

describe('feedback widget page scoping', () => {
  it('renders a pin on the page it was left on', async () => {
    await load(PAGE_X, [row('a', PAGE_X)]);
    expect(pinLabels()).toEqual(['1']);
  });

  it('does not render a pin left on a different page', async () => {
    await load(PAGE_Y, [row('a', PAGE_X)]);
    expect(pinLabels()).toEqual([]);
  });

  it('ignores query string and hash when matching the page', async () => {
    await load(`${PAGE_X}?tab=billing#top`, [row('a', `${PAGE_X}/`)]);
    expect(pinLabels()).toEqual(['1']);
  });

  it('numbers pins within the current page, not across pages', async () => {
    await load(PAGE_Y, [row('a', PAGE_X), row('b', PAGE_Y), row('c', PAGE_Y)]);
    expect(pinLabels()).toEqual(['1', '2']);
  });

  it('keeps a pin with no stored page visible (legacy rows, single-page mockups)', async () => {
    await load(PAGE_Y, [row('a', null)]);
    expect(pinLabels()).toEqual(['1']);
    // Older API deploys omit the field entirely.
    document.body.innerHTML = '';
    document.querySelectorAll('style').forEach((s) => s.remove());
    await load(PAGE_Y, [row('a', undefined)]);
    expect(pinLabels()).toEqual(['1']);
  });

  it('re-scopes pins after a client-side navigation without refetching', async () => {
    await load(PAGE_X, [row('a', PAGE_X), row('b', PAGE_Y)]);
    expect(pinLabels()).toEqual(['1']);

    window.history.pushState({}, '', '/admin/projects');
    await settle(900);

    expect(document.querySelectorAll('.bfb-pin')).toHaveLength(1);
    expect(pinLabels()).toEqual(['1']);
    expect(document.querySelector('.bfb-pin')?.getAttribute('class')).toBe('bfb-pin');
    expect(fetches).toBe(1);
  });
});
