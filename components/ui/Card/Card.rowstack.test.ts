/**
 * Card `layout="row"` / `"stack"` status + meta slots (brik-bds#3177).
 * `status` is a trailing indicator; `meta` is a short fact line under the body.
 * Neither renders an element when omitted.
 *
 * JSX is avoided to keep this a `.test.ts` file (the `components` vitest
 * project's include glob is `**\/*.test.ts`).
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Card } from './Card';

const render = (props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(Card as never, { title: 'Plan', ...props }));

describe.each(['row', 'stack'] as const)('Card layout="%s" status + meta', (layout) => {
  it('renders status and meta slots when passed', () => {
    const html = render({ layout, status: 'Active', meta: 'Updated today' });
    expect(html).toContain(`bds-card__${layout}-status">Active<`);
    expect(html).toContain(`bds-card__${layout}-meta">Updated today<`);
  });

  it('renders no status or meta node on a bare card', () => {
    const html = render({ layout });
    expect(html).not.toContain(`bds-card__${layout}-status`);
    expect(html).not.toContain(`bds-card__${layout}-meta`);
  });

  it('puts meta after the body children and before the action', () => {
    const html = render({ layout, meta: 'M', action: 'A', children: 'BODY' });
    const at = (s: string) => html.indexOf(s);
    expect(at('BODY')).toBeLessThan(at(`bds-card__${layout}-meta`));
    expect(at(`bds-card__${layout}-meta`)).toBeLessThan(at(`bds-card__${layout}-action`));
  });

  it('leaves stack-badge unchanged', () => {
    const html = render({ layout, media: 'img', badge: 'B', status: 'S' });
    expect(html.includes('bds-card__stack-badge')).toBe(layout === 'stack');
  });
});
