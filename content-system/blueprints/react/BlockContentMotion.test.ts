/**
 * BlockContentMotion content-motion-axis contract test (ADR-039 §Decision 2,
 * brik-bds#2529).
 *
 * The load-bearing claims:
 *   - `none` (default) is a passthrough — it emits NO `bds-marquee` wrapper, so
 *     adopting the dispatcher changes no existing markup (additive-by-default).
 *   - `marquee` wraps its children in the `Marquee` primitive's `bds-marquee`
 *     DOM (track + two groups, the second aria-hidden), so the shared
 *     `Marquee.css` drives it on both rails.
 *   - `count-up` / `animated-svg` fall through to passthrough here — they render
 *     through their own primitives once their sub-issues wire an adopting block
 *     (#2532 / #2533); a block adopting the axis today sets only `none` /
 *     `marquee`, so this is never reached in practice.
 *
 * The reduced-motion gate is BY CONSTRUCTION — `Marquee.css` neutralises the
 * scroll under `@media (prefers-reduced-motion: reduce)` — a pure-CSS fact with
 * no SSR-observable form, guarded by the CSS file itself and covered by the story.
 *
 * JSX is avoided to keep this a `.test.ts` file (the `content-system` vitest
 * project's include glob is `**\/*.test.ts`), matching `BlockReveal.test.ts`.
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BlockContentMotion, type BlockContentMotionProps } from './BlockContentMotion';

const markup = (props: BlockContentMotionProps): string =>
  renderToStaticMarkup(createElement(BlockContentMotion, props));

describe('BlockContentMotion content-motion axis (#2529)', () => {
  it('none is a passthrough — no marquee wrapper, children emitted directly', () => {
    const html = markup({ contentMotion: 'none', children: createElement('img', { src: 'x', alt: 'Acme' }) });
    expect(html).not.toContain('bds-marquee');
    expect(html).toBe('<img src="x" alt="Acme"/>');
  });

  it('default (no contentMotion) is the same passthrough', () => {
    const html = markup({ children: createElement('img', { src: 'x', alt: 'Acme' }) });
    expect(html).not.toContain('bds-marquee');
  });

  it('marquee wraps children in the Marquee primitive DOM — track + two groups', () => {
    const html = markup({ contentMotion: 'marquee', children: createElement('img', { src: 'x', alt: 'Acme' }) });
    expect(html).toContain('class="bds-marquee"');
    expect(html).toContain('bds-marquee__track');
    // Two groups, the duplicate aria-hidden so the set is announced once.
    expect(html.match(/bds-marquee__group/g)).toHaveLength(2);
    expect(html).toContain('aria-hidden="true"');
  });

  it('count-up / animated-svg fall through to passthrough until their sub-issues wire a block', () => {
    expect(markup({ contentMotion: 'count-up', children: 'x' })).not.toContain('bds-marquee');
    expect(markup({ contentMotion: 'animated-svg', children: 'x' })).not.toContain('bds-marquee');
  });
});
