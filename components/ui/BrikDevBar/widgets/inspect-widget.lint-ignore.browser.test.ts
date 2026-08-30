/**
 * Regression test for the inspector↔lint violation-set baseline (brik-bds#2170).
 *
 * The token linter suppresses any source line carrying a `bds-lint-ignore`
 * marker; the marker is a CSS comment stripped from the runtime CSSOM the
 * inspector reads, so before this fix the inspector re-flagged every sanctioned
 * exception and its count could never reach zero on a clean tree. The BDS
 * manifest now carries the extracted { selector, property } exception set and
 * the inspector drops any violation whose declaring rule is listed. This test
 * pins that: a raw-value declaration flips from violation → not-violation once
 * its rule is in the exception set.
 *
 * Runs under the `components-browser` project (real chromium DOM) — the widget
 * reads live document.styleSheets, which jsdom does not populate.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import widgetSource from './inspect-widget.js?raw';

type Audit = { isViolation: boolean; hardcoded: string[]; lintIgnored: boolean } | null;
type Api = {
  auditProp: (el: Element, prop: string) => Audit;
  setLintIgnores: (list: Array<{ selector: string; property: string }>) => void;
  isLintIgnored: (selector: string, prop: string) => boolean;
  stylesheetsResolved: () => boolean;
};

let api: Api;

beforeAll(() => {
  history.replaceState(null, '', `${location.pathname}?inspect=1`);
  // eslint-disable-next-line no-eval
  (0, eval)(widgetSource);
  const exposed = (window as unknown as { BrikInspect?: Partial<Api> }).BrikInspect;
  if (!exposed?.auditProp || !exposed.setLintIgnores) {
    throw new Error('widget did not expose the #2170 test hooks');
  }
  api = exposed as Api;

  // A raw box-shadow — the AddressInput case: a value the linter passes via
  // bds-lint-ignore but the inspector would otherwise flag (no var(), so
  // hardcoded > 0 && tokens == 0). Authored before any audit call so the rules
  // index caches with it present.
  const style = document.createElement('style');
  style.textContent = `
    .bds-address-input__dropdown { box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.12); }
    .bds-other { box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.12); }
  `;
  document.head.appendChild(style);
});

describe('inspect widget — bds-lint-ignore parity (#2170)', () => {
  it('flags a raw value as a violation when it is NOT in the exception set', () => {
    api.setLintIgnores([]); // empty baseline
    document.body.innerHTML = `<div id="a" class="bds-address-input__dropdown">x</div>`;
    const audit = api.auditProp(document.getElementById('a')!, 'box-shadow');
    expect(audit?.hardcoded.length).toBeGreaterThan(0);
    expect(audit?.isViolation).toBe(true);
  });

  it('drops the violation once its rule is in the exception set', () => {
    api.setLintIgnores([
      { selector: '.bds-address-input__dropdown', property: 'box-shadow' },
    ]);
    document.body.innerHTML = `<div id="b" class="bds-address-input__dropdown">x</div>`;
    const audit = api.auditProp(document.getElementById('b')!, 'box-shadow');
    expect(audit?.lintIgnored).toBe(true);
    expect(audit?.isViolation).toBe(false);
  });

  it('suppresses only the listed selector, not a same-value sibling', () => {
    api.setLintIgnores([
      { selector: '.bds-address-input__dropdown', property: 'box-shadow' },
    ]);
    document.body.innerHTML = `<div id="c" class="bds-other">x</div>`;
    const audit = api.auditProp(document.getElementById('c')!, 'box-shadow');
    expect(audit?.isViolation).toBe(true);
  });

  it('matches selectors modulo combinator whitespace', () => {
    // Manifest stores `.a>.b`; a CSSOM origin of `.a > .b` must still match.
    api.setLintIgnores([{ selector: '.x>.y', property: 'color' }]);
    expect(api.isLintIgnored('.x > .y', 'color')).toBe(true);
    expect(api.isLintIgnored('.x .y', 'color')).toBe(false); // descendant ≠ child
  });

  it('reports the build as resolved in a fully-loaded test DOM', () => {
    // Sanity for the stale-build guard: with the document parsed and no pending
    // stylesheet links, auditProp is allowed to emit violations at all.
    expect(api.stylesheetsResolved()).toBe(true);
  });
});
