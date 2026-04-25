import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { TimePicker } from './TimePicker';

/* ─── Layout Helpers (story-only) ─────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{
    fontFamily: 'var(--font-family-label)',
    fontSize: 'var(--body-xs)', // bds-lint-ignore
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 'var(--gap-md)',
    color: 'var(--text-muted)',
  }}>
    {children}
  </div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

const Row = ({ children, gap = 'var(--padding-sm)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', gap, flexWrap: 'wrap', alignItems: 'flex-start' }}>{children}</div>
);

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof TimePicker> = {
  title: 'Components/Form/time-picker',
  component: TimePicker,
  tags: ['surface-shared'],
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

/* ═══════════════════════════════════════════════════════════════
   9. VARIANTS — All sizes and states at a glance
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => {
    const [sm, setSm] = useState('09:00');
    const [md, setMd] = useState('14:30');
    const [lg, setLg] = useState('17:00');
    const [errVal, setErrVal] = useState('09:00');

    return (
      <div style={{ width: 480 }}>
        <Stack>
          {/* Sizes */}
          <div>
            <SectionLabel>Sizes</SectionLabel>
            <Stack gap="var(--gap-lg)">
              <TimePicker size="sm" label="Small (sm)" value={sm} onChange={setSm} fullWidth />
              <TimePicker size="md" label="Medium (md) — default" value={md} onChange={setMd} fullWidth />
              <TimePicker size="lg" label="Large (lg)" value={lg} onChange={setLg} fullWidth />
            </Stack>
          </div>

          {/* States */}
          <div>
            <SectionLabel>States</SectionLabel>
            <Stack gap="var(--gap-lg)">
              <TimePicker label="Default" value="09:00" onChange={() => {}} fullWidth />
              <TimePicker label="Helper text" value="09:00" helperText="Pick the best time" onChange={() => {}} fullWidth />
              <TimePicker label="Error" error="Time is required" value={errVal} onChange={setErrVal} fullWidth />
              <TimePicker label="Disabled" value="08:00" disabled fullWidth />
            </Stack>
          </div>

          {/* Format */}
          <div>
            <SectionLabel>Format</SectionLabel>
            <Row gap="var(--gap-lg)">
              <div style={{ flex: 1 }}>
                <TimePicker label="12-hour" value="14:30" onChange={() => {}} fullWidth />
              </div>
              <div style={{ flex: 1 }}>
                <TimePicker label="24-hour" value="14:30" onChange={() => {}} use24Hour fullWidth />
              </div>
            </Row>
          </div>

          {/* Form context — Start/End pair */}
          <div>
            <SectionLabel>Form context — Start / End pair</SectionLabel>
            <Row gap="var(--gap-lg)">
              <div style={{ flex: 1 }}>
                <TimePicker size="sm" label="Start Time" value="09:00" onChange={() => {}} fullWidth />
              </div>
              <div style={{ flex: 1 }}>
                <TimePicker size="sm" label="End Time" value="10:00" onChange={() => {}} fullWidth />
              </div>
            </Row>
          </div>
        </Stack>
      </div>
    );
  },
};
