import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { DateTime } from './DateTime';

/**
 * DateTime — a rendered date, zone-labelled timestamp, or relative age,
 * always inside a `<time dateTime>`.
 * @summary A date, zone-labelled timestamp, or relative age
 */
const meta: Meta<typeof DateTime> = {
  title: 'Content/date-time',
  component: DateTime,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    value: { control: 'text', description: 'ISO string, `Date`, or epoch ms. Empty renders `emptyLabel`.' },
    mode: {
      control: 'select',
      options: ['date', 'timestamp', 'relative'],
      description: '`date` = calendar day; `timestamp` = zone-labelled instant; `relative` = age, exact time in `title`.',
    },
    timeZone: { control: 'text', description: 'IANA zone to display in. Omit for the runtime zone.' },
    now: { control: false, description: 'Reference instant for `relative`. Default: current time.' },
    emptyLabel: { control: 'text', description: 'Text rendered when `value` is empty. Default `—`.' },
  },
};

export default meta;
type Story = StoryObj<typeof DateTime>;

const INSTANT = '2026-11-06T20:30:00Z';
const NOW = '2026-11-09T20:30:00Z';

/**
 * The calendar day — what a Field shows for a due date or start date.
 * @summary A calendar day
 */
export const Default: Story = {
  args: { value: '2026-11-06', mode: 'date' },
};

/**
 * A zone-labelled instant — what a Field shows for a moment in time.
 * @summary A timestamp ending in a zone label
 */
export const Timestamp: Story = {
  args: { value: INSTANT, mode: 'timestamp', timeZone: 'America/Chicago' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('time')).toHaveTextContent(/CST$/);
  },
};

/**
 * An age — what a feed row or card meta line shows. Hover reveals the
 * exact zone-labelled timestamp.
 * @summary An age with the exact timestamp on hover
 */
export const Relative: Story = {
  args: { value: INSTANT, mode: 'relative', timeZone: 'America/Chicago', now: new Date(NOW) },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('time')).toHaveAttribute('title', 'Nov 6, 2026, 2:30 PM CST');
  },
};

/**
 * No value — renders the empty label, never a `<time>`.
 * @summary The empty value
 */
export const Empty: Story = {
  args: { value: null },
};
