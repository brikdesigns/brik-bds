/**
 * Regression test for the cascade-keyword skip in getDeclaredValue
 * (brik-client-portal#1615).
 *
 * The inspector reads the *declared* (specified) value off the highest-specificity
 * matched rule. Consumers that bridge Tailwind preflight back to BDS cascade layers
 * declare `[class*="bds-"] { all: revert-layer }`, which surfaces `revert-layer` for
 * every property and masks the real token in the panel. `revert` / `revert-layer`
 * are cascade-control keywords (they defer to a lower layer/origin), not design
 * decisions, so getDeclaredValue must skip them and fall through to the token rule.
 *
 * Runs under the `widgets` browser vitest project (real chromium DOM) — `revert-layer`
 * has no meaning in jsdom.
 */
import { beforeAll, describe, expect, it } from 'vitest';
// Raw source so we can execute the IIFE in the page's global scope.
import widgetSource from './inspect-widget.js?raw';

let getDeclaredValue: (el: Element, prop: string) => { value: string; origin: string } | null;

beforeAll(() => {
  // The widget self-disables unless ?inspect=1 / data-auto-enable is present.
  history.replaceState(null, '', `${location.pathname}?inspect=1`);
  // eslint-disable-next-line no-eval
  (0, eval)(widgetSource);
  const api = (window as unknown as {
    BrikInspect?: { getDeclaredValue?: typeof getDeclaredValue };
  }).BrikInspect;
  if (!api?.getDeclaredValue) throw new Error('widget did not expose BrikInspect.getDeclaredValue');
  getDeclaredValue = api.getDeclaredValue;

  // Inject the fixture stylesheet once, before any getDeclaredValue call —
  // buildRulesIndex caches on first invocation. The revert rule is authored
  // LAST so that, absent the skip, it would win the >= specificity tie (both
  // selectors score one class/attribute = 100) and mask the token.
  const style = document.createElement('style');
  style.textContent = `
    .token-rule { color: var(--text-primary); }
    [class*="bds-"] { color: revert-layer; }
    .only-revert { background-color: revert-layer; }
  `;
  document.head.appendChild(style);
});

describe('inspect widget — cascade-keyword skip (#1615)', () => {
  it('returns the real token, not the revert-layer reset rule', () => {
    document.body.innerHTML = `<div id="t" class="bds-x token-rule">x</div>`;
    const declared = getDeclaredValue(document.getElementById('t')!, 'color');
    expect(declared?.value.trim()).toBe('var(--text-primary)');
  });

  it('returns null when the only matching rule is a cascade reset', () => {
    document.body.innerHTML = `<div id="t2" class="bds-z only-revert">y</div>`;
    expect(getDeclaredValue(document.getElementById('t2')!, 'background-color')).toBeNull();
  });
});
