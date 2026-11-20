import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChartLegend } from './ChartParts';
import {
  canHideSeries,
  resolveSeriesColors,
  shouldShowLegend,
  stackSegments,
  toggleSeries,
} from './chartTypes';
import { BarChart } from './BarChart';
import { Sparkline } from './Sparkline';

/* ADR-050 § 3 — the two legend rules #3182 must unit-test:
   1. a legend renders only with more than one series;
   2. no toggle can leave zero visible series. */

const keys = ['revenue', 'cost', 'margin'];
const items = keys.map((key, i) => ({
  key,
  label: key,
  color: (['categorical-1', 'categorical-2', 'categorical-3'] as const)[i],
}));

const renderLegend = (props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(ChartLegend, props as never));

describe('legend renders only with more than one series', () => {
  it('shouldShowLegend is false for 0 or 1 series, true from 2', () => {
    expect(shouldShowLegend(0)).toBe(false);
    expect(shouldShowLegend(1)).toBe(false);
    expect(shouldShowLegend(2)).toBe(true);
  });

  it('ChartLegend renders nothing for a single series', () => {
    expect(renderLegend({ items: items.slice(0, 1), onToggle: () => {} })).toBe('');
  });

  it('ChartLegend renders a list for several series', () => {
    const html = renderLegend({ items, onToggle: () => {} });
    expect(html).toContain('bds-chart__legend');
    expect(html.match(/<button/g)).toHaveLength(3);
  });

  it('a single-series BarChart renders no legend', () => {
    const html = renderToStaticMarkup(
      createElement(BarChart, {
        title: 'Revenue',
        data: [{ month: 'Jan', revenue: 4 }],
        categoryKey: 'month',
        series: [{ key: 'revenue', label: 'Revenue' }],
      }),
    );
    expect(html).not.toContain('bds-chart__legend');
  });
});

describe('the last visible series cannot be hidden', () => {
  it('toggleSeries hides a series while others stay visible', () => {
    expect(toggleSeries([], 'revenue', keys)).toEqual(['revenue']);
    expect(toggleSeries(['revenue'], 'cost', keys)).toEqual(['revenue', 'cost']);
  });

  it('toggleSeries refuses to hide the last visible series', () => {
    expect(toggleSeries(['revenue', 'cost'], 'margin', keys)).toEqual(['revenue', 'cost']);
    expect(toggleSeries([], 'only', ['only'])).toEqual([]);
  });

  it('toggleSeries always lets a hidden series come back', () => {
    expect(toggleSeries(['revenue', 'cost'], 'cost', keys)).toEqual(['revenue']);
  });

  it('no sequence of toggles reaches zero visible series', () => {
    let hidden: string[] = [];
    for (let round = 0; round < 3; round++) {
      for (const key of keys) {
        hidden = toggleSeries(hidden, key, keys);
        expect(keys.filter((k) => !hidden.includes(k)).length).toBeGreaterThan(0);
      }
    }
  });

  it('canHideSeries is false for the last visible series and for a hidden one', () => {
    expect(canHideSeries(['revenue', 'cost'], 'margin', keys)).toBe(false);
    expect(canHideSeries(['revenue'], 'revenue', keys)).toBe(false);
    expect(canHideSeries(['revenue'], 'cost', keys)).toBe(true);
  });

  it('ChartLegend disables the toggle of the last visible series', () => {
    const html = renderLegend({ items, hidden: ['revenue', 'cost'], onToggle: () => {} });
    const buttons = html.match(/<button[^>]*>/g) ?? [];
    expect(buttons).toHaveLength(3);
    // revenue and cost are hidden — their toggles stay enabled so they can come back.
    expect(buttons[0]).toContain('aria-pressed="false"');
    expect(buttons[0]).not.toContain('disabled');
    expect(buttons[1]).not.toContain('disabled');
    // margin is the last one visible — its toggle is disabled.
    expect(buttons[2]).toContain('aria-pressed="true"');
    expect(buttons[2]).toContain('disabled');
  });

  it('ChartLegend leaves every toggle enabled while two or more are visible', () => {
    const html = renderLegend({ items, hidden: ['revenue'], onToggle: () => {} });
    expect(html).not.toContain('disabled');
  });
});

describe('series colour', () => {
  it('a single series defaults to brand, several to categorical by position', () => {
    expect(resolveSeriesColors([{ key: 'a', label: 'A' }])[0].color).toBe('brand');
    expect(
      resolveSeriesColors([
        { key: 'a', label: 'A' },
        { key: 'b', label: 'B' },
      ]).map((s) => s.color),
    ).toEqual(['categorical-1', 'categorical-2']);
  });

  it('an explicit colour wins', () => {
    expect(resolveSeriesColors([{ key: 'a', label: 'A', color: 'negative' }])[0].color).toBe('negative');
  });
});

describe('Sparkline data-table alternative', () => {
  it('server-renders a named image and a hidden table of every value', () => {
    const html = renderToStaticMarkup(
      createElement(Sparkline, { data: [3, 5, 4], label: 'Revenue, last 3 weeks' }),
    );
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Revenue, last 3 weeks"');
    expect(html).toContain('<caption>Revenue, last 3 weeks</caption>');
    expect(html.match(/<tr>/g)).toHaveLength(4);
  });
});

describe('stacked BarChart', () => {
  const row = { a: 2, b: 3, c: 5 };

  it('stackSegments lays segments end to end from zero, summing to the total', () => {
    expect(stackSegments(row, ['a', 'b', 'c'])).toEqual([
      { key: 'a', start: 0, end: 2 },
      { key: 'b', start: 2, end: 5 },
      { key: 'c', start: 5, end: 10 },
    ]);
  });

  it('hiding a series re-stacks the remaining segments with no gap', () => {
    const hidden = toggleSeries([], 'b', keys);
    const visible = ['a', 'b', 'c'].filter((k) => !hidden.includes(k));
    expect(stackSegments(row, visible)).toEqual([
      { key: 'a', start: 0, end: 2 },
      { key: 'c', start: 2, end: 7 },
    ]);
  });

  it('the last visible series cannot be hidden, so a stack never empties', () => {
    const all = ['a', 'b', 'c'];
    let hidden: string[] = [];
    for (const k of all) hidden = toggleSeries(hidden, k, all);
    expect(stackSegments(row, all.filter((k) => !hidden.includes(k)))).toHaveLength(1);
  });

  it('gaps read as zero and negatives stack downward from zero', () => {
    expect(stackSegments({ a: 2, b: null, c: -3 }, ['a', 'b', 'c'])).toEqual([
      { key: 'a', start: 0, end: 2 },
      { key: 'b', start: 2, end: 2 },
      { key: 'c', start: 0, end: -3 },
    ]);
  });

  it('the data table gains one row per category with a Total column', () => {
    const html = renderToStaticMarkup(
      createElement(BarChart, {
        title: 'Engagements',
        stacked: true,
        data: [{ line: 'Web', a: 2, b: 3 }, { line: 'Brand', a: 1, b: 4 }],
        categoryKey: 'line',
        series: [{ key: 'a', label: 'Active' }, { key: 'b', label: 'Done' }],
      }),
    );
    expect(html).toContain('>Total<');
    expect(html).toContain('>5<');
    expect(html.match(/<tr[ >]/g)).toHaveLength(3);
  });

  it('an unstacked BarChart has no Total column', () => {
    const html = renderToStaticMarkup(
      createElement(BarChart, {
        title: 'Engagements',
        data: [{ line: 'Web', a: 2, b: 3 }],
        categoryKey: 'line',
        series: [{ key: 'a', label: 'Active' }, { key: 'b', label: 'Done' }],
      }),
    );
    expect(html).not.toContain('>Total<');
  });
});
