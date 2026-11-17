import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CalendarToolbar } from './CalendarToolbar';
import { Select } from '../Select';
import { Button } from '../Button';

/* ─── Sample data ─────────────────────────────────────────────── */

const views = [
  { label: 'Month', value: 'month' },
  { label: 'Week', value: 'week' },
];

const companyOptions = [
  { value: '', label: 'All companies' },
  { value: 'acme', label: 'Acme Co' },
  { value: 'beacon', label: 'Beacon Health' },
];

const channelOptions = [
  { value: '', label: 'All channels' },
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Social' },
];

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof CalendarToolbar> = {
  title: 'Components/calendar-toolbar',
  component: CalendarToolbar,
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: 1200, minHeight: 240 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    title: { control: 'text', description: 'Current period, e.g. "November 2026". Announced politely when it changes.' },
    titleAs: { control: 'inline-radio', options: ['h2', 'h3'], description: 'Heading element. `h3` when nested under an existing `<h2>`.' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'], description: 'Height of every control in the bar. Default `sm`, matching FilterBar.' },
    onPrev: { action: 'prev', description: 'Step to the previous period.' },
    onToday: { action: 'today', description: 'Jump to the current period.' },
    onNext: { action: 'next', description: 'Step to the next period.' },
    prevLabel: { control: 'text', description: 'Accessible name of the previous icon button. Default "Previous".' },
    nextLabel: { control: 'text', description: 'Accessible name of the next icon button. Default "Next".' },
    todayLabel: { control: 'text', description: 'Visible text of the Today button. Default "Today".' },
    viewLabel: { control: 'text', description: 'Accessible name of the view switch. Default "Calendar view".' },
    views: { control: false, description: 'View-switch segments. Omit for no switch.' },
    view: { control: false, description: 'Selected view value.' },
    onViewChange: { control: false, description: 'Called with the new view value.' },
    children: { control: false, description: 'Filter controls (Select / FilterButton / FilterToggle). Children without a `size` receive the toolbar size. Fold into a `Filters` popover below ~600px own width.' },
    activeFilterCount: { control: 'number', description: 'Shown as `Filters (N)` when collapsed.' },
    actions: { control: false, description: 'Trailing actions; stay visible when collapsed.' },
  },
  args: { title: 'November 2026', onPrev: fn(), onToday: fn(), onNext: fn() },
};

export default meta;
type Story = StoryObj<typeof CalendarToolbar>;

function Demo(args: React.ComponentProps<typeof CalendarToolbar>) {
  const [view, setView] = useState('month');
  const [company, setCompany] = useState('');
  const [channel, setChannel] = useState('');
  return (
    <CalendarToolbar
      {...args}
      views={views}
      view={view}
      onViewChange={setView}
      activeFilterCount={(company ? 1 : 0) + (channel ? 1 : 0)}
    >
      <Select
        aria-label="Filter by company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        options={companyOptions}
      />
      <Select
        aria-label="Filter by channel"
        value={channel}
        onChange={(e) => setChannel(e.target.value)}
        options={channelOptions}
      />
    </CalendarToolbar>
  );
}

/** @summary Nav, title, filters and Month/Week switch in one row */
export const Default: Story = {
  render: (args) => <Demo {...args} />,
};

/** @summary No filters: the view switch takes the flush-right slot */
export const NoFilters: Story = {
  args: { views, view: 'month' },
};

/** @summary With a trailing secondary action after the view switch */
export const WithActions: Story = {
  render: (args) => (
    <CalendarToolbar {...args} views={views} view="week" actions={<Button variant="secondary">Export</Button>}>
      <Select aria-label="Filter by channel" options={channelOptions} />
    </CalendarToolbar>
  ),
};

/* Below ~600px of own width (ADR-019) the filters fold into `Filters (N)`;
   navigation, title and the view switch stay. */

/** @summary Below 600px: filters fold into a popover, the rest stays */
export const Collapsed: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 420, minHeight: 320 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => <Demo {...args} />,
};

/** @summary Verifies one row, one control height, and the nav contract */
export const InteractionTestOneRowSameHeight: Story = {
  tags: ['!manifest', 'interaction-test'],
  decorators: [(Story) => <div style={{ width: 1000 }}><Story /></div>],
  render: (args) => <Demo {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const height = (el: Element) => el.getBoundingClientRect().height;
    const prev = canvas.getByRole('button', { name: 'Previous' });
    const today = canvas.getByRole('button', { name: 'Today' });
    const next = canvas.getByRole('button', { name: 'Next' });
    const selects = canvas.getAllByRole('combobox');
    const monthSegment = canvas.getByText('Month');
    const track = monthSegment.closest('.bds-segmented-control')!;

    // One control height: icon buttons, text button, selects, view switch.
    const h = height(today);
    for (const el of [prev, next, ...selects, track]) await expect(height(el)).toBe(h);

    // One row: every control shares a vertical centre.
    const mid = (el: Element) => el.getBoundingClientRect().top + height(el) / 2;
    for (const el of [prev, next, ...selects, track]) await expect(Math.abs(mid(el) - mid(today))).toBeLessThan(1);

    // Order: nav, then filters, then the view switch at the right.
    await expect(next.getBoundingClientRect().right).toBeLessThanOrEqual(selects[0].getBoundingClientRect().left);
    await expect(selects[1].getBoundingClientRect().right).toBeLessThanOrEqual(track.getBoundingClientRect().left);

    // Nav is wired and the group is labelled.
    await userEvent.click(prev);
    await userEvent.click(today);
    await userEvent.click(next);
    await expect(args.onPrev).toHaveBeenCalledTimes(1);
    await expect(args.onToday).toHaveBeenCalledTimes(1);
    await expect(args.onNext).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('radiogroup', { name: 'Calendar view' })).toBeInTheDocument();
  },
};
