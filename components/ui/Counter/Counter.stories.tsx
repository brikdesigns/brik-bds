import type { Meta, StoryObj } from '@storybook/react';
import { Counter } from './Counter';

const meta = {
  title: 'Components/counter',
  component: Counter,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    count: {
      control: { type: 'number', min: 0, max: 999 },
      description: 'Numeric count to display',
    },
    status: {
      control: 'select',
      options: ['success', 'error', 'warning', 'neutral', 'progress'],
      description: 'Status color variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    max: {
      control: { type: 'number', min: 1, max: 999 },
      description: 'Max count — displays "99+" when exceeded',
    },
  },
} satisfies Meta<typeof Counter>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default counter
 */
export const Default: Story = {
  args: {
    count: 1,
    status: 'success',
    size: 'sm',
  },
};

/**
 * All statuses at small size
 */
export const AllStatuses: Story = {
  args: { count: 1 },
  parameters: {
    docs: {
      source: {
        code: `<Counter count={1} status="success" />
<Counter count={1} status="error" />
<Counter count={1} status="warning" />
<Counter count={1} status="neutral" />
<Counter count={1} status="progress" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--_space---gap--md)', alignItems: 'center' }}>
      <Counter count={1} status="success" />
      <Counter count={1} status="error" />
      <Counter count={1} status="warning" />
      <Counter count={1} status="neutral" />
      <Counter count={1} status="progress" />
    </div>
  ),
};

/**
 * All sizes
 */
export const AllSizes: Story = {
  args: { count: 5 },
  parameters: {
    docs: {
      source: {
        code: `<Counter count={5} status="success" size="sm" />
<Counter count={5} status="success" size="md" />
<Counter count={5} status="success" size="lg" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--_space---gap--md)', alignItems: 'center' }}>
      <Counter count={5} status="success" size="sm" />
      <Counter count={5} status="success" size="md" />
      <Counter count={5} status="success" size="lg" />
    </div>
  ),
};

/**
 * Max count overflow
 */
export const MaxCount: Story = {
  args: { count: 5 },
  parameters: {
    docs: {
      source: {
        code: `<Counter count={5} max={99} status="error" size="md" />
<Counter count={99} max={99} status="error" size="md" />
<Counter count={150} max={99} status="error" size="md" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--_space---gap--md)', alignItems: 'center' }}>
      <Counter count={5} max={99} status="error" size="md" />
      <Counter count={99} max={99} status="error" size="md" />
      <Counter count={150} max={99} status="error" size="md" />
    </div>
  ),
};

/**
 * Full grid — all statuses at all sizes
 */
export const CounterGrid: Story = {
  args: { count: 1 },
  parameters: {
    docs: {
      source: {
        code: `// sm
<Counter count={1} status="success" size="sm" />
<Counter count={1} status="error" size="sm" />
<Counter count={1} status="warning" size="sm" />
<Counter count={1} status="neutral" size="sm" />
<Counter count={1} status="progress" size="sm" />

// md
<Counter count={1} status="success" size="md" />
<Counter count={1} status="error" size="md" />
<Counter count={1} status="warning" size="md" />
<Counter count={1} status="neutral" size="md" />
<Counter count={1} status="progress" size="md" />

// lg
<Counter count={1} status="success" size="lg" />
<Counter count={1} status="error" size="lg" />
<Counter count={1} status="warning" size="lg" />
<Counter count={1} status="neutral" size="lg" />
<Counter count={1} status="progress" size="lg" />`,
      },
    },
  },
  render: () => {
    const statuses = ['success', 'error', 'warning', 'neutral', 'progress'] as const;
    const sizes = ['sm', 'md', 'lg'] as const;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--lg)' }}>
        {sizes.map((size) => (
          <div key={size} style={{ display: 'flex', gap: 'var(--_space---gap--md)', alignItems: 'center' }}>
            {statuses.map((status) => (
              <Counter key={`${size}-${status}`} count={1} status={status} size={size} />
            ))}
          </div>
        ))}
      </div>
    );
  },
};
