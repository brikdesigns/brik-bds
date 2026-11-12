/**
 * The fallback toolbar must reflect the widget's active state when it is built
 * (brik-bds#1803).
 *
 * `?inspect=1` activates the widget synchronously in init(), but the fallback
 * toolbar is built 80ms later. toggleActive() ran while `toggleBtn` was still
 * undefined, so the button was created idle ("Inspect", no `.bi-btn--active`)
 * while the widget was active. The a11y test hid this behind a
 * setActive(false)/setActive(true) workaround.
 *
 * Runs under the `widgets` browser vitest project (see vitest.config.ts).
 */
import { beforeAll, describe, expect, it } from 'vitest';
import widgetSource from './inspect-widget.js?raw';

describe('inspect widget fallback toolbar with ?inspect=1', () => {
  beforeAll(async () => {
    history.replaceState(null, '', `${location.pathname}?inspect=1`);
    const script = document.createElement('script');
    script.textContent = widgetSource;
    document.body.appendChild(script);
    // The fallback toolbar is built behind an 80ms timer.
    await new Promise((r) => setTimeout(r, 200));
  });

  it('renders the toggle active, labelled "Inspecting…"', () => {
    const btn = document.querySelector('.bi-toolbar .bi-btn');
    expect(btn, 'fallback toolbar did not build').not.toBeNull();
    expect(btn!.classList.contains('bi-btn--active')).toBe(true);
    expect(btn!.textContent?.trim()).toBe('Inspecting…');
  });
});
