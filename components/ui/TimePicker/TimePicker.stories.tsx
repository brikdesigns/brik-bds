import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { TimePicker } from './TimePicker';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof TimePicker> = {
  title: 'Components/Form/time-picker',
  component: TimePicker,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'text' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
    minuteStep: { control: 'number' },
    use24Hour: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: {
    placeholder: 'Select time',
    size: 'md',
    value: '09:00',
  },
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '09:00');
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

/* ═══════════════════════════════════════════════════════════════
   2. DEFAULT — 12-hour format
   ═══════════════════════════════════════════════════════════════ */

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('09:00');
    return (
      <div style={{ width: 280 }}>
        <TimePicker
          placeholder="Select time"
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. WITH LABEL — Label + helper text
   ═══════════════════════════════════════════════════════════════ */

export const WithLabel: Story = {
  render: () => {
    const [value, setValue] = useState('09:00');
    return (
      <div style={{ width: 280 }}>
        <TimePicker
          label="Start Time"
          placeholder="Select time"
          helperText="Appointment will be scheduled at this time"
          value={value}
          onChange={setValue}
          fullWidth
        />
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   4. WITH ERROR — Error state
   ═══════════════════════════════════════════════════════════════ */

export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState('09:00');
    return (
      <div style={{ width: 280 }}>
        <TimePicker
          label="End Time"
          placeholder="Select time"
          error="End time must be after start time"
          value={value}
          onChange={setValue}
          fullWidth
        />
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   5. 24-HOUR FORMAT
   ═══════════════════════════════════════════════════════════════ */

export const TwentyFourHour: Story = {
  render: () => {
    const [value, setValue] = useState('14:30');
    return (
      <div style={{ width: 280 }}>
        <TimePicker
          label="Time (24h)"
          value={value}
          onChange={setValue}
          use24Hour
          fullWidth
        />
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   6. MINUTE STEP — 5-minute intervals
   ═══════════════════════════════════════════════════════════════ */

export const MinuteStep: Story = {
  render: () => {
    const [value, setValue] = useState('09:00');
    return (
      <div style={{ width: 280 }}>
        <TimePicker
          label="Appointment Time"
          helperText="Available in 5-minute intervals"
          value={value}
          onChange={setValue}
          minuteStep={5}
          fullWidth
        />
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   7. MINUTE STEP 15 — Quarter-hour intervals
   ═══════════════════════════════════════════════════════════════ */

export const QuarterHour: Story = {
  render: () => {
    const [value, setValue] = useState('09:00');
    return (
      <div style={{ width: 280 }}>
        <TimePicker
          label="Meeting Time"
          helperText="15-minute blocks"
          value={value}
          onChange={setValue}
          minuteStep={15}
          fullWidth
        />
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   8. DISABLED
   ═══════════════════════════════════════════════════════════════ */

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <TimePicker
        label="Locked Time"
        value="08:00"
        disabled
        fullWidth
      />
    </div>
  ),
};

