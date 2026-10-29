import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import '../../../tokens/figma-tokens.css';
import '../../../tokens/gap-fills.css';
import { PageHeader, type PageHeaderProps } from './PageHeader';

/**
 * `condenseOnScroll` — real layout, real scrolling, real IntersectionObserver.
 * The claim worth asserting is the one that is easy to get wrong: condensing
 * SHRINKS the header (and shifts the content below it), and that shift must not
 * itself flip the state back. Runs under the `components-browser` project.
 */

let host: HTMLDivElement | null = null;
let root: Root | null = null;

const SPACER = 100;

async function mount(props: Partial<PageHeaderProps>, opts: { pinTop?: number; bodyHeight?: number } = {}) {
  host = document.createElement('div');
  host.setAttribute('data-testid', 'scroller');
  host.style.cssText = `height:300px;width:600px;overflow-y:auto;position:relative;--bds-pageheader-top:${opts.pinTop ?? 0}px;`;
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root!.render(
      React.createElement(
        React.Fragment,
        null,
        React.createElement('div', { style: { height: SPACER } }, 'above the header'),
        React.createElement(PageHeader, {
          title: 'Companies',
          subtitle: 'Every lead, prospect and client.',
          breadcrumbs: React.createElement('nav', { 'data-testid': 'crumbs' }, 'Home / Companies'),
          metadata: [{ label: 'Total', value: '42' }],
          tabs: React.createElement('div', { 'data-testid': 'tabs' }, 'tabs'),
          sticky: true,
          ...props,
        }),
        React.createElement('div', { style: { height: opts.bodyHeight ?? 2000 } }, 'body'),
      ),
    );
  });
  await settle();
  return host;
}

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 120));

async function scrollTo(el: HTMLElement, top: number) {
  el.scrollTop = top;
  await settle();
}

const headerOf = (h: HTMLElement) => h.querySelector('.bds-page-header') as HTMLElement;

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  host?.remove();
  root = null;
  host = null;
});

describe('PageHeader condenseOnScroll', () => {
  it('is inert by default: no data-condensed, no sentinel, no breadcrumb wrapper', async () => {
    const h = await mount({});
    expect(headerOf(h).hasAttribute('data-condensed')).toBe(false);
    expect(h.querySelector('.bds-page-header__condense-sentinel')).toBeNull();
    expect(h.querySelector('.bds-page-header__breadcrumbs')).toBeNull();
    await scrollTo(h, 800);
    expect(headerOf(h).hasAttribute('data-condensed')).toBe(false);
  });

  it('does nothing without `sticky` — a header that scrolls away has nothing to condense', async () => {
    const h = await mount({ condenseOnScroll: true, sticky: false });
    expect(headerOf(h).hasAttribute('data-condensed')).toBe(false);
  });

  it('starts expanded, holds full size inside the band, and condenses a header-height past the pin', async () => {
    const h = await mount({ condenseOnScroll: true });
    const header = headerOf(h);
    expect(header.getAttribute('data-condensed')).toBe('false');
    const full = header.getBoundingClientRect().height;

    // Pinned, but less than one header height past the pin: still full size, and
    // it never flickered to condensed on the way (a condense here would shrink the
    // header, shift the content, and let scroll anchoring undo it).
    const flips: string[] = [];
    new MutationObserver(() => flips.push(header.getAttribute('data-condensed') ?? '')).observe(header, {
      attributes: true,
      attributeFilter: ['data-condensed'],
    });
    await scrollTo(h, SPACER + 20);
    expect(flips).toEqual([]);
    expect(h.scrollTop).toBe(SPACER + 20);
    expect(header.getAttribute('data-condensed')).toBe('false');
    expect(header.getBoundingClientRect().height).toBe(full);

    await scrollTo(h, SPACER + full + 30);
    expect(header.getAttribute('data-condensed')).toBe('true');
    expect(header.getBoundingClientRect().height).toBeLessThan(full);
  });

  it('hides breadcrumbs, subtitle and metadata; keeps title, tabs and actions', async () => {
    const h = await mount({ condenseOnScroll: true, actions: React.createElement('button', null, 'Go') });
    await scrollTo(h, SPACER + headerOf(h).getBoundingClientRect().height + 30);
    expect(headerOf(h).getAttribute('data-condensed')).toBe('true');
    const shown = (sel: string) => getComputedStyle(h.querySelector(sel) as HTMLElement).display !== 'none';
    expect(shown('.bds-page-header__breadcrumbs')).toBe(false);
    expect(shown('.bds-page-header__subtitle')).toBe(false);
    expect(shown('.bds-page-header__metadata')).toBe(false);
    expect(shown('.bds-page-header__title')).toBe(true);
    expect(shown('.bds-page-header__tabs')).toBe(true);
    expect(shown('.bds-page-header__actions')).toBe(true);
  });

  it('steps the title down two steps on the heading scale: xl -> md', async () => {
    const h = await mount({ condenseOnScroll: true });
    const title = h.querySelector('.bds-page-header__title') as HTMLElement;
    const sizeOf = (token: string) => {
      const probe = document.createElement('span');
      probe.style.fontSize = `var(${token})`;
      h.appendChild(probe);
      const px = parseFloat(getComputedStyle(probe).fontSize);
      probe.remove();
      return px;
    };
    expect(parseFloat(getComputedStyle(title).fontSize)).toBe(sizeOf('--bds-heading-xl'));
    await scrollTo(h, SPACER + headerOf(h).getBoundingClientRect().height + 30);
    await new Promise((r) => setTimeout(r, 400)); // let the font-size transition finish
    expect(parseFloat(getComputedStyle(title).fontSize)).toBe(sizeOf('--bds-heading-md'));
  });

  it('size="md" steps down to the bottom of the scale: md -> tiny', async () => {
    const h = await mount({ condenseOnScroll: true, size: 'md' });
    const title = h.querySelector('.bds-page-header__title') as HTMLElement;
    await scrollTo(h, SPACER + headerOf(h).getBoundingClientRect().height + 30);
    await new Promise((r) => setTimeout(r, 400));
    const probe = document.createElement('span');
    probe.style.fontSize = 'var(--bds-heading-tiny)';
    h.appendChild(probe);
    const tiny = parseFloat(getComputedStyle(probe).fontSize);
    probe.remove();
    expect(parseFloat(getComputedStyle(title).fontSize)).toBe(tiny);
  });

  it('does not oscillate: a scroll that lands just past the threshold stays there, condensed', async () => {
    const h = await mount({ condenseOnScroll: true });
    const header = headerOf(h);
    const full = header.getBoundingClientRect().height;
    const flips: string[] = [];
    new MutationObserver(() => flips.push(header.getAttribute('data-condensed') ?? '')).observe(header, {
      attributes: true,
      attributeFilter: ['data-condensed'],
    });
    // One jump to just past the threshold, then rest. Condensing shrinks the
    // header and the content below moves up; a browser with scroll anchoring
    // scrolls back by the same amount. If that carried the scroll back across
    // the trigger the header would expand again and the scroll would end up
    // somewhere the user never put it.
    h.scrollTop = SPACER + full + 2;
    await new Promise((r) => setTimeout(r, 700));
    expect(flips).toEqual(['true']);
    expect(h.scrollTop).toBeGreaterThan(SPACER);
  });

  it('does not oscillate on a page barely taller than the threshold (the scroll clamp)', async () => {
    // maxScroll = SPACER + full + 10, i.e. the very end of the page is only 10px
    // past the threshold. Condensing shortens the page by the lost height, so the
    // browser clamps the scroll position — it must not clamp it back across the
    // trigger.
    const h = await mount({ condenseOnScroll: true }, { bodyHeight: 310 });
    const header = headerOf(h);
    const flips: string[] = [];
    new MutationObserver(() => flips.push(header.getAttribute('data-condensed') ?? '')).observe(header, {
      attributes: true,
      attributeFilter: ['data-condensed'],
    });
    h.scrollTop = h.scrollHeight;
    await new Promise((r) => setTimeout(r, 700));
    expect(flips).toEqual(['true']);
    expect(header.getAttribute('data-condensed')).toBe('true');
  });

  it('expands again on scrolling back to the pin, not before', async () => {
    const h = await mount({ condenseOnScroll: true });
    const header = headerOf(h);
    await scrollTo(h, SPACER + header.getBoundingClientRect().height + 100);
    expect(header.getAttribute('data-condensed')).toBe('true');
    // Back inside the band: stays condensed (this is the hysteresis).
    await scrollTo(h, SPACER + 20);
    expect(header.getAttribute('data-condensed')).toBe('true');
    await scrollTo(h, 0);
    expect(header.getAttribute('data-condensed')).toBe('false');
  });

  it('honours the sticky offset: the threshold is measured from --bds-pageheader-top', async () => {
    const h = await mount({ condenseOnScroll: true }, { pinTop: 40 });
    const full = headerOf(h).getBoundingClientRect().height;
    // The header reaches its pin at scrollTop = SPACER - 40; the far threshold is a header height beyond.
    await scrollTo(h, SPACER - 40 + full - 20);
    expect(headerOf(h).getAttribute('data-condensed')).toBe('false');
    // Ignoring the offset, this would still be 40px short of SPACER + full.
    await scrollTo(h, SPACER - 40 + full + 20);
    expect(headerOf(h).getAttribute('data-condensed')).toBe('true');
  });
});
