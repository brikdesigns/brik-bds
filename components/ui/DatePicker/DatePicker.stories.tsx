import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { DatePicker } from './DatePicker';

/**
 * DatePicker — date input with a Radix popover calendar. Supports min/max
 * range, helper text, error state, and three sizes.
 * @summary Date input with calendar popover
 */
const meta: Meta<typeof DatePicker> = {
  title: 'Components/Form/date-picker',
  component: DatePicker,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'text' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

/** Args-driven sandbox. Includes an interaction test that opens the calendar
 *  and clicks the first available day.
 *  @summary Live playground with interaction test */
export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { placeholder: 'Select a date', size: 'md' },
  render: (args) => {
    const Demo = () => {
      const [value, setValue] = useState<Date | null>(null);
      return <DatePicker {...args} value={value} onChange={setValue} />;
    };
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /select a date/i });
    await userEvent.click(trigger);

    const body = within(document.body);
    const dialog = await body.findByRole('dialog', {}, { timeout: 3000 });
    await expect(dialog).toBeVisible();

    const clickableDay = await waitFor(() => {
      const cells = within(dialog).getAllByRole('gridcell');
      const cell = cells.find((c) => !c.hasAttribute('disabled') && c.textContent?.trim());
      if (!cell) throw new Error('No clickable day cell found yet');
      return cell;
    }, { timeout: 3000 });

    await userEvent.click(clickableDay);
  },
};

/** Default — no label, just a placeholder. The minimal shape.
 *  @summary Default date picker */
export const Default: Story = {
  args: { placeholder: 'Select a date' },
};

/** With label and helper text — the canonical form-field shape.
 *  @summary Date picker with label and helper text */
export const WithLabel: Story = {
  args: {
    label: 'Appointment date',
    placeholder: 'Select a date',
    helperText: 'Choose your preferred appointment time',
    fullWidth: true,
  },
};

/** Error state — `error` overrides the helper line.
 *  @summary Date picker with error */
export const WithError: Story = {
  args: {
    label: 'Due date',
    placeholder: 'Select a date',
    error: 'A due date is required',
    fullWidth: true,
  },
};

/* ─── Sizes ──────────────────────────────────────────────────── */

/** Small size — compact form rows.
 *  @summary Small size */
export const Small: Story = {
  args: { size: 'sm', label: 'Start date', placeholder: 'Select a date', fullWidth: true },
};

/** Large size — prominent date selection (e.g. booking flows).
 *  @summary Large size */
export const Large: Story = {
  args: { size: 'lg', label: 'End date', placeholder: 'Select a date', fullWidth: true },
};

/* ─── Range constraints ──────────────────────────────────────── */

/** With `minDate` and `maxDate` — constrains the calendar to a date window.
 *  @summary Constrained date range */
export const MinMaxDate: Story = {
  args: {
    label: 'Schedule date',
    placeholder: 'Select a date',
    helperText: 'Must be within the next 30 days',
    fullWidth: true,
  },
  render: (args) => {
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return <DatePicker {...args} minDate={minDate} maxDate={maxDate} />;
  },
};

/* ─── Layout ─────────────────────────────────────────────────── */

/** Disabled — non-interactive trigger.
 *  @summary Disabled date picker */
export const Disabled: Story = {
  args: { label: 'Locked date', placeholder: 'Not available', disabled: true, fullWidth: true },
};

/** Full-width — trigger stretches to fill its container.
 *  @summary Full-width date picker */
export const FullWidth: Story = {
  args: {
    label: 'Project deadline',
    placeholder: 'Select a date',
    helperText: 'This date will be visible to all team members',
    fullWidth: true,
  },
  decorators: [(Story) => <div style={{ width: 480 }}><Story /></div>],
};
