/**
 * ADR-045 § 4 — `Button` `selected` stays a visual state, and when it is
 * defined the button also announces itself as a toggle via `aria-pressed`.
 * Left undefined, an ordinary button never reads as a toggle.
 *
 * JSX is avoided (the `components` vitest project globs `*.test.ts`).
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from './Button';

const html = (props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(Button as never, props, 'Label'));

describe('Button selected -> aria-pressed', () => {
  it('omits aria-pressed when selected is not passed', () => {
    const markup = html({});
    expect(markup).not.toContain('aria-pressed');
    expect(markup).not.toContain('bds-button--selected');
  });

  it('sets aria-pressed="true" and the selected class when selected', () => {
    const markup = html({ selected: true });
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain('bds-button--selected');
  });

  it('sets aria-pressed="false" without the selected class when selected={false}', () => {
    const markup = html({ selected: false });
    expect(markup).toContain('aria-pressed="false"');
    expect(markup).not.toContain('bds-button--selected');
  });

  it('lets a consumer-supplied aria-pressed win (portal call sites add it by hand today)', () => {
    expect(html({ selected: true, 'aria-pressed': 'mixed' })).toContain('aria-pressed="mixed"');
  });

  it('does not put aria-pressed on an anchor (the attribute is not valid on role=link)', () => {
    const markup = html({ selected: true, href: '/x' });
    expect(markup).toContain('<a');
    expect(markup).toContain('bds-button--selected');
    expect(markup).not.toContain('aria-pressed');
  });
});
