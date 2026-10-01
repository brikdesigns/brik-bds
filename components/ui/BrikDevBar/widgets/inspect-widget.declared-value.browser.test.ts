/**
 * Regression tests for getDeclaredValue / calcSpecificity (#2195).
 *
 * The inspector reports the *declared* (specified) value off the
 * highest-specificity matched rule. Three defects made the panel misreport it:
 *
 *  B — a `var()`-bearing shorthand (`border: 3px solid var(--x)`) is stored as
 *      a pending-substitution value, so the `border-color` longhand serialised
 *      to "" and the only rule that yielded a non-empty longhand was the
 *      Tailwind reset `*{ border: 0 solid }` → `currentcolor`.
 *  D — `calcSpecificity` scored `::before` as a class and `:not(.a.b)` as one
 *      unit, and the winner was chosen with a blind `>=` that ignored
 *      `!important`.
 *
 * Runs under the `components-browser` vitest project (real chromium) — pending
 * substitution and computed pseudo behaviour have no meaning in jsdom.
 */
import { beforeAll, describe, expect, it } from 'vitest';
// Raw source so we can execute the IIFE in the page's global scope.
import widgetSource from './inspect-widget.js?raw';

type Declared = { value: string; origin: string } | null;
let getDeclaredValue: (el: Element, prop: string) => Declared;
let calcSpecificity: (sel: string) => number;

beforeAll(() => {
  // The widget self-disables unless ?inspect=1 / data-auto-enable is present.
  history.replaceState(null, '', `${location.pathname}?inspect=1`);
  // eslint-disable-next-line no-eval
  (0, eval)(widgetSource);
  const api = (window as unknown as {
    BrikInspect?: {
      getDeclaredValue?: typeof getDeclaredValue;
      calcSpecificity?: typeof calcSpecificity;
    };
  }).BrikInspect;
  if (!api?.getDeclaredValue || !api?.calcSpecificity) {
    throw new Error('widget did not expose BrikInspect.getDeclaredValue / calcSpecificity');
  }
  getDeclaredValue = api.getDeclaredValue;
  calcSpecificity = api.calcSpecificity;

  // Fixture stylesheet. Each test appends nothing further, so this is the only
  // sheet; buildRulesIndex caches but re-builds when styleSheets.length changes.
  const style = document.createElement('style');
  style.textContent = `
    * { border: 0 solid; }
    .card { border: 3px solid var(--border-secondary); }
    #hi { color: rgb(1, 2, 3); }
    .lo { color: var(--text-primary) !important; }
  `;
  document.head.appendChild(style);
});

describe('getDeclaredValue — var()-shorthand longhand (#2195 B)', () => {
  it('reports the shorthand token for border-color, not the reset currentcolor', () => {
    // AC: `border: 3px solid var(--border-secondary)` under a `*{ border: 0 solid }`
    // reset → border-color row shows the token, not currentcolor.
    document.body.innerHTML = `<div id="t" class="card">x</div>`;
    const declared = getDeclaredValue(document.getElementById('t')!, 'border-color');
    expect(declared?.value).toContain('var(--border-secondary)');
    expect(declared?.value).not.toContain('currentcolor');
  });
});

describe('getDeclaredValue — !important beats higher specificity (#2195 D)', () => {
  it('an !important class rule wins over a non-important #id rule', () => {
    document.body.innerHTML = `<div id="hi" class="lo">y</div>`;
    const declared = getDeclaredValue(document.getElementById('hi')!, 'color');
    expect(declared?.value.trim()).toBe('var(--text-primary)');
  });
});

describe('calcSpecificity — per-spec scoring (#2195 D)', () => {
  it('counts a pseudo-element as an element, not a class', () => {
    // div::before → 0 ids, 0 classes, 2 elements = 2 (was mis-scored 101).
    expect(calcSpecificity('div::before')).toBe(2);
    // A single class must outrank a type + pseudo-element.
    expect(calcSpecificity('.foo')).toBeGreaterThan(calcSpecificity('div::before'));
  });

  it('counts :not() by its most specific argument', () => {
    // a:not(.b.c) → 1 element + 2 classes = 201.
    expect(calcSpecificity('a:not(.b.c)')).toBe(201);
    // :not() itself adds nothing beyond its args.
    expect(calcSpecificity(':not(.b)')).toBe(calcSpecificity('.b'));
  });

  it(':where() contributes zero specificity', () => {
    expect(calcSpecificity(':where(#a, .b) .c')).toBe(calcSpecificity('.c'));
  });
});
