/**
 * Fail-closed gate for the feedback widget's submit origin (brik-bds#2625).
 *
 * `data-api-url` used to fall back to `https://portal.brikdesigns.com`. A
 * default names a TIER, and this widget is served from Storage to every static
 * client mockup and review site — so any surface built without its
 * feedback-origin env var silently posted client pin feedback into live prod
 * data. The fix is no default plus an early return, and this is the gate that
 * keeps a future edit from reintroducing one.
 *
 * Mounted as a real inline <script> rather than eval'd: the widget reads its
 * config off `document.currentScript`, which is null under a bare eval.
 *
 * Runs under the `widgets` browser vitest project (see vitest.config.ts).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import widgetSource from './feedback-widget.js?raw';

/** Boot the widget with the given script-tag attributes. */
function mountWidget(attrs: Record<string, string>): void {
  const script = document.createElement('script');
  for (const [k, v] of Object.entries(attrs)) script.setAttribute(k, v);
  script.textContent = widgetSource;
  document.body.appendChild(script);
}

/** The widget builds its chrome asynchronously after boot (see the a11y gate). */
const settle = () => new Promise((r) => setTimeout(r, 150));

afterEach(() => {
  document.body.innerHTML = '';
  document.querySelectorAll('style').forEach((s) => s.remove());
  vi.restoreAllMocks();
});

describe('feedback widget fails closed without a submit origin (#2625)', () => {
  it('renders no pin UI and errors when data-api-url is absent', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Unroutable origin omitted on purpose — this is the misconfigured deploy.
    mountWidget({ 'data-review-token': 'fail-closed-test' });
    await settle();

    expect(document.querySelectorAll('.bfb-toolbar')).toHaveLength(0);
    expect(document.querySelectorAll('.bfb-btn')).toHaveLength(0);
    expect(error).toHaveBeenCalledTimes(1);
    // The message must name the attribute, or the operator cannot act on it.
    expect(String(error.mock.calls[0]?.[0])).toContain('data-api-url');
  });

  it('renders the pin UI when both token and origin are configured', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    mountWidget({
      'data-review-token': 'fail-closed-test',
      // Unroutable on purpose — this test asserts mounting, never the network.
      'data-api-url': 'http://127.0.0.1:9',
    });
    await settle();

    expect(document.querySelectorAll('.bfb-btn').length).toBeGreaterThan(0);
    expect(error).not.toHaveBeenCalled();
  });

  it('hardcodes no portal origin anywhere in the widget source', () => {
    // Source-level, not behavioural: a fallback reintroduced on a different
    // attribute would pass the two mount assertions above.
    expect(widgetSource).not.toMatch(/portal\.brikdesigns\.com/);
    expect(widgetSource).not.toMatch(/data-api-url'\)\s*\|\|\s*'h/);
  });
});
