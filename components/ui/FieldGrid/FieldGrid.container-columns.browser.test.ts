import { afterEach, describe, expect, it } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { FieldGrid, type FieldGridColumns } from './FieldGrid';
import { Field } from '../Field';

/**
 * FieldGrid `columns` is a maximum that steps down with the CONTAINER width
 * (brik-bds#2930), and `Field span="full"` spans every column.
 *
 * Reads getComputedStyle on a mounted grid inside a host of a known pixel
 * width — the @container rule only matches against a real laid-out ancestor,
 * so a source-text check could not prove it engages. The two thresholds under
 * test (480 / 720) are the ones named in FieldGrid.mdx.
 */

let host: HTMLDivElement;
let root: Root;

const h = React.createElement;

async function mount(width: number, columns?: FieldGridColumns, cells = 4) {
  host = document.createElement('div');
  host.style.width = `${width}px`;
  // Tokens are not loaded in this test; a concrete gap proves the SAME value
  // resolves at every width, which is what the AC pins.
  host.style.setProperty('--bds-gap-lg', '13px');
  document.body.appendChild(host);
  root = createRoot(host);
  const fields = Array.from({ length: cells }, (_, i) => h(Field, { key: i, label: `L${i}` }, `V${i}`));
  await act(async () => {
    root.render(h(FieldGrid, columns === undefined ? {} : { columns }, ...fields));
  });
  return host.querySelector('.bds-field-grid__cells') as HTMLElement;
}

const trackCount = (grid: HTMLElement) =>
  getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length;

afterEach(async () => {
  await act(async () => {
    root?.unmount();
  });
  host?.remove();
});

describe('FieldGrid columns step with container width (#2930)', () => {
  it.each([
    [900, 4],
    [720, 4],
    [719, 3],
    [600, 3],
    [480, 3],
    [479, 2],
    [300, 2],
  ])('columns={4} at a %ipx container shows %i columns', async (width, expected) => {
    expect(trackCount(await mount(width, 4))).toBe(expected);
  });

  it.each([
    [900, 3],
    [480, 3],
    [479, 2],
    [300, 2],
  ])('columns={3} at a %ipx container shows %i columns', async (width, expected) => {
    expect(trackCount(await mount(width, 3))).toBe(expected);
  });

  it.each([900, 480, 300])('columns={2} stays 2 at a %ipx container', async (width) => {
    expect(trackCount(await mount(width, 2))).toBe(2);
  });

  it.each([900, 300])('default columns stays 2 at a %ipx container', async (width) => {
    expect(trackCount(await mount(width))).toBe(2);
  });

  it('gap is identical at every width', async () => {
    const gaps: string[] = [];
    for (const width of [900, 600, 300]) {
      const grid = await mount(width, 4);
      gaps.push(`${getComputedStyle(grid).columnGap}|${getComputedStyle(grid).rowGap}`);
      await act(async () => root.unmount());
      host.remove();
    }
    expect(new Set(gaps)).toEqual(new Set(['13px|13px']));
  });
});

describe('Field span (#2930)', () => {
  it.each([900, 600, 300])('span="full" spans every column at a %ipx container', async (width) => {
    host = document.createElement('div');
    host.style.width = `${width}px`;
    document.body.appendChild(host);
    root = createRoot(host);
    await act(async () => {
      root.render(
        h(
          FieldGrid,
          { columns: 4 },
          h(Field, { label: 'A', span: 'full' }, 'wide'),
          h(Field, { label: 'B' }, 'one'),
        ),
      );
    });
    const [full, normal] = Array.from(host.querySelectorAll<HTMLElement>('.bds-field'));
    const fullArea = getComputedStyle(full).gridColumn;
    expect(fullArea).toBe('1 / -1');
    expect(full.getBoundingClientRect().width).toBe(
      (host.querySelector('.bds-field-grid__cells') as HTMLElement).getBoundingClientRect().width,
    );
    expect(getComputedStyle(normal).gridColumn).toBe('auto');
  });
});
