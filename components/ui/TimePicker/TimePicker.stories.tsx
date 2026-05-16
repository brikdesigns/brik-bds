import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { TimePicker } from './TimePicker';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof TimePicker> = {
  title: 'Blocks/time-picker',
  component: TimePicker,
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
      description: 'Trigger placeholder when no time is selected. Default `Select time`.',
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
    minuteStep: {
      control: 'number',
      description:
        'Minute increment for the minute column. Use `5` for 5-minute, `15` for quarter-hour, `30` for half-hour blocks. Default `1`.',
    },
    use24Hour: {
      control: 'boolean',
      description:
        'Render the picker in 24-hour mode (hours 00–23, no AM/PM column). Default `false` (12-hour with AM/PM).',
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
type Story = StoryObj<typeof TimePicker>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 §components without
   a variant axis. Render wraps TimePicker in `useState` so the canvas
   is fully interactive (TimePicker is controlled). The play function
   exercises the Radix Popover portal mount.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Themed time picker with Radix Popover scroll columns */
export const Default: Story = {
  args: {
    size: 'md',
    placeholder: 'Select time',
    minuteStep: 1,
    use24Hour: false,
  },
  render: (args) => {
    const [value, setValue] = useState('09:00');
    return (
      <div style={{ width: 280 }}>
        <TimePicker {...args} value={value} onChange={setValue} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button');

    // Open time picker
    await userEvent.click(trigger);

    // Popover opens in a Radix portal — default findBy timeout (1s) is too
    // tight under parallel browser-vitest load. 3s absorbs render + animation.
    const body = within(document.body);
    const dialog = await body.findByRole('dialog', {}, { timeout: 3000 });
    await expect(dialog).toBeVisible();
  },
};
