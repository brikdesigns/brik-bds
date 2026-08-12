/**
 * WCAG 2.1 AA gate for the inspect widget chrome (brik-bds#1792).
 *
 * The widget shipped failing AA in eleven places — four `#fff`-on-poppy-500
 * fills and one poppy-500 label at 3.78:1, a `#3aa86b` BDS badge at 3.00:1, an
 * unknown-token warning at 2.20:1, four `--text-muted` rules at 3.84:1 painted
 * at 10–12px where the token is sanctioned only for AA-large, and an inline
 * `style="color:#3aa86b"` in the panel template at 3.00:1.
 *
 * It went unnoticed because nothing looked at it. Both `Tools/inspect-widget`
 * visual baselines capture the un-activated page, so the pill, panel and
 * toolbar chrome are never in a screenshot — a change to any of them moves zero
 * pixels (confirmed on #1786). This test is what makes the activated chrome
 * observable.
 *
 * Why it renders rather than reading the CSS: a static sweep of the stylesheet
 * scores the pairs it can see written together, and found ten of the eleven. It
 * missed the inline `style="color:#3aa86b"` entirely, because that pair only
 * exists once the panel template interpolates against `.bi-panel`'s white. Only
 * resolving the real cascade catches those.
 *
 * Why contrast-gate.yml does not cover it: that gate resolves token pairings
 * from `tokens/contrast-pairings.json`. This widget inlines raw hexes on
 * purpose — it ships to Supabase Storage and runs inside self-contained client
 * mockups where the BDS token sheet is absent — so it is invisible to the token
 * gate and needs its own.
 *
 * Runs under the `widgets` browser vitest project (see vitest.config.ts).
 */
import { beforeAll, describe, expect, it } from 'vitest';
import axe from 'axe-core';
// Raw source so the IIFE can be executed as a real inline <script>.
import widgetSource from './inspect-widget.js?raw';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const settle = () => new Promise((r) => setTimeout(r, 150));

/**
 * A target with enough shape that the panel renders every row type: a BDS root
 * (so the `--bds` badge paints), classes (so `.bi-class-chip` paints) and an
 * inline hardcoded colour (so `.bi-hardcoded` and `.bi-token--unknown` paint).
 *
 * The fixture's own pair must clear AA. axe audits the whole document, so a
 * failing fixture reports as a violation and masks whether the chrome is clean.
 * White on #123456 is 12.6:1 and still hardcoded, which is what the inspector
 * keys on — it flags a raw hex regardless of how well that hex contrasts.
 */
function mountFixture(): HTMLElement {
  const host = document.createElement('div');
  host.className = 'bds-card bds-card--elevated';
  host.setAttribute('data-section', 'a11y-fixture');
  host.style.cssText = 'width:200px;height:120px;color:#ffffff;background:#123456;padding:8px';
  host.textContent = 'fixture';
  document.body.appendChild(host);
  return host;
}

/**
 * Mounted ONCE for the file, and never torn down.
 *
 * The widget binds `mousemove` / `click` / `keydown` on `document` and exposes
 * no teardown, so a per-test remount leaves every prior instance live: by the
 * fourth test, four widgets each open their own panel and the exactly-one
 * assertions below become meaningless. One instance, driven forward through the
 * states in declaration order, is what keeps them honest.
 */
function mountWidget(): void {
  // The widget self-disables unless data-auto-enable or ?inspect=1 is present.
  // `?inspect=1` also auto-activates it (inspect-widget.js:1585), so hover and
  // click work without touching the toggle.
  history.replaceState(null, '', `${location.pathname}?inspect=1`);
  const script = document.createElement('script');
  script.textContent = widgetSource;
  document.body.appendChild(script);
}

interface InspectApi {
  setActive: (next: boolean) => void;
  isActive: () => boolean;
}

function inspectApi(): InspectApi {
  const api = (window as unknown as { BrikInspect?: InspectApi }).BrikInspect;
  if (!api?.setActive) throw new Error('widget did not expose BrikInspect.setActive');
  return api;
}

/**
 * Paint the active state onto the fallback toolbar button.
 *
 * `?inspect=1` activates synchronously, but the fallback toolbar is built 80ms
 * later behind a setTimeout (inspect-widget.js:1575), so `toggleActive` runs
 * with `toggleBtn` still undefined and the button renders un-styled while the
 * widget is active. Re-driving the public API once the button exists is what
 * puts `.bi-btn--active` in the DOM for auditing. This helper works around that
 * desync so the active fill can be measured; it does not assert it.
 */
function repaintActiveToggle(): void {
  const api = inspectApi();
  api.setActive(false);
  api.setActive(true);
}

async function auditWidgetChrome(): Promise<string[]> {
  const results = await axe.run(document.body, {
    runOnly: { type: 'tag', values: AXE_TAGS },
  });
  return results.violations.flatMap((v) =>
    v.nodes.map((n) => `${v.id} [${v.impact}] ${n.target.join(' ')} — ${n.failureSummary ?? ''}`),
  );
}

function hitFixture(type: 'mousemove' | 'click'): void {
  const r = fixture.getBoundingClientRect();
  fixture.dispatchEvent(
    new MouseEvent(type, {
      clientX: r.left + 10,
      clientY: r.top + 10,
      bubbles: true,
      cancelable: true,
    }),
  );
}

let fixture: HTMLElement;

beforeAll(async () => {
  fixture = mountFixture();
  mountWidget();
  // The fallback toolbar lands on an 80ms timer; wait past it.
  await settle();
});

// Ordered: each test drives the single widget instance one state further.
describe('inspect widget — WCAG 2.1 AA (#1792)', () => {
  it('toolbar has no violations', async () => {
    expect(document.querySelectorAll('.bi-btn').length).toBe(1);
    expect(await auditWidgetChrome()).toEqual([]);
  });

  it('active toolbar button has no violations', async () => {
    repaintActiveToggle();
    await settle();

    // Assert the fixture before auditing it — a button that silently failed to
    // take the active class would audit the idle chrome and report green, which
    // is the failure mode a gate exists to prevent.
    expect(
      document.querySelectorAll('.bi-btn--active').length,
      'toggle never took the active class — the audit below would not cover the active fill',
    ).toBe(1);

    expect(await auditWidgetChrome()).toEqual([]);
  });

  it('hover pill and its badges have no violations', async () => {
    hitFixture('mousemove');
    await settle();

    expect(
      document.querySelectorAll('.bi-pill').length,
      'pill did not render — the audit below would not cover it',
    ).toBe(1);
    expect(
      document.querySelectorAll('.bi-pill__badge').length,
      'no pill badge rendered — the --bds / --warn fills would go unaudited',
    ).toBeGreaterThan(0);

    expect(await auditWidgetChrome()).toEqual([]);
  });

  it('open panel, rows and action buttons have no violations', async () => {
    hitFixture('click');
    await settle();

    expect(
      document.querySelectorAll('.bi-panel').length,
      'panel did not open — the audit below would be vacuous',
    ).toBe(1);
    expect(document.querySelectorAll('.bi-row').length).toBeGreaterThan(0);
    expect(document.querySelectorAll('.bi-action-btn').length).toBeGreaterThan(0);

    expect(await auditWidgetChrome()).toEqual([]);
  });
});
