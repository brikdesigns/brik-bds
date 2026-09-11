import { afterEach, describe, expect, it } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Card } from './Card';

/**
 * ADR-038 Phase 1 gate — the flat anatomy API (`layout`) ships alongside the
 * `preset` union with zero downstream breakage. These assert two contracts:
 *  1. Each `layout` renders the SAME BEM class chain as its matching `preset`
 *     (pixel parity → migration is a prop swap, not a re-style).
 *  2. The union defect that motivated ADR-038 does not recur on the new path:
 *     a Card given a `layout` never falls through to the empty-outlined-box
 *     default render.
 */

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

afterEach(async () => {
  await act(async () => {
    root?.unmount();
  });
  host?.remove();
});

const h = React.createElement;

describe('Card anatomy API (ADR-038)', () => {
  it('layout="row" emits the same class chain as preset="display-row"', async () => {
    const presetEl = await mount(h(Card as never, { preset: 'display-row', title: 'T', description: 'D' }));
    const presetClass = presetEl.querySelector('.bds-card--preset-display-row')?.className;
    await act(async () => { root.unmount(); });
    host.remove();

    const anatEl = await mount(h(Card as never, { layout: 'row', title: 'T', children: h('p', null, 'D') }));
    const anatClass = anatEl.querySelector('.bds-card--preset-display-row')?.className;

    expect(anatClass).toBeDefined();
    expect(anatClass).toBe(presetClass);
  });

  it('layout="stack" renders the display surface with title + overline', async () => {
    const el = await mount(h(Card as never, { layout: 'stack', overline: 'Marketing', title: 'Service one' }));
    expect(el.querySelector('.bds-card--preset-display')).not.toBeNull();
    expect(el.querySelector('.bds-card__preset-display-title')?.textContent).toBe('Service one');
    expect(el.querySelector('.bds-card__preset-display-tag')?.textContent).toBe('Marketing');
  });

  it('layout="metric" renders the summary surface with label + value', async () => {
    const el = await mount(h(Card as never, { layout: 'metric', overline: 'Revenue', title: '$48,250' }));
    expect(el.querySelector('.bds-card--preset-summary')).not.toBeNull();
    expect(el.querySelector('.bds-card__preset-summary-label')?.textContent).toBe('Revenue');
    expect(el.querySelector('.bds-card__preset-summary-value')?.textContent).toBe('$48,250');
  });

  it('layout="control" delegates to the control renderer (same class chain as preset="control")', async () => {
    const presetEl = await mount(h(Card as never, { preset: 'control', title: 'Notion', description: 'D' }));
    const presetClass = presetEl.querySelector('.bds-card--preset-control')?.className;
    await act(async () => { root.unmount(); });
    host.remove();

    const anatEl = await mount(h(Card as never, { layout: 'control', title: 'Notion', description: 'D' }));
    const anatClass = anatEl.querySelector('.bds-card--preset-control')?.className;

    expect(anatClass).toBeDefined();
    expect(anatClass).toBe(presetClass);
    expect(anatEl.querySelector('.bds-card__preset-control-title')?.textContent).toBe('Notion');
  });

  it('layout="metric" renders a raw action node in the link area (no summary numeric formatting)', async () => {
    const el = await mount(h(Card as never, { layout: 'metric', overline: 'Active users', title: '12,481' }));
    expect(el.querySelector('.bds-card__preset-summary-value')?.textContent).toBe('12,481');
  });

  it('layout="metric" renders the media + detail slots (the ProductSummaryCard fold, ADR-038 Phase 3)', async () => {
    const el = await mount(h(Card as never, {
      layout: 'metric',
      media: h('span', { 'data-testid': 'glyph' }, '★'),
      overline: 'Interested in',
      title: 'Standard Logo Design',
      detail: '$650 • one time',
    }));
    expect(el.querySelector('.bds-card__preset-summary-media')?.textContent).toBe('★');
    expect(el.querySelector('.bds-card__preset-summary-detail')?.textContent).toBe('$650 • one time');
    // media/detail are additive — a plain metric still omits both.
    const plain = await mount(h(Card as never, { layout: 'metric', overline: 'X', title: '1' }));
    expect(plain.querySelector('.bds-card__preset-summary-media')).toBeNull();
    expect(plain.querySelector('.bds-card__preset-summary-detail')).toBeNull();
  });

  it('a layout Card never falls through to the empty default box', async () => {
    const el = await mount(h(Card as never, { layout: 'stack', title: 'Only a title' }));
    const root = el.firstElementChild as HTMLElement;
    // The ADR-038 defect: an argless union Card rendered <div class="bds-card
    // bds-card--outlined bds-card--padding-md"></div> — empty. The layout path
    // must render the display surface with content instead.
    expect(root.className).toContain('bds-card--preset-display');
    expect(root.className).not.toContain('bds-card--outlined');
    expect(root.textContent).toContain('Only a title');
  });
});
