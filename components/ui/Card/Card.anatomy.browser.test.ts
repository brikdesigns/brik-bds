import { afterEach, describe, expect, it } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Card, CardDescription } from './Card';

/**
 * Card flat anatomy API (ADR-038, post preset-union removal). Two contracts:
 *  1. Each `layout` renders its dedicated BEM block with the passed slots.
 *  2. The union defect that motivated ADR-038 does not recur: a Card given a
 *     `layout` renders its surface with content, never the empty-outlined-box
 *     the argless union used to fall through to.
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
  it('layout="row" renders the row block with title + overline', async () => {
    const el = await mount(h(Card as never, { layout: 'row', overline: 'Add-on', title: 'Web Design Retainer' }));
    expect(el.querySelector('.bds-card--row')).not.toBeNull();
    expect(el.querySelector('.bds-card__row-title')?.textContent).toBe('Web Design Retainer');
    expect(el.querySelector('.bds-card__row-overline')?.textContent).toBe('Add-on');
  });

  it('layout="stack" renders the stack surface with title + overline', async () => {
    const el = await mount(h(Card as never, { layout: 'stack', overline: 'Marketing', title: 'Service one' }));
    expect(el.querySelector('.bds-card--stack')).not.toBeNull();
    expect(el.querySelector('.bds-card__stack-title')?.textContent).toBe('Service one');
    const overline = el.querySelector('.bds-card__stack-overline');
    expect(overline?.textContent).toBe('Marketing');
    // Binds the emitted class to its CSS rule: the overline must anchor at its
    // natural width, not stretch in the column flex. Guards the class-name ↔
    // stylesheet rename (a `-tag`→`-overline` mismatch silently regressed this).
    expect(getComputedStyle(overline!).alignSelf).toBe('flex-start');
  });

  it('layout="stack"/"row" body copy resolves --text-primary via the parity rule', async () => {
    // Body arrives as `children`, so a `<CardDescription>` there carries
    // `.bds-card-description` (--text-secondary). The `.bds-card__{stack,row}-body >
    // .bds-card-description` parity rule re-asserts --text-primary; without it every
    // card-grid body line silently re-styles to the lighter secondary color.
    //
    // Sentinel token values rather than `dist/tokens.css`: that file is a build
    // artifact and is absent in CI, and an undefined custom property makes every
    // `var(--text-*)` invalid at computed-value time — the assertion would then
    // pass vacuously on a shared inherited fallback.
    const tokens = document.createElement('style');
    tokens.textContent = ':root{--text-primary:rgb(11,11,11);--text-secondary:rgb(99,99,99)}';
    document.head.appendChild(tokens);

    for (const layout of ['stack', 'row'] as const) {
      const el = await mount(
        h(Card as never, { layout, title: 'T', children: h(CardDescription, null, 'D') }),
      );
      const color = getComputedStyle(el.querySelector('.bds-card-description')!).color;
      expect(color).toBe('rgb(11, 11, 11)');
      await act(async () => { root.unmount(); });
      host.remove();
    }

    tokens.remove();
  });

  it('layout="metric" renders the metric surface with label + value (no numeric formatting)', async () => {
    const el = await mount(h(Card as never, { layout: 'metric', overline: 'Revenue', title: '$48,250' }));
    expect(el.querySelector('.bds-card--metric')).not.toBeNull();
    expect(el.querySelector('.bds-card__metric-label')?.textContent).toBe('Revenue');
    expect(el.querySelector('.bds-card__metric-value')?.textContent).toBe('$48,250');
  });

  it('layout="control" renders the control block with title', async () => {
    const el = await mount(h(Card as never, { layout: 'control', title: 'Notion', description: 'D' }));
    expect(el.querySelector('.bds-card--control')).not.toBeNull();
    expect(el.querySelector('.bds-card__control-title')?.textContent).toBe('Notion');
    expect(el.querySelector('.bds-card__control-description')?.textContent).toBe('D');
  });

  it('layout="metric" renders the media + detail slots (the ProductSummaryCard fold)', async () => {
    const el = await mount(h(Card as never, {
      layout: 'metric',
      media: h('span', { 'data-testid': 'glyph' }, '★'),
      overline: 'Interested in',
      title: 'Standard Logo Design',
      detail: '$650 • one time',
    }));
    expect(el.querySelector('.bds-card__metric-media')?.textContent).toBe('★');
    expect(el.querySelector('.bds-card__metric-detail')?.textContent).toBe('$650 • one time');
    // media/detail are additive — a plain metric still omits both.
    const plain = await mount(h(Card as never, { layout: 'metric', overline: 'X', title: '1' }));
    expect(plain.querySelector('.bds-card__metric-media')).toBeNull();
    expect(plain.querySelector('.bds-card__metric-detail')).toBeNull();
  });

  it('a layout Card never falls through to the empty default box', async () => {
    const el = await mount(h(Card as never, { layout: 'stack', title: 'Only a title' }));
    const rootEl = el.firstElementChild as HTMLElement;
    // The ADR-038 defect: an argless union Card rendered <div class="bds-card
    // bds-card--outlined bds-card--padding-md"></div> — empty. The stack layout
    // renders its surface WITH content instead.
    expect(rootEl.className).toContain('bds-card--stack');
    expect(rootEl.textContent).toContain('Only a title');
  });
});
