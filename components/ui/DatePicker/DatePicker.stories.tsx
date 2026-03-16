import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from './DatePicker';

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

const meta: Meta<typeof DatePicker> = {
  title: 'Components/Form/date-picker',
  component: DatePicker,
  parameters: { layout: 'centered' },
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

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    placeholder: 'Select a date',
    size: 'md',
  },
  render: (args) => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <div style={{ width: 280 }}>
        <DatePicker {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. DEFAULT — No label, clean trigger
   ═══════════════════════════════════════════════════════════════ */

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <div style={{ width: 280 }}>
        <DatePicker
          placeholder="Select a date"
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
    const [value, setValue] = useState<Date | null>(null);
    return (
      <div style={{ width: 280 }}>
        <DatePicker
          label="Appointment date"
          placeholder="Select a date"
          helperText="Choose your preferred appointment time"
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
    const [value, setValue] = useState<Date | null>(null);
    return (
      <div style={{ width: 280 }}>
        <DatePicker
          label="Due date"
          placeholder="Select a date"
          error="A due date is required"
          value={value}
          onChange={setValue}
          fullWidth
        />
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   5. SMALL — sm size variant
   ═══════════════════════════════════════════════════════════════ */

export const Small: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <div style={{ width: 240 }}>
        <DatePicker
          size="sm"
          label="Start date"
          placeholder="Select a date"
          value={value}
          onChange={setValue}
          fullWidth
        />
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   6. LARGE — lg size variant
   ═══════════════════════════════════════════════════════════════ */

export const Large: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <div style={{ width: 320 }}>
        <DatePicker
          size="lg"
          label="End date"
          placeholder="Select a date"
          value={value}
          onChange={setValue}
          fullWidth
        />
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   7. MIN/MAX DATE — Constrained date range
   ═══════════════════════════════════════════════════════════════ */

export const MinMaxDate: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

    return (
      <div style={{ width: 280 }}>
        <DatePicker
          label="Schedule date"
          placeholder="Select a date"
          helperText="Must be within the next 30 days"
          minDate={minDate}
          maxDate={maxDate}
          value={value}
          onChange={setValue}
          fullWidth
        />
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   8. DISABLED — Disabled state
   ═══════════════════════════════════════════════════════════════ */

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <DatePicker
        label="Locked date"
        placeholder="Not available"
        disabled
        fullWidth
      />
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   9. FULL WIDTH — Stretches to container
   ═══════════════════════════════════════════════════════════════ */

export const FullWidth: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <div style={{ width: 480 }}>
        <DatePicker
          label="Project deadline"
          placeholder="Select a date"
          helperText="This date will be visible to all team members"
          value={value}
          onChange={setValue}
          fullWidth
        />
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   10. VARIANTS — All sizes and states at a glance
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => {
    const [sm, setSm] = useState<Date | null>(null);
    const [md, setMd] = useState<Date | null>(null);
    const [lg, setLg] = useState<Date | null>(null);
    const [errVal, setErrVal] = useState<Date | null>(null);
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    return (
      <div style={{ width: 480 }}>
        <Stack>
          {/* Sizes */}
          <div>
            <SectionLabel>Sizes</SectionLabel>
            <Stack gap="var(--gap-lg)">
              <DatePicker size="sm" label="Small (sm)" placeholder="Select a date" value={sm} onChange={setSm} fullWidth />
              <DatePicker size="md" label="Medium (md)" placeholder="Select a date — default" value={md} onChange={setMd} fullWidth />
              <DatePicker size="lg" label="Large (lg)" placeholder="Select a date" value={lg} onChange={setLg} fullWidth />
            </Stack>
          </div>

          {/* States */}
          <div>
            <SectionLabel>States</SectionLabel>
            <Stack gap="var(--gap-lg)">
              <DatePicker label="Default" placeholder="Select a date" value={null} onChange={() => {}} fullWidth />
              <DatePicker label="Helper text" placeholder="Select a date" helperText="Must be a future date" minDate={minDate} value={null} onChange={() => {}} fullWidth />
              <DatePicker label="Error" placeholder="Select a date" error="A date is required" value={errVal} onChange={setErrVal} fullWidth />
              <DatePicker label="Disabled" placeholder="Not available" disabled fullWidth />
            </Stack>
          </div>

          {/* In a form context */}
          <div>
            <SectionLabel>Form context</SectionLabel>
            <Row gap="var(--gap-lg)">
              <div style={{ flex: 1 }}>
                <DatePicker label="Start date" placeholder="Select" value={null} onChange={() => {}} fullWidth />
              </div>
              <div style={{ flex: 1 }}>
                <DatePicker label="End date" placeholder="Select" value={null} onChange={() => {}} fullWidth />
              </div>
            </Row>
          </div>
        </Stack>
      </div>
    );
  },
};
