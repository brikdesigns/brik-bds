/**
 * Select SSR id-stability regression test (#856).
 *
 * The `components` vitest project runs in node, so we exercise the server
 * render path directly with `renderToStaticMarkup`. The original bug used a
 * `Math.random` id fallback: two renders of the same element produced
 * different ids, which on the client manifested as a hydration mismatch.
 * `useId()` is deterministic for a given tree position, so repeated static
 * renders must be byte-identical. JSX is avoided to keep this a `.test.ts`
 * file (the project's include glob is `**\/*.test.ts`).
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Select } from './Select';

const baseProps = {
  label: 'Service',
  helperText: 'Pick one',
  options: [
    { label: 'Brand', value: 'brand' },
    { label: 'Marketing', value: 'marketing' },
  ],
};

describe('Select SSR id stability (#856)', () => {
  it('produces identical markup across repeated renders when no id is provided', () => {
    const a = renderToStaticMarkup(createElement(Select, baseProps));
    const b = renderToStaticMarkup(createElement(Select, baseProps));
    expect(a).toBe(b);
  });

  it('wires the label htmlFor to the select id via the generated fallback', () => {
    const html = renderToStaticMarkup(createElement(Select, baseProps));
    const forId = html.match(/<label[^>]*for="([^"]+)"/)?.[1];
    const selectId = html.match(/<select[^>]*\sid="([^"]+)"/)?.[1];
    expect(forId).toBeTruthy();
    expect(selectId).toBe(forId);
  });

  it('honors an explicit id (public API unchanged)', () => {
    const html = renderToStaticMarkup(
      createElement(Select, { ...baseProps, id: 'my-select' }),
    );
    expect(html).toContain('id="my-select"');
    expect(html).toContain('for="my-select"');
    expect(html).toContain('id="my-select-helper"');
  });
});
