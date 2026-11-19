import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import '../../../tokens/figma-tokens.css';
import '../../../tokens/gap-fills.css';
import { Menu, type MenuItemData } from '../Menu/Menu';
import { Sheet } from '../Sheet/Sheet';
import { FilterButton } from '../FilterButton/FilterButton';
import { CommentComposer } from '../CommentComposer/CommentComposer';
import { FieldGrid } from '../FieldGrid/FieldGrid';
import { AddressInput } from '../AddressInput/AddressInput';
import { AddableTagList } from '../AddableTagList/AddableTagList';
import { AddableEntryList } from '../AddableEntryList/AddableEntryList';

/**
 * useFloatingPanel (brik-bds#3258): Menu, FilterButton and the CommentComposer
 * mention list are `position: absolute` panels inside their trigger's wrapper.
 * Inside a Sheet (`overflow: hidden` / `overflow-y: auto`) they were clipped
 * below the fold, and nothing flipped them. These tests drive the real
 * components in a real layout engine: the hook's whole job is geometry, which
 * a source-text check or a jsdom run cannot observe.
 *
 * Design tokens are real (`tokens/*.css` are committed; `dist/` is not) so row
 * heights and paddings are the shipped ones.
 */

const h = React.createElement;

// React's act() needs this flag in a browser test, or every act() warns.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ORIGINAL_VIEWPORT = { width: window.innerWidth, height: window.innerHeight };

let host: HTMLDivElement;
let root: Root;

async function mount(el: React.ReactElement) {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root.render(el);
  });
  return host;
}

async function render(el: React.ReactElement) {
  await act(async () => {
    root.render(el);
  });
}

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/** Let autoUpdate / computePosition (async) and the entrance animation finish. */
async function settle() {
  await act(async () => {
    for (let i = 0; i < 4; i++) await frame();
  });
  for (const animation of document.getAnimations()) {
    try {
      animation.finish();
    } catch {
      // an infinite animation (spinner) has no end to jump to
    }
  }
  await act(async () => {
    await frame();
    await frame();
  });
}

beforeEach(async () => {
  await page.viewport(ORIGINAL_VIEWPORT.width, ORIGINAL_VIEWPORT.height);
});

afterEach(async () => {
  await act(async () => {
    root?.unmount();
  });
  host?.remove();
  await page.viewport(ORIGINAL_VIEWPORT.width, ORIGINAL_VIEWPORT.height);
});

const rectOf = (el: Element) => el.getBoundingClientRect();

function expectInsideViewport(rect: DOMRect) {
  expect(rect.top).toBeGreaterThanOrEqual(-0.5);
  expect(rect.left).toBeGreaterThanOrEqual(-0.5);
  expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight + 0.5);
  expect(rect.right).toBeLessThanOrEqual(window.innerWidth + 0.5);
}

function expectPaintedOnTop(panel: HTMLElement) {
  const r = rectOf(panel);
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  expect(hit).not.toBeNull();
  expect(panel.contains(hit)).toBe(true);
}

const items: MenuItemData[] = Array.from({ length: 6 }, (_, i) => ({ id: `i${i}`, label: `Item ${i}` }));

function menuTree(
  open: boolean,
  opts: { items?: MenuItemData[]; menuStyle?: React.CSSProperties; wrapStyle?: React.CSSProperties } = {},
) {
  return h(
    'div',
    { className: 'wrap', style: { position: 'relative', display: 'inline-block', ...opts.wrapStyle } },
    h('button', { type: 'button', style: { display: 'block', height: 32, width: '100%' } }, 'Trigger'),
    h(Menu, { isOpen: open, onClose: () => {}, items: opts.items ?? items, style: opts.menuStyle }),
  );
}

/** Slide `target` down (via the spacer above it) until it sits `gap` above the sheet body's bottom edge. */
function pinToBottom(target: Element, spacer: HTMLElement, gap: number) {
  const body = document.querySelector('.bds-sheet__body')!;
  const delta = rectOf(body).bottom - gap - rectOf(target).bottom;
  spacer.style.height = `${spacer.offsetHeight + delta}px`;
}

const spacerEl = () => h('div', { 'data-spacer': '', style: { height: 0 } });

function sheetOf(...children: React.ReactNode[]) {
  return h(Sheet, { isOpen: true, onClose: () => {}, title: 'Sheet' }, ...children);
}

describe('useFloatingPanel (#3258)', () => {
  it('a) Menu opened near the bottom of a Sheet flips up, stays in the viewport and is not clipped', async () => {
    await mount(sheetOf(spacerEl(), menuTree(false)));
    pinToBottom(document.querySelector('.wrap')!, document.querySelector<HTMLElement>('[data-spacer]')!, 24);
    await render(sheetOf(spacerEl(), menuTree(true)));
    await settle();

    const panel = document.querySelector<HTMLElement>('.bds-menu')!;
    const wrap = document.querySelector('.wrap')!;
    expectInsideViewport(rectOf(panel));
    expectPaintedOnTop(panel);
    expect(rectOf(panel).bottom).toBeLessThanOrEqual(rectOf(wrap).top + 1);
    // Focusing the first item must not scroll the sheet body: the panel left the
    // scroll container's flow in the same frame it opened.
    expect(document.querySelector('.bds-sheet__body')!.scrollTop).toBe(0);
  });

  it('b) CommentComposer mention list near the bottom of a Sheet flips up, stays in the viewport and is not clipped', async () => {
    const mentions = Array.from({ length: 5 }, (_, i) => ({
      id: `m${i}`,
      label: `agent${i}`,
      description: `Agent number ${i}`,
    }));
    const composer = () => h(CommentComposer, { onSubmit: () => {}, mentions });
    await mount(sheetOf(spacerEl(), composer()));
    pinToBottom(document.querySelector('.bds-comment-composer')!, document.querySelector<HTMLElement>('[data-spacer]')!, 8);

    const textarea = document.querySelector('textarea')!;
    await act(async () => {
      textarea.focus();
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(textarea, '@');
      textarea.setSelectionRange(1, 1);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await settle();

    const panel = document.querySelector<HTMLElement>('.bds-comment-composer__list')!;
    const field = document.querySelector('.bds-comment-composer__field')!;
    expect(panel).not.toBeNull();
    expectInsideViewport(rectOf(panel));
    expectPaintedOnTop(panel);
    expect(rectOf(panel).bottom).toBeLessThanOrEqual(rectOf(field).top + 1);
    // stretch: the list spans the field, as `inset-inline: 0` laid it out
    expect(rectOf(panel).width).toBeCloseTo(rectOf(field).width, 0);
  });

  it('c) a 40-option FilterButton near the bottom of the viewport scrolls inside the viewport', async () => {
    const options = Array.from({ length: 40 }, (_, i) => ({ id: `c${i}`, label: `Client ${i}` }));
    await mount(
      h(
        'div',
        { style: { marginTop: window.innerHeight - 90 } },
        h(FilterButton, { label: 'Client', options }),
      ),
    );
    await act(async () => {
      document.querySelector<HTMLElement>('.bds-filter-button__trigger')!.click();
    });
    await settle();

    const panel = document.querySelector<HTMLElement>('.bds-filter-button__dropdown')!;
    expect(rectOf(panel).bottom).toBeLessThanOrEqual(window.innerHeight + 0.5);
    expect(rectOf(panel).top).toBeGreaterThanOrEqual(-0.5);
    expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight);
    expectPaintedOnTop(panel);
  });

  it('d) a Menu inside a FieldGrid container (containing-block positive control) lands under its trigger', async () => {
    // `container-type: inline-size` makes the FieldGrid root a containing block
    // for `position: fixed` descendants in Chrome. Floating UI's own
    // `isContainingBlock` does not check `containerType`, so this is the case
    // that would drift by the container's offset if the hook trusted it.
    const grid = h(
      FieldGrid,
      { columns: 3 },
      menuTree(true, { menuStyle: { marginTop: 6 }, wrapStyle: { width: 120 } }),
    );
    await mount(h('div', { style: { margin: '90px 0 0 60px', width: 360 } }, grid));
    await settle();

    const root = document.querySelector('.bds-field-grid')!;
    expect(getComputedStyle(root).containerType).toBe('inline-size');

    // Premise, with a control that can say otherwise: a fixed box at top-left
    // lands on the viewport corner inside the FieldGrid container, and off it
    // inside a real containing block (`contain: layout`).
    const probe = (parent: Element) => {
      const el = document.createElement('div');
      el.style.cssText = 'position:fixed;top:0;left:0;width:4px;height:4px';
      parent.appendChild(el);
      const { top, left } = rectOf(el);
      el.remove();
      return { top, left };
    };
    const contained = document.createElement('div');
    contained.style.cssText = 'contain:layout;margin:50px 0 0 30px;height:10px';
    host.appendChild(contained);
    expect(probe(contained).top).toBeGreaterThan(0);
    contained.remove();
    expect(probe(root)).toEqual({ top: 0, left: 0 });

    const panel = document.querySelector<HTMLElement>('.bds-menu')!;
    const wrap = document.querySelector('.wrap')!;
    expect(rectOf(panel).top).toBeGreaterThan(rectOf(wrap).bottom);
    expect(Math.abs(rectOf(panel).top - (rectOf(wrap).bottom + 6))).toBeLessThanOrEqual(2);
    expect(Math.abs(rectOf(panel).left - rectOf(wrap).left)).toBeLessThanOrEqual(2);
  });

  it('e) a consumer end-aligned Menu keeps its right edge on the wrapper', async () => {
    await mount(
      h(
        'div',
        { style: { margin: '60px 0 0 220px' } },
        menuTree(true, { menuStyle: { left: 'auto', right: 0 }, wrapStyle: { width: 100 } }),
      ),
    );
    await settle();

    const panel = document.querySelector<HTMLElement>('.bds-menu')!;
    const wrap = document.querySelector('.wrap')!;
    expect(Math.abs(rectOf(panel).right - rectOf(wrap).right)).toBeLessThanOrEqual(1.5);
    expect(rectOf(panel).top).toBeGreaterThanOrEqual(rectOf(wrap).bottom - 1);
  });

  it('e) the client-switcher shape (top:auto, bottom:100%, left/right 0, own cap) opens up at the wrapper width', async () => {
    const many = Array.from({ length: 24 }, (_, i) => ({ id: `s${i}`, label: `Client ${i}` }));
    await mount(
      h(
        'div',
        { style: { margin: '520px 0 0 40px' } },
        menuTree(true, {
          items: many,
          wrapStyle: { width: 240 },
          menuStyle: { top: 'auto', bottom: '100%', left: 0, right: 0, maxHeight: 300 },
        }),
      ),
    );
    await settle();

    const panel = document.querySelector<HTMLElement>('.bds-menu')!;
    const wrap = document.querySelector('.wrap')!;
    expect(Math.abs(rectOf(panel).width - rectOf(wrap).width)).toBeLessThanOrEqual(1);
    expect(Math.abs(rectOf(panel).left - rectOf(wrap).left)).toBeLessThanOrEqual(1);
    expect(rectOf(panel).bottom).toBeLessThanOrEqual(rectOf(wrap).top + 1);
    // The consumer's cap is a content-box max-height here (no page-level
    // `box-sizing` reset in this test), so the panel is cap + padding + border.
    const style = getComputedStyle(panel);
    const extras =
      style.boxSizing === 'border-box'
        ? 0
        : parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    expect(rectOf(panel).height).toBeLessThanOrEqual(300 + extras + 0.5);
    expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight);
  });

  it('f) with no room on either side the panel keeps three rows and stays in the viewport', async () => {
    await page.viewport(ORIGINAL_VIEWPORT.width, 280);
    const many = Array.from({ length: 12 }, (_, i) => ({ id: `f${i}`, label: `Item ${i}` }));
    await mount(
      h('div', { style: { marginTop: (window.innerHeight - 32) / 2 - 8 } }, menuTree(true, { items: many })),
    );
    await settle();

    const panel = document.querySelector<HTMLElement>('.bds-menu')!;
    const rows = panel.querySelectorAll<HTMLElement>('[role="menuitem"]');
    const panelRect = rectOf(panel);
    const style = getComputedStyle(panel);
    const threeRows =
      rectOf(rows[2]).bottom - panelRect.top + panel.scrollTop + parseFloat(style.paddingBottom) + parseFloat(style.borderBottomWidth);

    // The panel must settle: a flip/size loop would keep resizing it every frame.
    await act(async () => {
      for (let i = 0; i < 6; i++) await frame();
    });
    expect(rectOf(panel).top).toBe(panelRect.top);
    expect(rectOf(panel).height).toBe(panelRect.height);

    expectInsideViewport(panelRect);
    // Clamped: shorter than its content, longer than or equal to three rows.
    expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight);
    expect(panelRect.height).toBeGreaterThanOrEqual(threeRows - 1);
    expect(rectOf(rows[2]).bottom).toBeLessThanOrEqual(panelRect.bottom + 0.5);
  });
});

describe('useFloatingPanel on the address and addable-list dropdowns (#3260)', () => {
  const options = Array.from({ length: 8 }, (_, i) => `Option ${i}`);

  async function typeInto(input: HTMLInputElement, value: string) {
    await act(async () => {
      input.focus();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  async function clickButton(text: string) {
    const button = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === text)!;
    await act(async () => {
      button.click();
    });
  }

  /** Pin `anchor` 8px above the sheet body's bottom edge, then check the panel flipped up and fits. */
  async function expectFlippedUp(panelSelector: string, anchorSelector: string) {
    await settle();
    const panel = document.querySelector<HTMLElement>(panelSelector)!;
    const anchor = document.querySelector(anchorSelector)!;
    expect(panel).not.toBeNull();
    expectInsideViewport(rectOf(panel));
    expectPaintedOnTop(panel);
    expect(rectOf(panel).bottom).toBeLessThanOrEqual(rectOf(anchor).top + 1);
  }

  it('AddressInput suggestions near the bottom of a Sheet flip up and stay in the viewport', async () => {
    const suggestions = options.map((label, id) => ({ id: String(id), label }));
    await mount(sheetOf(spacerEl(), h(AddressInput, { suggestions, label: 'Address' })));
    pinToBottom(document.querySelector('.bds-address-input__field')!, document.querySelector<HTMLElement>('[data-spacer]')!, 8);
    await act(async () => {
      document.querySelector('input')!.focus();
    });
    await expectFlippedUp('.bds-address-input__dropdown', '.bds-address-input__field');
  });

  it('AddableTagList suggestions near the bottom of a Sheet flip up and stay in the viewport', async () => {
    await mount(
      sheetOf(spacerEl(), h(AddableTagList, { values: [], onChange: () => {}, suggestions: options, addLabel: 'Add tag' })),
    );
    await clickButton('Add tag');
    pinToBottom(document.querySelector('input')!, document.querySelector<HTMLElement>('[data-spacer]')!, 8);
    await typeInto(document.querySelector('input')!, 'Option');
    await expectFlippedUp('.bds-addable-tag-list__dropdown', 'input');
  });

  it('AddableEntryList suggestions near the bottom of a Sheet flip up and stay in the viewport', async () => {
    await mount(
      sheetOf(
        spacerEl(),
        h(AddableEntryList, { entries: [], onChange: () => {}, primarySuggestions: options, addLabel: 'Add entry' }),
      ),
    );
    await clickButton('Add entry');
    pinToBottom(document.querySelector('input')!, document.querySelector<HTMLElement>('[data-spacer]')!, 8);
    await typeInto(document.querySelector('input')!, 'Option');
    await expectFlippedUp('.bds-addable-entry-list__dropdown', 'input');
  });
});
