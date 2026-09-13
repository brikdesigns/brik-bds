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
 *   - `animated-svg` renders the `AnimatedIcon` primitive's `bds-animated-icon`
 *     element when a Lottie `src` is supplied, else falls back to the static
 *     `children` (the by-construction reduced-motion state, also what the
 *     React-rail-only axis renders on the Astro rail, #2533).
 *
 * The reduced-motion gate is BY CONSTRUCTION — `Marquee.css` neutralises the
 * scroll under `@media (prefers-reduced-motion: reduce)`, and `AnimatedIcon`
 * reads `prefers-reduced-motion` synchronously so it never autoplays under it —
 * facts with no SSR-observable form, guarded by the primitives and the stories.
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

  it('animated-svg with no src falls back to the static children (reduced-motion state)', () => {
    const html = markup({ contentMotion: 'animated-svg', children: createElement('img', { src: 'i.svg', alt: 'Fast' }) });
    expect(html).not.toContain('bds-marquee');
    expect(html).not.toContain('bds-count-up');
    expect(html).not.toContain('bds-animated-icon');
    expect(html).toBe('<img src="i.svg" alt="Fast"/>');
  });

  it('animated-svg with a Lottie src renders through the AnimatedIcon primitive', () => {
    const html = markup({
      contentMotion: 'animated-svg',
      animatedIcon: { src: { v: '5.7.4', layers: [] }, label: 'Fast' },
      children: createElement('img', { src: 'i.svg', alt: 'Fast' }),
    });
    expect(html).toContain('bds-animated-icon');
    // The static children fallback is not emitted when the animation renders.
    expect(html).not.toContain('i.svg');
  });
});
