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
 *   - `count-up` wraps its child number in the `CountUp` primitive's
 *     `bds-count-up` element — the final number is the DOM text, so SSR emits the
 *     static value and the sweep is a client-only enhancement over it (#2532).
 *   - `animated-svg` falls through to passthrough here — it renders through its
 *     own primitive once its sub-issue wires an adopting block (#2533); a block
 *     adopting the axis today sets only values it renders, so this is never
 *     reached in practice.
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

  it('count-up wraps its child number in the CountUp primitive, SSR-ing the static value', () => {
    const html = markup({ contentMotion: 'count-up', children: '4,800+' });
    expect(html).toContain('class="bds-count-up"');
    // The final number is the DOM text — SSR emits it verbatim, no `0` flash and
    // no marquee wrapper. The sweep is a client-only enhancement.
    expect(html).toContain('4,800+');
    expect(html).not.toContain('bds-marquee');
  });

  it('animated-svg falls through to passthrough until its sub-issue wires a block', () => {
    const html = markup({ contentMotion: 'animated-svg', children: 'x' });
    expect(html).not.toContain('bds-marquee');
    expect(html).not.toContain('bds-count-up');
  });
});
