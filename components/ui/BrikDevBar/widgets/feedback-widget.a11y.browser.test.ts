/**
 * WCAG 2.1 AA gate for the feedback widget chrome (brik-bds#1576).
 *
 * The widget is the surface every client accepts or rejects their site with, and
 * it shipped failing AA in eight places — five `#fff`-on-poppy-light fills at
 * 3.78:1, a pending pin at 2.15:1, a destructive button at 3.76:1, six muted-text
 * rules at 3.54:1, and an unlabelled file input.
 *
 * Why this test renders rather than reads the CSS: a static pass over the
 * stylesheet found only six of those. It missed the `#888` rules and the pending
 * pin, because each inherits half its foreground/background pair from a
 * different rule. Only resolving the real cascade catches them.
 *
 * Why it is not covered by contrast-gate.yml: that gate resolves token pairings
 * from `tokens/contrast-pairings.json`. This widget inlines raw hexes on purpose
 * — it ships to Supabase Storage and runs inside self-contained client mockups
 * where the BDS token sheet is absent — so it is invisible to the token gate and
 * needs its own.
 *
 * Runs under the `widgets` browser vitest project (see vitest.config.ts).
 */
import { afterEach, describe, expect, it } from 'vitest';
import axe from 'axe-core';
// Raw source so the IIFE can be executed as a real inline <script>: the widget
// reads its config off `document.currentScript`, which is null under a bare eval
// but correctly set for an inline script during execution.
import widgetSource from './feedback-widget.js?raw';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/** Boot the widget into the current document with pin mode available. */
function mountWidget(): void {
  const script = document.createElement('script');
  script.setAttribute('data-review-token', 'a11y-test');
  // Unroutable on purpose — this test asserts chrome, never network behaviour.
  script.setAttribute('data-api-url', 'http://127.0.0.1:9');
  script.textContent = widgetSource;
  document.body.appendChild(script);
}

function buttonMatching(pattern: RegExp): HTMLElement | undefined {
  return Array.from(document.querySelectorAll<HTMLElement>('.bfb-btn')).find((b) =>
    pattern.test((b.textContent ?? '').toLowerCase()),
  );
}

const settle = () => new Promise((r) => setTimeout(r, 150));

async function auditWidgetChrome(): Promise<string[]> {
  const results = await axe.run(document.body, {
    runOnly: { type: 'tag', values: AXE_TAGS },
  });
  return results.violations.flatMap((v) =>
    v.nodes.map((n) => `${v.id} [${v.impact}] ${n.target.join(' ')} — ${n.failureSummary ?? ''}`),
  );
}

afterEach(() => {
  document.body.innerHTML = '';
  document.querySelectorAll('style').forEach((s) => s.remove());
});

describe('feedback widget — WCAG 2.1 AA (#1576)', () => {
  it('toolbar has no violations', async () => {
    mountWidget();
    await settle();
    expect(document.querySelectorAll('.bfb-btn').length).toBeGreaterThan(0);
    expect(await auditWidgetChrome()).toEqual([]);
  });

  it('pin form and pending pin have no violations', async () => {
    mountWidget();
    await settle();

    buttonMatching(/feedback/)?.click();
    await settle();
    document.body.dispatchEvent(
      new MouseEvent('click', { clientX: 400, clientY: 300, bubbles: true }),
    );
    await settle();

    // Assert the fixture before auditing it. A silently-unopened form would
    // audit an empty document and report green — the failure mode a gate exists
    // to prevent.
    expect(
      document.querySelectorAll('.bfb-pin--pending').length,
      'pin mode did not drop a pending pin — the audit below would be vacuous',
    ).toBeGreaterThan(0);
    expect(document.querySelectorAll('.bfb-tag').length).toBeGreaterThan(0);
    expect(document.querySelectorAll('.bfb-submit').length).toBeGreaterThan(0);

    expect(await auditWidgetChrome()).toEqual([]);
  });

  it('comments list has no violations', async () => {
    mountWidget();
    await settle();

    buttonMatching(/comment/)?.click();
    await settle();

    expect(
      document.querySelectorAll('[class^="bfb-list"]').length,
      'comments panel did not render — the audit below would be vacuous',
    ).toBeGreaterThan(0);

    expect(await auditWidgetChrome()).toEqual([]);
  });
});
