/**
 * HeroMediaCard nested-interactive-control regression test (brik-bds#2284).
 *
 * `HeroMediaCard` / `HeroMediaCardImage` / `HeroMediaCardPrice` render no
 * interactivity and no `<button>`/`<a>` of their own — the `@deprecated`
 * `HeroSplitImageCardOverlay` adapter's hard-coded `<Button>` inside a plain
 * `<aside>` is exactly what blocked a consumer from wrapping the whole card
 * in an outer interactive `<Card href>` / `<a>` (nesting a `<button>` inside
 * an `<a>` is invalid). This asserts that composing `<HeroMediaCard>` inside
 * `<Card href>` renders exactly one interactive element — the outer anchor —
 * and zero from the media-card parts themselves.
 *
 * JSX is avoided to keep this a `.test.ts` file (the `content-system` vitest
 * project's include glob is `**\/*.test.ts`), matching `Toast.a11y.test.ts`.
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Card } from '../../../components';
import { HeroMediaCard } from './HeroMediaCard';
import { HeroMediaCardImage } from './HeroMediaCardImage';
import { HeroMediaCardPrice } from './HeroMediaCardPrice';

const INTERACTIVE_TAG = /<(a|button)[\s>]/g;

function countInteractiveTags(html: string): number {
  return html.match(INTERACTIVE_TAG)?.length ?? 0;
}

describe('HeroMediaCard nested interactive control (#2284)', () => {
  it('renders no interactive element on its own', () => {
    const html = renderToStaticMarkup(
      createElement(
        HeroMediaCard,
        null,
        createElement(HeroMediaCardImage, { src: '/hero.jpg', alt: '' }),
        createElement(HeroMediaCardPrice, { label: 'Starting at', value: '$99/mo' }),
      ),
    );
    expect(countInteractiveTags(html)).toBe(0);
  });

  it('renders no interactive element in its `missing` fallback', () => {
    const html = renderToStaticMarkup(
      createElement(HeroMediaCard, { missing: { label: 'Hero image card missing for this page.' } }),
    );
    expect(countInteractiveTags(html)).toBe(0);
  });

  it('composed inside <Card href> renders exactly one interactive element — the outer anchor', () => {
    const html = renderToStaticMarkup(
      createElement(
        Card,
        { href: '#pricing-detail' } as never,
        createElement(
          HeroMediaCard,
          { as: 'div' },
          createElement(HeroMediaCardImage, { src: '/hero.jpg', alt: '' }),
          createElement(HeroMediaCardPrice, { label: 'Starting at', value: '$99/mo' }),
        ),
      ),
    );

    // Zero nested-interactive-control violations: exactly the outer <a>,
    // nothing from HeroMediaCard/-Image/-Price.
    expect(countInteractiveTags(html)).toBe(1);
    expect(html.match(/<a[\s>]/g)?.length).toBe(1);
  });
});
