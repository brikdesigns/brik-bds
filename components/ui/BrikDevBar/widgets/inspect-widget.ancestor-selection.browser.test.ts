/**
 * Ancestor-selection regression tests for the BDS inspect widget (brik-bds#2196).
 *
 * Selection was leaf-only: `onMouseMove` / `onClick` used `e.target`, so a
 * wrapper the pointer can never resolve to — e.g. `.bds-frame--ratio-square`
 * around an `<img>` — was uninspectable (reported on staging brikdesigns
 * service cards). This adds a composedPath() ascent stack driven by the arrow
 * keys: ArrowUp climbs toward the root, ArrowDown descends toward the leaf
 * (operator-decided keybinding, 2026-08-30).
 *
 * The widget is a browser-only IIFE; we execute its source in a real chromium
 * DOM (jsdom cannot model composedPath() reliably) and drive real pointer /
 * keyboard events, asserting the live selection via `window.BrikInspect`.
 *
 * Runs under the `components-browser` vitest project (see vitest.config.ts).
 */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import widgetSource from './inspect-widget.js?raw';

interface Selection { el: Element | null; depth: number; pathLength: number; }
interface InspectApi {
  buildAscentPath: (target: Element, event?: Event) => Element[];
  getSelection: () => Selection;
  setActive: (next: boolean) => void;
  isActive: () => boolean;
}

let api: InspectApi;

beforeAll(() => {
  // The IIFE self-disables unless ?inspect=1 / data-auto-enable; flip the flag
  // so it registers its document listeners and activates on load.
  history.replaceState(null, '', `${location.pathname}?inspect=1`);
  try {
    // eslint-disable-next-line no-eval
    (0, eval)(widgetSource);
  } catch (err) {
    throw new Error(`widget IIFE threw on load: ${(err as Error).stack ?? String(err)}`);
  }
  api = (window as unknown as { BrikInspect?: InspectApi }).BrikInspect as InspectApi;
  if (!api?.buildAscentPath || !api?.getSelection) {
    throw new Error('widget did not expose BrikInspect.buildAscentPath / getSelection');
  }
});

// composedPath() only survives on a trusted-shaped event; dispatch with
// composed:true so shadow-crossing is exercised even in light DOM.
function fire(el: Element, type: string): void {
  el.dispatchEvent(new MouseEvent(type, { bubbles: true, composed: true, clientX: 5, clientY: 5 }));
}
function key(name: string): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
}

// Render into a dedicated host, NOT document.body — openPanel appends its panel
// to body once and reuses it, so wiping body between tests would detach it.
function frame(): { wrap: Element; leaf: Element } {
  let host = document.getElementById('fixture');
  if (!host) {
    host = document.createElement('div');
    host.id = 'fixture';
    document.body.appendChild(host);
  }
  host.innerHTML = `<div class="bds-frame--ratio-square" id="wrap"><img id="leaf" alt="card" /></div>`;
  return { wrap: document.getElementById('wrap')!, leaf: document.getElementById('leaf')! };
}

beforeEach(() => {
  // Clear any locked selection from a prior test, then re-arm.
  key('Escape');
  if (!api.isActive()) api.setActive(true);
});

describe('inspect widget — ancestor selection (#2196)', () => {
  it('builds a leaf→root chain, Element-only, stopping at <body>', () => {
    const { wrap, leaf } = frame();
    const path = api.buildAscentPath(leaf);
    expect(path[0]).toBe(leaf);
    expect(path).toContain(wrap);
    expect(path[path.length - 1]).toBe(document.body);
    expect(path.every((n) => n.nodeType === 1)).toBe(true);
  });

  it('hovering the image selects the leaf at depth 0', () => {
    const { leaf } = frame();
    fire(leaf, 'mousemove');
    const sel = api.getSelection();
    expect(sel.el).toBe(leaf);
    expect(sel.depth).toBe(0);
    expect(sel.pathLength).toBeGreaterThan(1);
  });

  it('ArrowUp ascends the hover selection to the .bds-frame wrapper', () => {
    const { wrap, leaf } = frame();
    fire(leaf, 'mousemove');
    key('ArrowUp');
    const sel = api.getSelection();
    expect(sel.el).toBe(wrap); // the wrapper the pointer can never resolve to
    expect(sel.depth).toBe(1);
  });

  it('ArrowDown descends back toward the leaf and clamps at depth 0', () => {
    const { leaf } = frame();
    fire(leaf, 'mousemove');
    key('ArrowUp');
    key('ArrowDown');
    expect(api.getSelection().el).toBe(leaf);
    key('ArrowDown'); // already at the leaf — stays put
    expect(api.getSelection().depth).toBe(0);
  });

  it('ArrowUp clamps at the root — never walks past <body>', () => {
    const { leaf } = frame();
    fire(leaf, 'mousemove');
    for (let i = 0; i < 10; i++) key('ArrowUp');
    const sel = api.getSelection();
    expect(sel.el).toBe(document.body);
    expect(sel.depth).toBe(sel.pathLength - 1);
  });

  it('clicking after ascending locks the wrapper, not the pointer leaf', () => {
    const { wrap, leaf } = frame();
    fire(leaf, 'mousemove');
    key('ArrowUp');       // ascend hover to the wrapper
    fire(leaf, 'click');  // pointer is still over the leaf
    expect(api.getSelection().el).toBe(wrap);
  });

  it('ArrowUp re-targets a locked selection and surfaces depth in the panel', () => {
    const { wrap, leaf } = frame();
    fire(leaf, 'click'); // lock the leaf
    expect(api.getSelection().el).toBe(leaf);
    key('ArrowUp');      // ascend the locked selection
    expect(api.getSelection().el).toBe(wrap);
    const panel = document.querySelector('.bi-panel');
    expect(panel?.textContent).toContain('depth 2/');            // discoverable
    expect(panel?.querySelector('.bi-panel__title')?.textContent).toContain('bds-frame--ratio-square');
  });
});
