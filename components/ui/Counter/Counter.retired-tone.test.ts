/**
 * #3313 — `brand` left the Counter tone union for `emphasis="brand"`.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Counter } from './Counter';

const render = (props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(Counter, { count: 3, ...props } as never));

describe('Counter emphasis and retired brand tone', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders emphasis="brand" as the brand modifier', () => {
    expect(render({ emphasis: 'brand' })).toContain('bds-counter--emphasis-brand');
  });

  it('maps the retired tone="brand" onto emphasis brand and warns', () => {
    const html = render({ tone: 'brand' });
    expect(html).toContain('bds-counter--emphasis-brand');
    expect(html).not.toContain('bds-counter--tone-brand');
    expect(console.warn).toHaveBeenCalled();
  });

  it('maps the retired status="brand" the same way', () => {
    expect(render({ status: 'brand' })).toContain('bds-counter--emphasis-brand');
  });

  it('still folds the older retired values', () => {
    expect(render({ tone: 'success' })).toContain('bds-counter--tone-positive');
  });

  it('adds no brand modifier for a plain tone', () => {
    expect(render({ tone: 'negative' })).not.toContain('emphasis-brand');
  });
});
