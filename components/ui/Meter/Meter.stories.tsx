import type { Meta, StoryObj } from '@storybook/react';
import { Meter } from './Meter';

const meta: Meta<typeof Meter> = {
  title: 'Displays/Charts/meter',
  component: Meter,
  tags: ['surface-shared'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['positive', 'warning', 'error', 'neutral'],
      description: 'Status variant — drives fill color',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Bar height variant',
    },
    value: {
      control: { type: 'number', min: 0, max: 100 },
      description: 'Current value',
    },
    max: {
      control: { type: 'number', min: 1, max: 100 },
      description: 'Maximum value',
    },
    showValue: {
      control: 'boolean',
      description: 'Show formatted value',
    },
    labelPosition: {
      control: 'select',
      options: ['above', 'below'],
      description: 'Position label/value above or below the bar',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Meter>;

// Status variants
export const Pass: Story = {
  args: {
    value: 6,
    max: 7,
    status: 'positive',
    label: 'Pass',
  },
};

export const Fair: Story = {
  args: {
    value: 4,
    max: 10,
    status: 'warning',
    label: 'Fair',
  },
};

export const Fail: Story = {
  args: {
    value: 1,
    max: 5,
    status: 'error',
    label: 'Fail',
  },
};

export const Neutral: Story = {
  args: {
    value: 0,
    max: 7,
    status: 'neutral',
    label: 'Pending',
  },
};

// Size variants
export const Small: Story = {
  args: {
    value: 6,
    max: 7,
    status: 'positive',
    label: 'Pass',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    value: 6,
    max: 7,
    status: 'positive',
    label: 'Pass',
    size: 'lg',
  },
};

// Without value display
export const NoValue: Story = {
  args: {
    value: 3,
    max: 10,
    status: 'warning',
    label: 'Fair',
    showValue: false,
  },
};

// Custom formatter
export const CustomFormatter: Story = {
  args: {
    value: 85,
    max: 100,
    status: 'positive',
    label: 'Pass',
    valueFormatter: (value: number, max: number) => `${Math.round((value / max) * 100)}%`,
  },
};

// Label position variants
export const LabelAbove: Story = {
  args: {
    value: 6,
    max: 7,
    status: 'positive',
    label: 'Pass',
    labelPosition: 'above',
  },
};

export const LabelBelow: Story = {
  args: {
    value: 6,
    max: 7,
    status: 'positive',
    label: 'Pass',
    labelPosition: 'below',
  },
};

// Label position comparison
export const LabelPositionComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 48, width: 600 }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-secondary)', marginBottom: 12 }}>labelPosition=&quot;above&quot;</p>
        <Meter value={6} max={7} status="positive" label="Pass" labelPosition="above" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-secondary)', marginBottom: 12 }}>labelPosition=&quot;below&quot;</p>
        <Meter value={6} max={7} status="positive" label="Pass" labelPosition="below" />
      </div>
    </div>
  ),
};

// All statuses side by side
export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 300 }}>
      <Meter value={6} max={7} status="positive" label="Pass" />
      <Meter value={4} max={10} status="warning" label="Fair" />
      <Meter value={1} max={5} status="error" label="Fail" />
      <Meter value={0} max={7} status="neutral" label="Pending" />
    </div>
  ),
};
