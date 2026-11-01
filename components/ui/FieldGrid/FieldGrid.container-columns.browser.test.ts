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
  return host.querySelector('.bds-field-grid') as HTMLElement;
}

// The grid is the root for `columns={2}` (the cells element is `display:
// contents`) and the cells element for 3 / 4, which need the root as container.
const gridOf = (root: HTMLElement) =>
  getComputedStyle(root).display === 'grid'
    ? root
    : (root.querySelector('.bds-field-grid__cells') as HTMLElement);

const trackCount = (root: HTMLElement) =>
  getComputedStyle(gridOf(root)).gridTemplateColumns.trim().split(/\s+/).length;

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
      const grid = gridOf(await mount(width, 4));
      gaps.push(`${getComputedStyle(grid).columnGap}|${getComputedStyle(grid).rowGap}`);
      await act(async () => root.unmount());
      host.remove();
    }
    expect(new Set(gaps)).toEqual(new Set(['13px|13px']));
  });
});

describe('columns={2} keeps its pre-#2930 box in a shrink-wrap parent (AC5)', () => {
  // `container-type: inline-size` drops a box's intrinsic inline size, so any
  // shrink-to-fit parent (centered layout, inline-block, flex item without a
  // basis) collapses a contained grid. The reference below is the pre-#2930
  // grid: same children, plain two-column grid, same parent.
  const wraps: Record<string, string> = {
    'inline-block': 'display: inline-block',
    'centered flex column': 'display: flex; flex-direction: column; align-items: center',
    'flex row item': 'display: flex',
  };

  it.each(Object.keys(wraps))('same width as a plain 2-col grid in a %s parent', async (kind) => {
    host = document.createElement('div');
    host.style.cssText = `${wraps[kind]}; width: 900px`;
    host.style.setProperty('--bds-gap-lg', '13px');
    document.body.appendChild(host);
    root = createRoot(host);
    const cell = (i: number) => h(Field, { key: i, label: `Business name ${i}` }, `Value number ${i}`);
    await act(async () => {
      root.render(
        h(
          React.Fragment,
          null,
          h(FieldGrid, { columns: 2 }, cell(0), cell(1), cell(2), cell(3)),
          h(
            'div',
            { className: 'reference', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '13px' } },
            cell(0),
            cell(1),
            cell(2),
            cell(3),
          ),
        ),
      );
    });
    const grid = host.querySelector('.bds-field-grid') as HTMLElement;
    const reference = host.querySelector('.reference') as HTMLElement;
    const width = grid.getBoundingClientRect().width;
    expect(width).toBeGreaterThan(100);
    expect(width).toBe(reference.getBoundingClientRect().width);
    expect(grid.getBoundingClientRect().height).toBe(reference.getBoundingClientRect().height);
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
    expect(getComputedStyle(full).gridColumn).toBe('1 / -1');
    expect(full.getBoundingClientRect().width).toBe(
      gridOf(host.querySelector('.bds-field-grid') as HTMLElement).getBoundingClientRect().width,
    );
    expect(getComputedStyle(normal).gridColumn).toBe('auto');
  });
});
