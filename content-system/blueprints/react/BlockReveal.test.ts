/**
 * BlockReveal motion-axis contract test (ADR-039 §Decision 2, brik-bds#2494).
 *
 * The load-bearing claim: `none` emits NO `bds-block-reveal` class, so adopting
 * the primitive on a block changes no existing markup (the additive-by-default
 * guarantee). The reduced-motion gate is BY CONSTRUCTION — `BlockReveal.css`
 * neutralises every preset under `@media (prefers-reduced-motion: reduce)` — but
 * it is a pure-CSS fact with no SSR-observable form, so it is guarded by the CSS
 * file itself and the settled visual is covered by the story.
 *
 * JSX is avoided to keep this a `.test.ts` file (the `content-system` vitest
 * project's include glob is `**\/*.test.ts`), matching `BlockMedia.test.ts`.
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BlockReveal, type BlockRevealProps } from './BlockReveal';

const markup = (props: BlockRevealProps): string =>
  renderToStaticMarkup(createElement(BlockReveal, props));

describe('BlockReveal motion axis (#2494)', () => {
  it('none emits no reveal class — identical markup to a plain wrapper', () => {
    const html = markup({ reveal: 'none', className: 'bds-hero__content', children: 'x' });
    expect(html).not.toContain('bds-block-reveal');
    expect(html).toContain('class="bds-hero__content"');
  });

  it('fade / rise / stagger each emit their modifier appended to the host class', () => {
    expect(markup({ reveal: 'fade', className: 'bds-hero__content', children: 'x' }))
      .toContain('bds-block-reveal--fade');
    expect(markup({ reveal: 'rise', className: 'bds-hero__content', children: 'x' }))
      .toContain('bds-block-reveal--rise');

    const stagger = markup({ reveal: 'stagger', className: 'bds-hero__content', children: 'x' });
    expect(stagger).toContain('bds-hero__content');
    expect(stagger).toContain('bds-block-reveal--stagger');
  });

  it('carries no base bds-block-reveal class — the axis is a modifier, not a block', () => {
    const html = markup({ reveal: 'fade', children: 'x' });
    // Only the modifier, never a bare `bds-block-reveal` (which would need its
    // own rule and could override a host element's layout).
    expect(html).not.toMatch(/class="[^"]*\bbds-block-reveal\b(?!--)/);
  });
});
