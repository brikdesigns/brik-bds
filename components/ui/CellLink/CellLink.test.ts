/**
 * CellLink element + class tests (#1280).
 *
 * JSX is avoided to keep this a `.test.ts` file (the `components` vitest
 * project's include glob is `**\/*.test.ts`).
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CellLink } from './CellLink';

const render = (props: Record<string, unknown>, label = 'Acme') =>
  renderToStaticMarkup(createElement(CellLink as never, props, label));

describe('CellLink', () => {
  it('renders an anchor when href is given', () => {
    const html = render({ href: '/acme' });
    expect(html).toMatch(/^<a /);
    expect(html).toContain('href="/acme"');
    expect(html).toContain('bds-cell-link');
  });

  it('renders a type="button" button without href', () => {
    const html = render({});
    expect(html).toMatch(/^<button /);
    expect(html).toContain('type="button"');
  });

  it('renders icon slots on both sides of the label', () => {
    const html = render({ href: '/a', iconBefore: 'B', iconAfter: 'A' });
    expect(html.match(/bds-cell-link__icon/g)).toHaveLength(2);
    expect(html.indexOf('>B<')).toBeLessThan(html.indexOf('Acme'));
    expect(html.indexOf('Acme')).toBeLessThan(html.indexOf('>A<'));
  });
});
