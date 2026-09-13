/**
 * BlockMedia media-axis contract test (ADR-039 §Media axis, brik-bds#2493).
 *
 * The load-bearing claim is the `bg-video` reduced-motion gate being **by
 * construction**: the server/JS-off markup must carry NO `autoplay` attribute,
 * so it rests on its poster until the client effect starts it only when motion
 * is allowed. An `autoPlay={!reduced}` attribute would ship `autoplay` in this
 * SSR snapshot (reduced starts `false`) — this test is the regression guard
 * against that reappearing. The live play/pause effect needs a real DOM; the
 * `content-system` vitest project is node-only, so it is covered by the
 * `BlockMedia` browser story rather than here.
 *
 * JSX is avoided to keep this a `.test.ts` file (the `content-system` vitest
 * project's include glob is `**\/*.test.ts`), matching `HeroMediaCard.a11y.test.ts`.
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BlockMedia, type BlockMediaProps } from './BlockMedia';

const markup = (props: BlockMediaProps): string =>
  renderToStaticMarkup(createElement(BlockMedia, props));

describe('BlockMedia media axis (#2493)', () => {
  it('bg-video ships NO autoplay in server markup (reduced-motion gate by construction)', () => {
    const html = markup({ media: 'bg-video', src: '/hero.mp4', poster: '/poster.webp' });
    // The regression guard: no `autoplay` attribute anywhere.
    expect(html).not.toContain('autoplay');
    expect(html).not.toContain('autoPlay');
    // Ambient + lazy: muted/loop, metadata-free, decorative, poster to rest on.
    expect(html).toContain('<video');
    expect(html).toContain('muted');
    expect(html).toContain('loop');
    expect(html).toContain('preload="none"');
    expect(html).toContain('poster="/poster.webp"');
    expect(html).toContain('aria-hidden="true"');
    // Frame-locked + its own modifier class.
    expect(html).toContain('bds-block-media--bg-video');
    expect(html).toContain('bds-frame--ratio-16-9');
  });

  it('video is a foreground player — controls, metadata, no autoplay, no bg modifier', () => {
    const html = markup({ media: 'video', src: '/clip.mp4', poster: '/poster.webp' });
    expect(html).toContain('controls');
    expect(html).toContain('preload="metadata"');
    expect(html).not.toContain('autoplay');
    expect(html).not.toContain('bds-block-media--bg-video');
  });

  it('image renders a lazy <img> by default and eager on request (LCP)', () => {
    const lazy = markup({ media: 'image', src: '/hero.webp' });
    expect(lazy).toContain('<img');
    expect(lazy).toContain('loading="lazy"');
    expect(lazy).not.toContain('<video');

    const eager = markup({ media: 'image', src: '/hero.webp', loading: 'eager' });
    expect(eager).toContain('loading="eager"');
  });

  it('honours the ratio axis (folded in from #2492)', () => {
    const html = markup({ media: 'image', src: '/hero.webp', ratio: '4-5' });
    expect(html).toContain('bds-frame--ratio-4-5');
  });

  it('renders nothing for media="none" or an absent src', () => {
    expect(markup({ media: 'none', src: '/hero.webp' })).toBe('');
    expect(markup({ media: 'image', src: null })).toBe('');
    expect(markup({ media: 'bg-video', src: undefined })).toBe('');
  });
});
