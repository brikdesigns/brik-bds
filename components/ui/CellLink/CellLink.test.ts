/**
 * CellLink element + class tests (#1280).
 *
 * JSX is avoided to keep this a `.test.ts` file (the `components` vitest
 * project's include glob is `**\/*.test.ts`).
 */
import { describe, it, expect, vi } from 'vitest';
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

  describe('onActivate (anchor form)', () => {
    // forwardRef exposes `render`; calling it returns the <a> element so the
    // composed onClick can be driven without a DOM.
    const anchorOf = (props: Record<string, unknown>) =>
      (CellLink as unknown as { render: (p: unknown, r: null) => { props: Record<string, unknown> } }).render(
        { href: '/acme', children: 'Acme', ...props },
        null,
      );
    const click = (props: Record<string, unknown>, init: Record<string, unknown> = {}) => {
      const event = {
        button: 0,
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        defaultPrevented: false,
        preventDefault: vi.fn(function (this: { defaultPrevented: boolean }) {
          this.defaultPrevented = true;
        }),
        ...init,
      };
      (anchorOf(props).props.onClick as ((e: unknown) => void) | undefined)?.(event);
      return event;
    };

    it('plain click prevents default and calls onActivate with the event', () => {
      const onActivate = vi.fn();
      const event = click({ onActivate });
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(onActivate).toHaveBeenCalledTimes(1);
      expect(onActivate).toHaveBeenCalledWith(event);
    });

    it.each([
      ['meta', { metaKey: true }],
      ['ctrl', { ctrlKey: true }],
      ['shift', { shiftKey: true }],
      ['alt', { altKey: true }],
      ['middle button', { button: 1 }],
    ])('%s click leaves default navigation alone', (_name, init) => {
      const onActivate = vi.fn();
      const event = click({ onActivate }, init);
      expect(onActivate).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('still fires the consumer onClick, before onActivate', () => {
      const order: string[] = [];
      click({ onClick: () => order.push('click'), onActivate: () => order.push('activate') });
      expect(order).toEqual(['click', 'activate']);
    });

    it('skips onActivate when the consumer onClick prevents default', () => {
      const onActivate = vi.fn();
      click(
        { onActivate, onClick: (e: { preventDefault: () => void }) => e.preventDefault() },
      );
      expect(onActivate).not.toHaveBeenCalled();
    });

    it('without onActivate attaches no wrapper and never prevents default', () => {
      const onClick = vi.fn();
      expect(anchorOf({}).props.onClick).toBeUndefined();
      expect(anchorOf({ onClick }).props.onClick).toBe(onClick);
      const event = click({ onClick });
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('keeps the real href and does not forward onActivate to the DOM', () => {
      const html = render({ href: '/acme', onActivate: () => {} });
      expect(html).toContain('href="/acme"');
      expect(html.toLowerCase()).not.toContain('onactivate');
      expect(anchorOf({ onActivate: () => {} }).props).not.toHaveProperty('onActivate');
    });
  });
});
