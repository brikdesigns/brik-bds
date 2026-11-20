import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Calendar, type CalendarEvent } from './Calendar';
import { Select } from '../Select';
import { Button } from '../Button';

/* ─── Sample data ─────────────────────────────────────────────── */

/* Fixed month, away from today, so the grid and visual baselines never move. */
const INITIAL_DATE = '2026-03-02';

const events: CalendarEvent[] = [
  { id: '1', title: 'Spring newsletter', start: '2026-03-03T09:00', tone: 'positive' },
  { id: '2', title: 'Launch post', start: '2026-03-04T11:00', tone: 'warning' },
  { id: '3', title: 'Webinar reminder', start: '2026-03-04T15:00' },
  { id: '4', title: 'Promo email', start: '2026-03-10T10:00', tone: 'negative' },
  { id: '5', title: 'Instagram carousel', start: '2026-03-12T13:00', color: 'purple' },
  { id: '6', title: 'Blog: patient FAQ', start: '2026-03-17T08:30', color: 'blue' },
  { id: '7', title: 'Office closed', start: '2026-03-20', allDay: true, color: 'orange' },
  { id: '8', title: 'Review request', start: '2026-03-25T12:00', tone: 'positive' },
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

const meta: Meta<typeof Calendar> = {
  // #2148: joins the date/time family (date-picker, time-picker, period-nav) under
  // `Components/`. A date grid is a control, not a bounded holder (ADR-006 amendment
  // 2026-11-12). Revisit if the built component gains its own border/elevation.
  title: 'Components/calendar',
  component: Calendar,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: 1200 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    events,
    initialDate: INITIAL_DATE,
  },
  argTypes: {
    events: { control: false, description: 'Events to show. Each takes `tone` (status) or `color` (category) for its fill.' },
    views: { control: 'check', options: ['month', 'week'], description: 'Views offered in the toolbar switch. One view hides the switch.' },
    defaultView: { control: 'inline-radio', options: ['month', 'week'], description: 'View shown first. Default the first of `views`.' },
    initialDate: { control: 'text', description: 'Date shown first. Default today.' },
    onEventClick: { action: 'eventClick', description: 'Activated by click, Enter or Space. Makes events focusable.' },
    onEventMove: { control: false, description: 'Passing it turns drag-to-reschedule on. Reject to put the event back.' },
    renderEvent: { control: false, description: 'Event body. Default the event title.' },
    filters: { control: false, description: 'Filter controls for the toolbar (`Select`, `FilterButton`).' },
    activeFilterCount: { control: 'number', description: 'Shown as `Filters (N)` when the toolbar collapses.' },
    actions: { control: false, description: 'Trailing toolbar actions (never `primary`).' },
    titleAs: { control: 'inline-radio', options: ['h2', 'h3'], description: 'Toolbar title element. `h3` under an existing `<h2>`.' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'], description: 'Toolbar control size. Default `sm`.' },
    allDaySlot: { control: 'boolean', description: 'Week view: the all-day row above the time grid.' },
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

/* ─── Stories ─────────────────────────────────────────────────── */

/** @summary Month grid with toolbar and tone- and color-filled events */
export const Default: Story = {};

/** @summary Week time grid, events placed at their start time */
export const Week: Story = {
  args: { defaultView: 'week' },
};

/** @summary Filters and an action in the toolbar row */
export const WithFilters: Story = {
  args: {
    activeFilterCount: 1,
    filters: (
      <>
        <Select aria-label="Filter by company" options={companyOptions} />
        <Select aria-label="Filter by channel" options={channelOptions} defaultValue="email" />
      </>
    ),
    actions: <Button variant="secondary">Export</Button>,
  },
};

/** @summary Drag an event to a new day; reject to snap it back */
export const Reschedule: Story = {
  args: {
    onEventMove: fn(),
  },
};

/** @summary Custom event body: title plus a meta line */
export const CustomEvent: Story = {
  args: {
    renderEvent: (event) => (
      <>
        <strong>{event.title}</strong>
        <span>Email · Scheduled</span>
      </>
    ),
  },
};

/** @summary Next / Today step the grid and update the title */
export const InteractionTestNavigation: Story = {
  tags: ['!manifest', 'interaction-test'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('heading', { name: 'March 2026' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(await canvas.findByRole('heading', { name: 'April 2026' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('radio', { name: 'Week' }));
    await expect(canvas.getByRole('heading', { level: 2 })).not.toHaveTextContent('April 2026');
  },
};
