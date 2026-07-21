import type { Meta, StoryObj } from '@storybook/react-vite';
import { Meter } from './Meter';

const meta: Meta<typeof Meter> = {
  title: 'Components/meter',
  component: Meter,
  tags: ['surface-shared'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: { type: 'number', min: 0, max: 100 },
      description: 'Current value',
    },
    max: {
      control: { type: 'number', min: 1, max: 100 },
      description: 'Maximum value',
    },
    status: {
      control: 'select',
      options: ['positive', 'warning', 'error', 'neutral'],
      description: 'Status variant — drives fill color via system tokens',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Bar height: sm=8px, md=12px, lg=16px',
    },
    label: {
      control: 'text',
      description: 'Label text (e.g. "Pass", "Fair", "Fail")',
    },
    showValue: {
      control: 'boolean',
      description: 'Show formatted value',
    },
    valueFormatter: {
      control: false,
      description: 'Custom value formatter function (default renders "value/max"). Set via code, not Controls.',
    },
    labelPosition: {
      control: 'select',
      options: ['above', 'below'],
      description: 'Position label/value above or below the bar',
    },
    valueSuffix: {
      control: 'text',
      description: 'Suffix after the value (default: " Score"). Pass "" for plain "value/max" (e.g. completion counters).',
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

/* ─── Default ─────────────────────────────────────────────────── */

/** @summary Interactive score bar — status/label via Controls */
export const Default: Story = {
  args: {
    value: 4,
    max: 10,
    status: 'warning',
    label: 'Score',
  },
};

/* ─── Variants — one story per status (Q3 semantic starting points) ─── */

/** @summary Positive status — passing score */
export const Pass: Story = {
  args: {
    value: 6,
    max: 7,
    status: 'positive',
    label: 'Pass',
  },
};

/** @summary Warning status — borderline score */
export const Fair: Story = {
  args: {
    value: 4,
    max: 10,
    status: 'warning',
    label: 'Fair',
  },
};

/** @summary Error status — failing score */
export const Fail: Story = {
  args: {
    value: 1,
    max: 5,
    status: 'error',
    label: 'Fail',
  },
};

/** @summary Neutral status — pending or not-yet-scored */
export const Neutral: Story = {
  args: {
    value: 0,
    max: 7,
    status: 'neutral',
    label: 'Pending',
  },
};

/* ─── Documented usage patterns (Q3 — named in component JSDoc) ─── */

/** @summary Plain "value/max" with no suffix — completion counters */
export const NoSuffix: Story = {
  args: {
    value: 4,
    max: 10,
    status: 'warning',
    label: 'Modules complete',
    valueSuffix: '',
  },
};

/** @summary Custom fill color — category/department palette override */
export const CustomFillColor: Story = {
  args: {
    value: 3,
    max: 8,
    label: 'Department A',
    valueSuffix: '',
    fillColor: '#7c5cff',
  },
};
