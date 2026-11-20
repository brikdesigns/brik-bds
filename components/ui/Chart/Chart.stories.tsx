import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { DonutChart } from './DonutChart';
import { Sparkline } from './Sparkline';
import { Stat } from '../Stat';
import { Card } from '../Card';

/* ─── Sample data ─────────────────────────────────────────────── */

const monthlyRevenue = [
  { month: 'Jan', revenue: 18400, target: 20000 },
  { month: 'Feb', revenue: 21250, target: 20000 },
  { month: 'Mar', revenue: 19800, target: 21000 },
  { month: 'Apr', revenue: 24100, target: 21000 },
  { month: 'May', revenue: 26350, target: 22000 },
  { month: 'Jun', revenue: 23900, target: 22000 },
];

const servicesByHours = [
  { service: 'Website maintenance and hosting', hours: 142 },
  { service: 'Brand identity refresh', hours: 96 },
  { service: 'Search engine optimisation', hours: 74 },
  { service: 'Email campaign production', hours: 51 },
  { service: 'Photography direction', hours: 23 },
];

const week = (n: number) => new Date(Date.UTC(2026, 8, 7 + n * 7));
const weeklyVisits = [
  { week: week(0), organic: 1820, paid: 640, referral: 310 },
  { week: week(1), organic: 1910, paid: 720, referral: 290 },
  { week: week(2), organic: 2050, paid: 810, referral: 350 },
  { week: week(3), organic: 1980, paid: 905, referral: 330 },
  { week: week(4), organic: 2240, paid: 870, referral: 410 },
  { week: week(5), organic: 2390, paid: 960, referral: 380 },
  { week: week(6), organic: 2310, paid: 1040, referral: 450 },
  { week: week(7), organic: 2520, paid: 1110, referral: 470 },
];

const invoiceStatus = [
  { status: 'Paid', count: 42 },
  { status: 'Due', count: 11 },
  { status: 'Overdue', count: 4 },
];

const trafficShare = [
  { channel: 'Organic', visits: 2520 },
  { channel: 'Paid', visits: 1110 },
  { channel: 'Referral', visits: 470 },
  { channel: 'Social', visits: 260 },
];

const dollars = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const weekLabels = weeklyVisits.map((d) =>
  d.week.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
);

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof BarChart> = {
  title: 'Components/chart',
  component: BarChart,
  tags: ['surface-shared'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text', description: 'Chart title — rendered as an `<h2>`' },
    description: { control: 'text', description: 'One line under the title — period, unit, source' },
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      description: '`vertical` (column, default) or `horizontal` (bar, for long labels)',
    },
    stacked: { control: 'boolean', description: 'Stack the series into one bar per category instead of grouping them' },
    height: { control: { type: 'number', min: 120, max: 480, step: 20 }, description: 'Plot height in px' },
    loading: { control: 'boolean', description: 'Render the loading skeleton' },
    error: { control: 'text', description: 'Render an error Banner with this message' },
    empty: { control: 'boolean', description: 'Render the empty state' },
    data: { control: false },
    series: { control: false },
    categoryKey: { control: false },
    valueFormatter: { control: false, description: 'Formats axis, tooltip and table values. Set via code.' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BarChart>;

/* ─── Default — single-series column ──────────────────────────── */

/** @summary Single-series column chart — no legend, title names it */
export const Default: Story = {
  args: {
    title: 'Monthly revenue',
    description: 'January – June 2026',
    data: monthlyRevenue,
    categoryKey: 'month',
    series: [{ key: 'revenue', label: 'Revenue' }],
    valueFormatter: dollars,
  },
};

/** @summary Horizontal bar — long category labels */
export const Horizontal: Story = {
  args: {
    title: 'Hours by service',
    description: 'Last 90 days',
    data: servicesByHours,
    categoryKey: 'service',
    series: [{ key: 'hours', label: 'Hours' }],
    orientation: 'horizontal',
    valueAxisLabel: 'Hours logged',
  },
};

/** @summary Grouped columns — two series with a toggling legend */
export const GroupedSeries: Story = {
  args: {
    title: 'Revenue against target',
    description: 'January – June 2026',
    data: monthlyRevenue,
    categoryKey: 'month',
    series: [
      { key: 'revenue', label: 'Revenue', color: 'brand' },
      { key: 'target', label: 'Target', color: 'neutral' },
    ],
    valueFormatter: dollars,
  },
};

const serviceLines = ['Brand', 'Web', 'SEO', 'Content', 'Social', 'Reporting'];
const engagementsByStatus = serviceLines.map((line, i) => ({
  line,
  active: 6 + ((i * 3) % 5),
  onboarding: 2 + (i % 3),
  paused: 1 + ((i + 1) % 2),
  completed: 4 + ((i * 2) % 6),
}));

/** @summary Stacked columns — 6 categories, 4 series */
export const Stacked: Story = {
  args: {
    title: 'Engagements by service line',
    description: 'Split by delivery status',
    data: engagementsByStatus,
    categoryKey: 'line',
    stacked: true,
    series: [
      { key: 'active', label: 'Active' },
      { key: 'onboarding', label: 'Onboarding' },
      { key: 'paused', label: 'Paused' },
      { key: 'completed', label: 'Completed' },
    ],
    valueAxisLabel: 'Engagements',
  },
};

/* ─── LineChart ───────────────────────────────────────────────── */

/** @summary Line chart — three series labelled at their ends */
export const Line: Story = {
  render: () => (
    <LineChart
      title="Weekly visits by channel"
      description="Last 8 weeks"
      data={weeklyVisits}
      xKey="week"
      series={[
        { key: 'organic', label: 'Organic' },
        { key: 'paid', label: 'Paid' },
        { key: 'referral', label: 'Referral' },
      ]}
      yAxisLabel="Visits"
    />
  ),
};

/* ─── DonutChart ──────────────────────────────────────────────── */

/** @summary Donut — share of a whole, total in the centre */
export const Donut: Story = {
  render: () => (
    <DonutChart
      title="Traffic share"
      description="Week of Oct 26"
      data={trafficShare}
      categoryKey="channel"
      valueKey="visits"
      centerLabel="Visits"
    />
  ),
};

/** @summary Status donut — slices coloured by valence */
export const StatusDonut: Story = {
  render: () => (
    <DonutChart
      title="Invoices by status"
      data={invoiceStatus}
      categoryKey="status"
      valueKey="count"
      centerLabel="Invoices"
      categoryLabel="Status"
      colors={{ Paid: 'positive', Due: 'warning', Overdue: 'negative' }}
    />
  ),
};

/* ─── Sparkline ───────────────────────────────────────────────── */

/** @summary Sparkline in a Stat's supplementary slot */
export const SparklineInStat: Story = {
  render: () => (
    <div style={{ maxWidth: 280 }}>
      <Card>
        <Stat
          label="Weekly visits"
          value="4,100"
          order="label-first"
          trend={{ direction: 'up', delta: '+6% vs last week' }}
          supplementary={
            <Sparkline
              data={weeklyVisits.map((d) => d.organic + d.paid + d.referral)}
              pointLabels={weekLabels}
              label="Weekly visits, last 8 weeks"
            />
          }
        />
      </Card>
    </div>
  ),
};

/* ─── States — loading, empty, error via the DataView shell ───── */

/** @summary Loading — the DataView skeleton fills the plot */
export const Loading: Story = {
  args: { ...Default.args, loading: true },
};

/** @summary Empty — no rows renders the empty state */
export const Empty: Story = {
  args: {
    ...Default.args,
    data: [],
    emptyState: { title: 'No revenue yet', description: 'Invoices paid this period appear here.' },
  },
};

/** @summary Error — a negative Banner replaces the plot */
export const ErrorState: Story = {
  args: { ...Default.args, error: 'The revenue report timed out. Try again in a minute.' },
};

/* ─── Dark theme — each chart in brik-dark ────────────────────── */

/** @summary Grouped columns in the dark theme */
export const BarDark: Story = {
  ...GroupedSeries,
  globals: { themeNumber: 'brik-dark' },
};

/** @summary Line chart in the dark theme */
export const LineDark: Story = {
  ...Line,
  globals: { themeNumber: 'brik-dark' },
};

/** @summary Donut in the dark theme */
export const DonutDark: Story = {
  ...Donut,
  globals: { themeNumber: 'brik-dark' },
};

/** @summary Sparkline in a Stat, dark theme */
export const SparklineDark: Story = {
  ...SparklineInStat,
  globals: { themeNumber: 'brik-dark' },
};
