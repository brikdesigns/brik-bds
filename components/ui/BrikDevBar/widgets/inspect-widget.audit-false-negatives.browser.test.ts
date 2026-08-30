/**
 * Regression tests for three inspector audit false-negatives (#2197).
 *
 *  E — hasAccessibleName treated a populated <select>/<textarea>'s textContent
 *      as its accessible name, so an unlabelled control always reported "named".
 *  F — effectiveBackground looped `while (node !== documentElement)`, never read
 *      <html>'s own background, and measured contrast against the white fallback
 *      on html-background (dark) themes.
 *  G — auditProp's isViolation required `tokens.length === 0`, so any var() in
 *      the same shorthand suppressed a co-present hardcoded fragment.
 *
 * Runs under the `components-browser` project (real chromium) — getComputedStyle
 * and live document.styleSheets are not faithfully modelled in jsdom.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import widgetSource from './inspect-widget.js?raw';

type Audit = { isViolation: boolean; hardcoded: string[]; tokens: string[] } | null;
type Rgb = { r: number; g: number; b: number; a: number };
type Api = {
  hasAccessibleName: (el: Element) => boolean;
  effectiveBackground: (el: Element) => Rgb;
  auditProp: (el: Element, prop: string) => Audit;
  setLintIgnores: (list: Array<{ selector: string; property: string }>) => void;
};

let api: Api;

beforeAll(() => {
  history.replaceState(null, '', `${location.pathname}?inspect=1`);
  // eslint-disable-next-line no-eval
  (0, eval)(widgetSource);
  const exposed = (window as unknown as { BrikInspect?: Partial<Api> }).BrikInspect;
  if (!exposed?.hasAccessibleName || !exposed.effectiveBackground || !exposed.auditProp || !exposed.setLintIgnores) {
    throw new Error('widget did not expose the #2197 test hooks');
  }
  api = exposed as Api;

  // Authored before any audit call so the rules index caches with it present.
  const style = document.createElement('style');
  style.textContent = `
    .co-present { border: 2px solid var(--border-primary); }
  `;
  document.head.appendChild(style);
});

describe('hasAccessibleName — form-control textContent is not a name (#2197 E)', () => {
  it('flags an unlabelled <select> with <option> children as unnamed', () => {
    document.body.innerHTML = `<select id="s"><option>Pick one</option></select>`;
    expect(api.hasAccessibleName(document.getElementById('s')!)).toBe(false);
  });

  it('still names a <button> by its textContent', () => {
    document.body.innerHTML = `<button id="b">Save</button>`;
    expect(api.hasAccessibleName(document.getElementById('b')!)).toBe(true);
  });

  it('names a <select> wrapped in a <label>', () => {
    document.body.innerHTML = `<label>Country <select id="s2"><option>US</option></select></label>`;
    expect(api.hasAccessibleName(document.getElementById('s2')!)).toBe(true);
  });
});

describe('effectiveBackground — reads <html> own background (#2197 F)', () => {
  it('returns the documentElement background on an html-background theme', () => {
    const prevHtml = document.documentElement.style.backgroundColor;
    const prevBody = document.body.style.backgroundColor;
    document.documentElement.style.backgroundColor = 'rgb(17, 17, 17)';
    document.body.style.backgroundColor = 'transparent';
    document.body.innerHTML = `<div id="bg">x</div>`;
    try {
      const bg = api.effectiveBackground(document.getElementById('bg')!);
      expect(bg).toMatchObject({ r: 17, g: 17, b: 17 });
    } finally {
      document.documentElement.style.backgroundColor = prevHtml;
      document.body.style.backgroundColor = prevBody;
    }
  });
});

describe('auditProp — hardcoded co-present with a token still flags (#2197 G)', () => {
  it('flags the raw 2px in `2px solid var(--border-primary)`', () => {
    api.setLintIgnores([]); // empty exception baseline → auditReady()
    document.body.innerHTML = `<div id="c" class="co-present">x</div>`;
    const audit = api.auditProp(document.getElementById('c')!, 'border');
    expect(audit?.hardcoded).toContain('2px');
    expect(audit?.tokens.length).toBeGreaterThan(0);
    expect(audit?.isViolation).toBe(true);
  });
});
