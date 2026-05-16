import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { DatePicker } from './DatePicker';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof DatePicker> = {
  title: 'Blocks/date-picker',
  component: DatePicker,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description:
        'Trigger height — matches the BDS form-input scale (`sm`=32px, `md`=40px, `lg`=48px). Default `md`.',
    },
    label: {
      control: 'text',
      description:
        'Optional label rendered above the trigger. Wired to the trigger via `htmlFor` so clicking the label focuses the trigger.',
    },
    placeholder: {
      control: 'text',
      description: 'Trigger placeholder when no date is selected. Default `Select a date`.',
    },
    helperText: {
      control: 'text',
      description: 'Helper text rendered below the trigger when no `error` is set.',
    },
    error: {
      control: 'text',
      description:
        'Error message — non-empty value triggers error styling, announces via `role="alert"`, and suppresses `helperText`.',
    },
    minDate: {
      control: 'date',
      description: 'Earliest selectable date. Days before are disabled in the grid.',
    },
    maxDate: {
      control: 'date',
      description: 'Latest selectable date. Days after are disabled in the grid.',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretches the trigger to fill its container.',
    },
    disabled: {
      control: 'boolean',
      description: 'Locks the trigger — non-interactive, muted appearance, popover does not open.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 §components without
   a variant axis. Render wraps DatePicker in `useState` so the canvas
   is fully interactive (DatePicker is controlled). The play function
   exercises the Radix Popover portal mount + day-grid render timing.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Themed date picker with Radix Popover calendar */
export const Default: Story = {
  args: {
    size: 'md',
    placeholder: 'Select a date',
  },
  render: (args) => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <div style={{ width: 280 }}>
        <DatePicker
          {...args}
          minDate={args.minDate ? new Date(args.minDate as unknown as number) : undefined}
          maxDate={args.maxDate ? new Date(args.maxDate as unknown as number) : undefined}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /select a date/i });

    // Open calendar
    await userEvent.click(trigger);

    // Calendar opens in a Radix portal — default findBy timeout (1s) is too
    // tight under parallel browser-vitest load. 3s absorbs render + animation.
    const body = within(document.body);
    const dialog = await body.findByRole('dialog', {}, { timeout: 3000 });
    await expect(dialog).toBeVisible();

    // Wait for the day grid to mount; cells render asynchronously after the
    // dialog opens. Poll for a clickable cell instead of querying once.
    const clickableDay = await waitFor(
      () => {
        const cells = within(dialog).getAllByRole('gridcell');
        const cell = cells.find((c) => !c.hasAttribute('disabled') && c.textContent?.trim());
        if (!cell) throw new Error('No clickable day cell found yet');
        return cell;
      },
      { timeout: 3000 },
    );

    await userEvent.click(clickableDay);
  },
};
