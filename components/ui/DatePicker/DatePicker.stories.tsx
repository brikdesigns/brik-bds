import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { DatePicker } from './DatePicker';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof DatePicker> = {
  title: 'Components/date-picker',
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
    precision: {
      control: 'select',
      options: ['day', 'month'],
      description:
        "Selection granularity. `'month'` renders a 12-month grid with year navigation instead of the day grid, and snaps `onChange` to the first of the selected month. Default `'day'`.",
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

/* ═══════════════════════════════════════════════════════════════
   MONTH — precision="month" starting template (ADR-010 Q3: selecting
   month precision is a semantic starting point, not a boolean toggle).
   Renders the 12-month grid + year nav in place of the day grid; the
   play function exercises the portal mount, a month-cell click, and
   the "<Month> <Year>" trigger label.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Month-precision variant — 12-month grid with year navigation */
export const Month: Story = {
  args: {
    size: 'md',
    precision: 'month',
    placeholder: 'Select a month',
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
    const trigger = canvas.getByRole('button', { name: /select a month/i });

    // Open the month grid
    await userEvent.click(trigger);

    const body = within(document.body);
    const dialog = await body.findByRole('dialog', {}, { timeout: 3000 });
    await expect(dialog).toBeVisible();

    const clickableMonth = await waitFor(
      () => {
        const cells = within(dialog).getAllByRole('gridcell');
        // No day-of-week header, no day grid in month mode — exactly 12 cells.
        if (cells.length !== 12) throw new Error(`Expected 12 month cells, got ${cells.length}`);
        const cell = cells.find((c) => !c.hasAttribute('disabled'));
        if (!cell) throw new Error('No clickable month cell found yet');
        return cell;
      },
      { timeout: 3000 },
    );

    await userEvent.click(clickableMonth);

    // Trigger now reads "<Month> <Year>" instead of the placeholder.
    await waitFor(() => {
      expect(trigger.textContent).toMatch(/[A-Z][a-z]+ \d{4}/);
    });
  },
};

/* ═══════════════════════════════════════════════════════════════
   INTERACTION TESTS — play-only, excluded from the MCP manifest +
   sidebar gallery (ADR-010 rule 5). Cover onChange snapping to the
   first of month and minDate/maxDate month-granularity gating, which
   Default's and Month's visual play functions don't assert.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Selecting a month fires `onChange(new Date(year, monthIndex, 1))` —
 * day 1, time zeroed.
 * @summary Play-function interaction test
 */
export const InteractionTestMonthSelectionSnapsToFirstOfMonth: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    precision: 'month',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /select a date/i });
    await userEvent.click(trigger);

    const body = within(document.body);
    const dialog = await body.findByRole('dialog', {}, { timeout: 3000 });

    const juneCell = await waitFor(
      () => within(dialog).getByRole('gridcell', { name: /^june/i }),
      { timeout: 3000 },
    );
    await userEvent.click(juneCell);

    const year = new Date().getFullYear();
    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(new Date(year, 5, 1));
    });
  },
};

/**
 * `minDate`/`maxDate` disable any month whose entire span falls outside
 * the range — a month straddling the boundary stays selectable.
 * @summary Play-function interaction test
 */
export const InteractionTestMonthMinMaxGating: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    precision: 'month',
    value: new Date(2026, 3, 1),
    minDate: new Date(2026, 2, 1),
    maxDate: new Date(2026, 4, 31),
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /april 2026/i });
    await userEvent.click(trigger);

    const body = within(document.body);
    const dialog = await body.findByRole('dialog', {}, { timeout: 3000 });

    const jan = await waitFor(
      () => within(dialog).getByRole('gridcell', { name: /^january/i }),
      { timeout: 3000 },
    );
    const mar = within(dialog).getByRole('gridcell', { name: /^march/i });
    const may = within(dialog).getByRole('gridcell', { name: /^may/i });
    const dec = within(dialog).getByRole('gridcell', { name: /^december/i });

    expect(jan).toBeDisabled();
    expect(dec).toBeDisabled();
    expect(mar).not.toBeDisabled();
    expect(may).not.toBeDisabled();
  },
};
