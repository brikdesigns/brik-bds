/**
 * Features `layout="alternating-split"` contract test (brik-bds#3189).
 *
 * The layout is one row per item — a text side and a media side — with the
 * sides swapped on even rows by CSS `order` only, so DOM order (text first)
 * stays the reading order on every viewport. These assertions pin the markup
 * the CSS keys on: the modifier, the row anatomy, the missing-media placeholder
 * when no image is supplied, and the `mediaPosition` attribute. JSX is avoided
 * to keep this a `.test.ts` file (the `content-system` vitest include glob).
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Features, type FeaturesProps } from './Features';

const items = [
  { title: 'One', description: 'First.', href: '/one', imageUrl: '/one.jpg', imageAlt: 'First image' },
  { title: 'Two', description: 'Second.' },
  { title: 'Three', description: 'Third.', href: '/three' },
];

const markup = (props: Partial<FeaturesProps> = {}): string =>
  renderToStaticMarkup(
    createElement(Features, { sectionKey: 'f', title: 'Features', items, ...props }),
  );

describe('Features layout="alternating-split" (#3189)', () => {
  it('emits the layout modifier and one row per item, with no card chrome', () => {
    const html = markup({ layout: 'alternating-split' });
    expect(html).toContain('bds-features--alternating-split');
    expect(html.match(/class="bds-features__item"/g)).toHaveLength(3);
    expect(html).not.toContain('bds-features__card');
  });

  it('keeps the default grid markup when layout is omitted', () => {
    const html = markup();
    expect(html).not.toContain('bds-features--alternating-split');
    expect(html).toContain('bds-features__card');
  });

  it('puts text before media in the DOM of every row', () => {
    const html = markup({ layout: 'alternating-split' });
    for (const row of html.split('class="bds-features__item"').slice(1)) {
      expect(row.indexOf('bds-features__content')).toBeLessThan(row.indexOf('bds-features__media'));
    }
  });

  it('renders the missing-media placeholder for every item with no image', () => {
    const html = markup({ layout: 'alternating-split' });
    expect(html.match(/bds-blueprint-section__missing"/g)).toHaveLength(2);
    expect(html.match(/data-content-needed="feature_image_url"/g)).toHaveLength(2);
    expect(html).toContain('<img src="/one.jpg" alt="First image"');
  });

  it('renders every media side as the placeholder when no images are supplied', () => {
    const html = markup({
      layout: 'alternating-split',
      items: items.map(({ title, description }) => ({ title, description })),
    });
    expect(html.match(/data-content-needed="feature_image_url"/g)).toHaveLength(3);
    expect(html).not.toContain('<img');
  });

  it('renders the CTA only for an item that carries an href', () => {
    const html = markup({ layout: 'alternating-split' });
    expect(html.match(/bds-features__cta"/g)).toHaveLength(2);
  });

  it('writes data-media-position only for the non-default value', () => {
    expect(markup({ layout: 'alternating-split' })).not.toContain('data-media-position');
    expect(markup({ layout: 'alternating-split', mediaPosition: 'start' })).toContain(
      'data-media-position="start"',
    );
  });

  it('does not emit the cols modifier on the split layout', () => {
    expect(markup({ layout: 'alternating-split', columns: 4 })).not.toContain('bds-features--cols-');
  });
});
