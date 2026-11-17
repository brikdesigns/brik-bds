/**
 * Meter `valueFormat="fraction"` (#3179). JSX avoided: the `components`
 * vitest project only includes `**\/*.test.ts` (see Badge.retired-tone.test.ts).
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Meter } from './Meter';

const render = (props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(Meter, props as never));

const text = (html: string) => html.replace(/<[^>]*>/g, '');

describe('Meter valueFormat', () => {
  it('defaults to ratio with the Score suffix', () => {
    expect(text(render({ value: 6, max: 7 }))).toBe('6/7 Score');
  });

  it('renders "3 of 8 tasks done" with no Score suffix', () => {
    const out = text(render({ value: 3, max: 8, valueFormat: 'fraction', unit: 'tasks done' }));
    expect(out).toBe('3 of 8 tasks done');
    expect(out).not.toContain('Score');
  });

  it('renders a bare "3 of 8" when no unit is given', () => {
    expect(text(render({ value: 3, max: 8, valueFormat: 'fraction' }))).toBe('3 of 8');
  });

  it('lets valueFormatter win over valueFormat', () => {
    const out = text(
      render({
        value: 3,
        max: 8,
        valueFormat: 'fraction',
        unit: 'tasks done',
        valueFormatter: (v: number, m: number) => `${v} / ${m}`,
      }),
    );
    expect(out).toBe('3 / 8 Score');
  });
});
