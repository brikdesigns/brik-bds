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
    valueSuffix: {
      control: 'text',
      description: 'Suffix after the value (default: " Score"). Pass "" to suppress.',
    },
    fillColor: {
      control: 'color',
      description: 'Override fill color. When set, `status` stops driving the bar color.',
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

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: {
    value: 4,
    max: 10,
    status: 'warning',
    label: 'Score',
  },
};

// Status variants
/** @summary Pass */
export const Pass: Story = {
  args: {
    value: 6,
    max: 7,
    status: 'positive',
    label: 'Pass',
  },
};

/** @summary Fair */
export const Fair: Story = {
  args: {
    value: 4,
    max: 10,
    status: 'warning',
    label: 'Fair',
  },
};

/** @summary Fail */
export const Fail: Story = {
  args: {
    value: 1,
    max: 5,
    status: 'error',
    label: 'Fail',
  },
};

/** @summary Neutral */
export const Neutral: Story = {
  args: {
    value: 0,
    max: 7,
    status: 'neutral',
    label: 'Pending',
  },
};

// Size variants
/** @summary Small */
export const Small: Story = {
  args: {
    value: 6,
    max: 7,
    status: 'positive',
    label: 'Pass',
    size: 'sm',
  },
};

/** @summary Large */
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
/** @summary No value */
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
/** @summary Custom formatter */
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
/** @summary Label above */
export const LabelAbove: Story = {
  args: {
    value: 6,
    max: 7,
    status: 'positive',
    label: 'Pass',
    labelPosition: 'above',
  },
};

/** @summary Label below */
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
/** @summary Label position comparison */
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
/** @summary All variants side by side */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 300 }}>
      <Meter value={6} max={7} status="positive" label="Pass" />
      <Meter value={4} max={10} status="warning" label="Fair" />
      <Meter value={1} max={5} status="error" label="Fail" />
      <Meter value={0} max={7} status="neutral" label="Pending" />
    </div>
  ),
};

/** @summary Common usage patterns */
export const Patterns: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-xl)', width: 640 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
        <div style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
          Onboarding completion
        </div>
        <Meter value={3} max={5} status="warning" label="Profile setup" />
        <Meter value={5} max={5} status="positive" label="Verification" />
        <Meter value={1} max={4} status="error" label="Billing" />
        <Meter value={2} max={3} status="warning" label="Team invites" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
        <div style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
          System health
        </div>
        <Meter value={98} max={100} status="positive" label="Uptime" valueSuffix="%" />
        <Meter value={42} max={100} status="warning" label="Storage used" valueSuffix="%" />
        <Meter value={87} max={100} status="warning" label="API rate limit" valueSuffix="%" />
        <Meter value={12} max={100} status="positive" label="Error budget" valueSuffix="%" />
      </div>
    </div>
  ),
};

// Custom suffix
/** @summary No suffix — plain X/Y for completion counters */
export const NoSuffix: Story = {
  args: {
    value: 4,
    max: 10,
    status: 'warning',
    label: 'Modules complete',
    valueSuffix: '',
  },
};

/** @summary Custom suffix */
export const CustomSuffix: Story = {
  args: {
    value: 87,
    max: 100,
    status: 'positive',
    label: 'Quiz',
    valueSuffix: ' pts',
  },
};

// Custom fill color (escape hatch)
/** @summary Custom fill color */
export const CustomFillColor: Story = {
  args: {
    value: 3,
    max: 8,
    label: 'Department A',
    valueSuffix: '',
    fillColor: '#7c5cff',
  },
};

/** @summary Category-driven fills — multiple custom colors */
export const CategoryFills: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 300 }}>
      <Meter value={2} max={4} label="Management" valueSuffix="" fillColor="#7c5cff" />
      <Meter value={5} max={6} label="Operations" valueSuffix="" fillColor="#22c55e" />
      <Meter value={1} max={9} label="Finance" valueSuffix="" fillColor="#f59e0b" />
      <Meter value={0} max={3} label="HR" valueSuffix="" fillColor="#06b6d4" />
    </div>
  ),
};
