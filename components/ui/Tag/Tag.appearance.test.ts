/**
 * One indicator anatomy across Badge, Tag and Avatar (brik-bds#2943).
 *
 * Markup half: Tag takes `appearance` (`solid | subtle | outline`) and a
 * `color` (`neutral` or an accent hue); Avatar takes `appearance`
 * (`solid | subtle`). The CSS half lives in scripts/indicator-anatomy-css.test.mjs.
 *
 * JSX is avoided (the `components` vitest project globs `*.test.ts`).
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tag } from './Tag';
import { Avatar } from '../Avatar/Avatar';

const tag = (props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(Tag as never, props, 'Label'));
const avatar = (props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(Avatar as never, { name: 'Dwight Schrute', ...props }));

describe('Tag appearance + color markup', () => {
  it('defaults to a solid neutral Tag', () => {
    const html = tag({});
    expect(html).toContain('bds-tag--solid');
    expect(html).toContain('bds-tag--neutral');
  });

  it('puts the appearance and the color on the element', () => {
    const html = tag({ appearance: 'outline', color: 'purple' });
    expect(html).toContain('bds-tag--outline');
    expect(html).toContain('bds-tag--purple');
  });
});

describe('Avatar appearance markup', () => {
  it('stays solid by default — no subtle modifier', () => {
    const html = avatar({ color: 'blue' });
    expect(html).toContain('bds-avatar--accent-blue');
    expect(html).not.toContain('bds-avatar--subtle');
  });

  it('adds the subtle modifier alongside the accent color', () => {
    const html = avatar({ appearance: 'subtle', color: 'blue' });
    expect(html).toContain('bds-avatar--subtle');
    expect(html).toContain('bds-avatar--accent-blue');
  });
});
