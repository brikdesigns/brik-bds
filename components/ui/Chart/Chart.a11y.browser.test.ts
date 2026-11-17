import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import React, { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import axe from 'axe-core';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { DonutChart } from './DonutChart';
import { Sparkline } from './Sparkline';
import { Stat } from '../Stat';
import { Card } from '../Card';
// `?raw` inlines the committed token sources (the cascade dist/tokens.css
// concatenates) — same pattern as Badge.subtle-contrast.browser.test.ts.
import figmaTokensCss from '../../../tokens/figma-tokens.css?raw';
import figmaTokensDarkCss from '../../../tokens/figma-tokens-dark.css?raw';
import gapFillsCss from '../../../tokens/gap-fills.css?raw';
import themeBrandBrikGeneratedCss from '../../../tokens/theme-brand-brik.generated.css?raw';

/**
 * Axe gate for the Chart family (brik-bds#3182: "axe reports 0 violations").
 *
 * Storybook story tests in this repo render stories but do not fail on axe
 * (a story with its svg name removed still passes), so this mounts each chart
 * against the real token cascade, in both themes, opens the data table, and
 * runs axe-core over the whole document — violations AND contrast incompletes.
 */

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

let host: HTMLElement;
let root: Root;

beforeAll(() => {
  const style = document.createElement('style');
  style.textContent = [figmaTokensCss, figmaTokensDarkCss, gapFillsCss, themeBrandBrikGeneratedCss].join('\n\n');
  document.head.appendChild(style);
  document.body.classList.add('theme-brand-brik');
});

afterEach(async () => {
  await act(async () => {
    root?.unmount();
  });
  host?.remove();
  document.documentElement.removeAttribute('data-theme');
});

const h = React.createElement;
const settle = () => new Promise((r) => setTimeout(r, 150));

async function mount(element: ReactElement, theme: 'light' | 'dark') {
  if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  host = document.createElement('main');
  host.style.width = '720px';
  host.style.background = 'var(--bds-background-primary)';
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root.render(element);
  });
  // ResizeObserver measures the plot, then the chart draws.
  await act(settle);
}

/** Click the frame's "Show data table" toggle and return the revealed table. */
async function openTable(): Promise<HTMLTableElement> {
  const toggle = Array.from(host.querySelectorAll('button')).find((b) => b.textContent === 'Show data table');
  expect(toggle, 'no "Show data table" toggle').toBeTruthy();
  await act(async () => {
    toggle!.click();
  });
  expect(toggle!.getAttribute('aria-expanded')).toBe('true');
  const region = document.getElementById(toggle!.getAttribute('aria-controls')!);
  expect(region?.hidden).toBe(false);
  const table = region!.querySelector('table');
  expect(table, 'data table did not render').toBeTruthy();
  return table!;
}

async function audit(): Promise<string[]> {
  const results = await axe.run(host, { runOnly: { type: 'tag', values: AXE_TAGS } });
  const failures = results.violations.flatMap((v) =>
    v.nodes.map((n) => `${v.id} [${v.impact}] ${n.target.join(' ')} — ${n.failureSummary ?? ''}`),
  );
  // A contrast check axe could not finish is a failure when the ratio it did read is under AA.
  for (const n of results.incomplete.filter((v) => v.id === 'color-contrast').flatMap((v) => v.nodes)) {
    const d = (n.any[0]?.data ?? {}) as { contrastRatio?: number; fgColor?: string; bgColor?: string };
    if (typeof d.contrastRatio === 'number' && d.contrastRatio > 0 && d.contrastRatio < 4.5) {
      failures.push(`color-contrast (incomplete) ${n.target.join(' ')} ${d.fgColor} on ${d.bgColor} = ${d.contrastRatio}`);
    }
  }
  return failures;
}

const monthly = [
  { month: 'Jan', revenue: 18400, target: 20000 },
  { month: 'Feb', revenue: 21250, target: 20000 },
  { month: 'Mar', revenue: 19800, target: 21000 },
];
const services = [
  { service: 'Website maintenance and hosting', hours: 142 },
  { service: 'Brand identity refresh', hours: 96 },
];
const week = (n: number) => new Date(Date.UTC(2026, 8, 7 + n * 7));
const visits = [0, 1, 2, 3].map((n) => ({ week: week(n), organic: 1800 + n * 90, paid: 640 + n * 70 }));
const share = [
  { channel: 'Organic', visits: 2520 },
  { channel: 'Paid', visits: 1110 },
  { channel: 'Referral', visits: 470 },
];

const framed: Array<[string, () => ReactElement, string]> = [
  [
    'BarChart (column, single series)',
    () => h(BarChart, { title: 'Monthly revenue', data: monthly, categoryKey: 'month', series: [{ key: 'revenue', label: 'Revenue' }] }),
    'svg.bds-chart__svg rect.bds-chart__bar',
  ],
  [
    'BarChart (horizontal)',
    () =>
      h(BarChart, {
        title: 'Hours by service',
        data: services,
        categoryKey: 'service',
        series: [{ key: 'hours', label: 'Hours' }],
        orientation: 'horizontal',
      }),
    'svg.bds-chart__svg rect.bds-chart__bar',
  ],
  [
    'BarChart (grouped, legend)',
    () =>
      h(BarChart, {
        title: 'Revenue against target',
        data: monthly,
        categoryKey: 'month',
        series: [
          { key: 'revenue', label: 'Revenue', color: 'brand' },
          { key: 'target', label: 'Target', color: 'neutral' },
        ],
      }),
    '.bds-chart__legend',
  ],
  [
    'LineChart',
    () =>
      h(LineChart, {
        title: 'Weekly visits',
        data: visits,
        xKey: 'week',
        series: [
          { key: 'organic', label: 'Organic' },
          { key: 'paid', label: 'Paid' },
        ],
      }),
    'svg.bds-chart__svg path.bds-chart__line',
  ],
  [
    'DonutChart',
    () => h(DonutChart, { title: 'Traffic share', data: share, categoryKey: 'channel', valueKey: 'visits' }),
    'svg.bds-chart__svg path.bds-chart__slice',
  ],
];

describe.each(['light', 'dark'] as const)('Chart family — WCAG 2.1 AA, %s theme', (theme) => {
  it.each(framed)('%s: 0 axe violations with the data table open', async (_name, render, drawn) => {
    await mount(render(), theme);
    expect(host.querySelector(drawn), `${drawn} did not draw — the audit would be vacuous`).toBeTruthy();
    const table = await openTable();
    expect(table.querySelectorAll('tbody tr').length).toBeGreaterThan(0);
    // Every value cell carries text, and a numeric header aligns with its cells.
    for (const td of table.querySelectorAll('tbody td.bds-chart__cell--align-end')) {
      expect(td.textContent?.trim()).not.toBe('');
    }
    const numericHead = table.querySelector('th.bds-chart__cell--align-end')!;
    expect(getComputedStyle(numericHead).textAlign).toBe('end');
    expect(await audit()).toEqual([]);
  });

  it('Sparkline in a Stat: 0 axe violations, hidden table carries every value', async () => {
    const data = [12, 15, 14, 18];
    await mount(
      h(
        Card,
        null,
        h(Stat, {
          label: 'Weekly visits',
          value: '4,100',
          supplementary: h(Sparkline, { data, label: 'Weekly visits, last 4 weeks' }),
        }),
      ),
      theme,
    );
    const svg = host.querySelector('.bds-sparkline svg[role="img"]');
    expect(svg?.querySelector('path'), 'sparkline did not draw — the audit would be vacuous').toBeTruthy();
    expect(host.querySelectorAll('.bds-sparkline tbody tr')).toHaveLength(data.length);
    expect(await audit()).toEqual([]);
  });
});

describe('data table is reachable by keyboard', () => {
  it('the toggle is a focusable button that reveals the table', async () => {
    await mount(
      h(BarChart, { title: 'Monthly revenue', data: monthly, categoryKey: 'month', series: [{ key: 'revenue', label: 'Revenue' }] }),
      'light',
    );
    const toggle = Array.from(host.querySelectorAll('button')).find((b) => b.textContent === 'Show data table')!;
    toggle.focus();
    expect(document.activeElement).toBe(toggle);
    await openTable();
  });
});
