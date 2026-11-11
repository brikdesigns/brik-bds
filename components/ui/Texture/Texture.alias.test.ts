import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Texture, BackgroundPattern } from './index';

// brik-bds#3080: BackgroundPattern is a deprecated alias of Texture for one minor.
describe('Texture', () => {
  it('renders the .bds-texture class with its variant modifier', () => {
    const html = renderToStaticMarkup(createElement(Texture, { variant: 'line-grid' }));
    expect(html).toContain('bds-texture bds-texture--variant-line-grid');
  });

  it('still carries the deprecated .bds-background-pattern class so consumer selectors keep matching', () => {
    expect(renderToStaticMarkup(createElement(Texture))).toContain('bds-background-pattern');
  });

  it('keeps BackgroundPattern exported as the same component', () => {
    expect(BackgroundPattern).toBe(Texture);
  });
});
