/**
 * Regression tests for the inactive-`@media`-rule cascade defect (#2589).
 *
 * `walkRules` used to flatten every grouping rule's (`@media`, `@supports`,
 * `@container`) style rules into the index with no record of the enclosing
 * condition. `getDeclaredValue` then admitted any such rule as a candidate on
 * selector match alone, so a currently-INACTIVE `@media` block tied on
 * specificity with the base rule and won on later source order — the panel
 * reported a token from a breakpoint that isn't the one in effect.
 *
 * Runs under the `components-browser` vitest project (real chromium) so the
 * fixture's `@media (max-width: 991px)` override can be driven by an actual
 * viewport resize via `page.viewport()`, exercising the real
 * `window.matchMedia` the fix reads rather than a stub of it.
 */
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { page } from '@vitest/browser/context';
// Raw source so we can execute the IIFE in the page's global scope.
import widgetSource from './inspect-widget.js?raw';

type Declared = { value: string; origin: string } | null;
let getDeclaredValue: (el: Element, prop: string) => Declared;
let auditProp: (el: Element, prop: string) => { isViolation: boolean; declared: string | null } | null;

const ORIGINAL_VIEWPORT = { width: 1280, height: 720 };

beforeAll(async () => {
  // The widget self-disables unless ?inspect=1 / data-auto-enable is present.
  history.replaceState(null, '', `${location.pathname}?inspect=1`);
  // eslint-disable-next-line no-eval
  (0, eval)(widgetSource);
  const api = (window as unknown as {
    BrikInspect?: {
      getDeclaredValue?: typeof getDeclaredValue;
      auditProp?: typeof auditProp;
    };
  }).BrikInspect;
  if (!api?.getDeclaredValue || !api?.auditProp) {
    throw new Error('widget did not expose BrikInspect.getDeclaredValue / auditProp');
  }
  getDeclaredValue = api.getDeclaredValue;
  auditProp = api.auditProp;

  // Repro fixture (issue's own shape): a two-breakpoint `gap` via CSS vars —
  // a base rule, plus one `@media (max-width: 991px)` override later in
  // source order, which used to win regardless of the active viewport.
  const style = document.createElement('style');
  style.textContent = `
    .row { gap: var(--bds-gap-xl); }
    @media (max-width: 991px) {
      .row { gap: var(--bds-gap-sm); }
    }
    @supports (display: grid) {
      .row { color: var(--bds-text-primary); }
    }
    @supports not (display: grid) {
      .row { color: var(--bds-text-secondary); }
    }
  `;
  document.head.appendChild(style);
  document.body.innerHTML = `<div id="t" class="row">x</div>`;

  await page.viewport(ORIGINAL_VIEWPORT.width, ORIGINAL_VIEWPORT.height);
});

afterAll(async () => {
  await page.viewport(ORIGINAL_VIEWPORT.width, ORIGINAL_VIEWPORT.height);
});

describe('getDeclaredValue — inactive @media rule no longer wins the cascade (#2589 AC1/AC2)', () => {
  it('reports the base-rule token at a wide viewport (override inactive)', async () => {
    await page.viewport(1200, 800); // >= 992px — @media (max-width: 991px) does NOT match
    const el = document.getElementById('t')!;
    const declared = getDeclaredValue(el, 'gap');
    expect(declared?.value.trim()).toBe('var(--bds-gap-xl)');
  });

  it('reports the override token at a narrow viewport (override active)', async () => {
    await page.viewport(800, 800); // < 992px — @media (max-width: 991px) matches
    const el = document.getElementById('t')!;
    const declared = getDeclaredValue(el, 'gap');
    expect(declared?.value.trim()).toBe('var(--bds-gap-sm)');
  });
});

describe('getDeclaredValue — @supports gates a candidate the same way (#2589 AC1)', () => {
  it('admits the supported branch and excludes the not-supported one', async () => {
    await page.viewport(1200, 800);
    const el = document.getElementById('t')!;
    const declared = getDeclaredValue(el, 'color');
    // This chromium supports `display: grid`, so only the first @supports
    // branch is a live candidate.
    expect(declared?.value.trim()).toBe('var(--bds-text-primary)');
  });
});

describe('@container rules are excluded from the candidate set entirely (#2589 AC3)', () => {
  it('a style rule nested under @container never becomes a candidate', async () => {
    await page.viewport(1200, 800);
    const style = document.createElement('style');
    style.textContent = `
      .box { padding: var(--bds-space-400); }
      @container (min-width: 1px) {
        .box { padding: var(--bds-space-600); }
      }
    `;
    document.head.appendChild(style);
    document.body.innerHTML = `<div id="c" class="box" style="container-type: inline-size;">x</div>`;

    const el = document.getElementById('c')!;
    const declared = getDeclaredValue(el, 'padding');
    // The @container override must never win — not even "correctly" by
    // accident — because this inspector cannot evaluate its condition.
    expect(declared?.value.trim()).toBe('var(--bds-space-400)');

    // Left attached rather than removed: buildRulesIndex invalidates its
    // cache purely on `document.styleSheets.length`, so an add-then-remove
    // cycle can land back on a count a later test's add-only step also hits,
    // serving that later test a stale index. Leaving every fixture's
    // stylesheet attached keeps the count monotonic for the rest of the file.
  });
});

describe('auditProp — scan mode reports no violation sourced from a non-matching conditional rule (#2589 AC5)', () => {
  it('a raw-value override hidden behind an inactive @media never surfaces as a violation', async () => {
    await page.viewport(1200, 800); // >= 992px — the hardcoded override below is inactive
    const style = document.createElement('style');
    style.textContent = `
      .audited { margin-top: var(--bds-space-400); }
      @media (max-width: 991px) {
        .audited { margin-top: 12px; }
      }
    `;
    document.head.appendChild(style);
    document.body.innerHTML = `<div id="a" class="audited">x</div>`;

    const el = document.getElementById('a')!;
    const result = auditProp(el, 'margin-top');
    expect(result?.declared).toBe('var(--bds-space-400)');
    expect(result?.isViolation).toBe(false);
  });
});
