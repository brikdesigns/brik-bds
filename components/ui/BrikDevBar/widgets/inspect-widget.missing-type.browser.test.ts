/**
 * Regression test for the computed-value missing-type gate (brik-bds#2119).
 *
 * `scripts/lint-tokens.js` and the inspector's `auditProp` both flag a raw
 * value that IS present in source; neither can flag a declaration that is
 * ABSENT. The root case (Collapsible, #2118) revealed content that inherited
 * the browser's UA serif because no ancestor ever set a token font-family —
 * invisible to both existing detectors. `auditMissingType` closes that gap by
 * reading COMPUTED `font-family` after the whole cascade has run and
 * comparing it against the token families resolved live off `:root`, so it
 * cannot false-positive on legitimate inheritance (a leaf inheriting a good
 * token family from a tokenized ancestor still computes to a token value).
 *
 * Reuses the #2170 baseline rather than a third parallel one: gated behind
 * the same `auditReady()` (stylesheets resolved + lint-ignore index loaded)
 * and the same `isLintIgnored`/`setLintIgnores` exception set.
 *
 * Runs under the `components-browser` project (real chromium DOM) — the
 * widget reads live `document.styleSheets` and `getComputedStyle`, which
 * jsdom does not populate.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import widgetSource from './inspect-widget.js?raw';

type MissingTypeAudit = {
  prop: string;
  computed: string;
  isViolation: boolean;
} | null;
type Api = {
  auditMissingType: (el: Element) => MissingTypeAudit;
  setLintIgnores: (list: Array<{ selector: string; property: string }>) => void;
  stylesheetsResolved: () => boolean;
};

let api: Api;

beforeAll(() => {
  history.replaceState(null, '', `${location.pathname}?inspect=1`);
  // eslint-disable-next-line no-eval
  (0, eval)(widgetSource);
  const exposed = (window as unknown as { BrikInspect?: Partial<Api> }).BrikInspect;
  if (!exposed?.auditMissingType || !exposed.setLintIgnores) {
    throw new Error('widget did not expose the #2119 test hooks');
  }
  api = exposed as Api;

  // A real BDS token stack, set on :root — mirrors tokens/figma-tokens.css
  // closely enough for the gate's runtime resolution to have something real
  // to compare against. Authored before any audit call so :root computed
  // style already reflects it.
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --font-family-body: Poppins;
      --font-family-heading: Poppins;
      --font-family-label: Poppins;
      --body-md: 16px;
    }
    .bds-tokenized-ancestor { font-family: var(--font-family-body); }
    .bds-untokenized-leaf { margin-top: 4px; } /* the Collapsible-shape bug: no font-family anywhere */
    .bds-wrapper { display: flex; }
  `;
  document.head.appendChild(style);
});

describe('inspect widget — missing-type gate (#2119)', () => {
  it('flags a text leaf with no font declaration anywhere in its ancestry', () => {
    api.setLintIgnores([]); // empty baseline
    document.body.innerHTML = `<p id="a" class="bds-untokenized-leaf">Some copy</p>`;
    const audit = api.auditMissingType(document.getElementById('a')!);
    expect(audit).not.toBeNull();
    expect(audit?.prop).toBe('font-family');
    expect(audit?.isViolation).toBe(true);
  });

  it('does NOT flag a text leaf inheriting a token family from an ancestor', () => {
    api.setLintIgnores([]);
    document.body.innerHTML = `
      <div id="ancestor" class="bds-tokenized-ancestor">
        <p id="b">Some copy</p>
      </div>
    `;
    const audit = api.auditMissingType(document.getElementById('b')!);
    expect(audit?.isViolation).toBe(false);
  });

  it('drops a violation once its selector is in the exception set (shared #2170 baseline)', () => {
    api.setLintIgnores([
      { selector: '.bds-collapsible-card__content', property: 'font-family' },
    ]);
    document.body.innerHTML = `<p id="c" class="bds-collapsible-card__content">Revealed content</p>`;
    const audit = api.auditMissingType(document.getElementById('c')!);
    expect(audit?.isViolation).toBe(false);
  });

  it('is not a text leaf when the element holds only element children (pure layout wrapper)', () => {
    document.body.innerHTML = `
      <div id="d" class="bds-wrapper"><span>label</span><span>value</span></div>
    `;
    const audit = api.auditMissingType(document.getElementById('d')!);
    expect(audit).toBeNull();
  });

  it('is withheld when the build is not ready (auditReady false — no lint-ignore baseline loaded)', () => {
    // A widget instance that has never called setLintIgnores has a null
    // baseline (auditReady() false) rather than an armed empty one. Re-eval
    // the source into a fresh IIFE closure to get an unset baseline —
    // `setLintIgnores([])` in the tests above already armed the shared
    // instance, so this test needs its own.
    history.replaceState(null, '', `${location.pathname}?inspect=1`);
    // eslint-disable-next-line no-eval
    (0, eval)(widgetSource);
    // Re-eval reassigns window.BrikInspect on the same window — the fresh
    // closure's lintIgnoreIndex starts null until setLintIgnores runs.
    const fresh = (window as unknown as { BrikInspect?: Partial<Api> }).BrikInspect as Api;
    document.body.innerHTML = `<p id="e" class="bds-untokenized-leaf">Some copy</p>`;
    const audit = fresh.auditMissingType(document.getElementById('e')!);
    expect(fresh.stylesheetsResolved()).toBe(true); // sanity: it's the ready-flag, not the DOM, withholding
    expect(audit?.isViolation).toBe(false);
  });
});
