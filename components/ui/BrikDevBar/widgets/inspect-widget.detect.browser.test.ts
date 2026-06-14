/**
 * Section-detector regression tests for the BDS inspect widget (brik-bds#886).
 *
 * The widget is a browser-only IIFE that exposes `window.BrikInspect.detectContext`
 * (ADR-007: the single element-context detector). We execute the IIFE source in a
 * real chromium DOM and assert the section-resolution rules that #886 fixed:
 *
 *   - A click whose nearest landmark is `<main>` (no labeled region) reports NO
 *     section — the page H1 / skip-link id is never surfaced as a section.
 *   - Explicit author labels (aria-label / data-section / `section--{type}`) and
 *     real (non-H1) section headings ARE reported.
 *
 * Runs under the `widgets` browser vitest project (see vitest.config.ts).
 */
import { beforeAll, describe, expect, it } from 'vitest';
// Raw source so we can execute the IIFE in the page's global scope; it attaches
// detectContext to `window` on load.
import widgetSource from './inspect-widget.js?raw';

interface ReportContext {
  page?: string;
  section?: string;
  component?: string;
  element_tag?: string;
}

let detectContext: (el: Element) => ReportContext;

beforeAll(() => {
  // The widget self-disables (`if (!SHOULD_ENABLE) return`) unless data-auto-enable
  // or ?inspect=1 is present; flip the URL flag so the IIFE proceeds far enough to
  // expose detectContext.
  history.replaceState(null, '', `${location.pathname}?inspect=1`);
  // Execute the IIFE synchronously in the page scope; it attaches detectContext
  // to `window`. eval (not a dynamic <script>) so any load-time throw surfaces here.
  try {
    // eslint-disable-next-line no-eval
    (0, eval)(widgetSource);
  } catch (err) {
    throw new Error(`widget IIFE threw on load: ${(err as Error).stack ?? String(err)}`);
  }
  const api = (window as unknown as {
    BrikInspect?: { detectContext?: (el: Element) => ReportContext };
  }).BrikInspect;
  if (!api?.detectContext) throw new Error('widget did not expose BrikInspect.detectContext');
  detectContext = api.detectContext;
});

function render(html: string): Element {
  document.body.innerHTML = html;
  const target = document.getElementById('target');
  if (!target) throw new Error('fixture is missing #target');
  return target;
}

describe('inspect widget — section detection (#886)', () => {
  it('reports no section for a <main>-only click (page H1 never surfaced)', () => {
    const target = render(`
      <main id="main-content">
        <h1>Good Evening, Brik</h1>
        <p id="target">Portal activity and quick stats.</p>
      </main>
    `);
    expect(detectContext(target).section).toBeUndefined();
  });

  it('does not surface the page H1 even when a bare <section> wraps it', () => {
    const target = render(`
      <main>
        <section>
          <h1 id="target">Good Evening, Brik</h1>
        </section>
      </main>
    `);
    expect(detectContext(target).section).toBeUndefined();
  });

  it('reports an aria-label on a section region', () => {
    const target = render(`
      <main>
        <section aria-label="Recent Engagements"><p id="target">row</p></section>
      </main>
    `);
    expect(detectContext(target).section).toBe('Recent Engagements');
  });

  it('reports a data-section attribute', () => {
    const target = render(`
      <main><div data-section="stats"><p id="target">x</p></div></main>
    `);
    expect(detectContext(target).section).toBe('stats');
  });

  it('reports the mockup section--{type} convention', () => {
    const target = render(`
      <section class="section section--hero"><p id="target">x</p></section>
    `);
    expect(detectContext(target).section).toBe('hero');
  });

  it('reports a real section heading that is not the page H1', () => {
    const target = render(`
      <main>
        <h1>Page Title</h1>
        <section><h2>Pricing</h2><p id="target">x</p></section>
      </main>
    `);
    expect(detectContext(target).section).toBe('Pricing');
  });
});
