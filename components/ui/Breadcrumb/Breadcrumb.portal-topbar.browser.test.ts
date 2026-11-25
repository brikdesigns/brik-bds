import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Breadcrumb } from './Breadcrumb';
import figmaTokensCss from '../../../tokens/figma-tokens.css?raw';
import gapFillsCss from '../../../tokens/gap-fills.css?raw';

/**
 * Portal top-bar shape: three switcher crumbs (never fold), a long middle
 * label, and the nav a shrink-wrapped flex child of a `flex: 1 1 0; min-width: 0`
 * slot. A label must stay readable (never capped to 0 width) at every width.
 */

let host: HTMLDivElement;
let root: Root;
const h = React.createElement;

beforeAll(() => {
  const style = document.createElement('style');
  style.textContent = [figmaTokensCss, gapFillsCss].join('\n\n');
  document.head.appendChild(style);
});

afterEach(async () => {
  await act(async () => {
    root?.unmount();
  });
  host?.remove();
});

const options = [
  { label: 'One', href: '/1' },
  { label: 'Two', href: '/2' },
];
const switcher = { options, switchLabel: 'Switch' };
const items = [
  { label: 'Companies', href: '/c', switcher },
  { label: "Ollie Bali's Animal Shelter", href: '/c/o', switcher },
  { label: 'Services', switcher },
];

async function mount(width: number) {
  host = document.createElement('div');
  // The portal slot: flex row, the breadcrumb's wrapper is `flex: 1 1 0; min-width: 0`.
  host.style.cssText = `display:flex;width:${width}px`;
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root.render(
      h('div', { style: { flex: '1 1 0', minWidth: 0, display: 'flex' } }, h(Breadcrumb, { items })),
    );
  });
  // Let ResizeObserver + layout effects settle.
  await new Promise((r) => setTimeout(r, 300));
}

const labelsOf = (nav: Element) =>
  Array.from(nav.querySelectorAll<HTMLElement>('.bds-breadcrumb__link, .bds-breadcrumb__current')).filter(
    (el) => !el.closest('.bds-breadcrumb__measure'),
  );

describe('Breadcrumb in a shrink-wrapped flex slot', () => {
  it('never squeezes a label to nothing in a slot too narrow for the trail', async () => {
    await mount(120);
    const labels = labelsOf(host);
    expect(labels).toHaveLength(3);
    for (const el of labels) expect(el.getBoundingClientRect().width).toBeGreaterThanOrEqual(48);
  });

  it('shows every label in full when the slot widens after a narrow first measure', async () => {
    await mount(120);
    host.style.width = '1127px';
    await new Promise((r) => setTimeout(r, 300));
    const nav = host.querySelector('nav')!;
    // The slot, not the previously capped content, sets the nav's width.
    expect(nav.getBoundingClientRect().width).toBe(1127);
    for (const el of labelsOf(nav)) expect(el.scrollWidth).toBeLessThanOrEqual(el.clientWidth);
    expect(labelsOf(nav).map((el) => el.style.maxWidth)).toEqual(['', '', '']);
  });
});
