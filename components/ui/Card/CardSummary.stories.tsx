import type { Meta, StoryObj } from '@storybook/react';
import { CardSummary } from './CardSummary';

const meta = {
  title: 'Components/CardSummary',
  component: CardSummary,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['numeric', 'price'],
      description: 'Value display type',
    },
    label: {
      control: 'text',
      description: 'Label text above the value',
    },
    value: {
      control: 'text',
      description: 'Display value (number or string)',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '322px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CardSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Numeric variant with text link visible
 */
export const Numeric: Story = {
  args: {
    label: 'Total',
    value: 0,
    type: 'numeric',
    textLink: { label: 'Text Link', href: '#' },
  },
};

/**
 * Price variant with text link visible
 */
export const Price: Story = {
  args: {
    label: 'Amount Due',
    value: 0,
    type: 'price',
    textLink: { label: 'Text Link', href: '#' },
  },
};

/**
 * Numeric variant without text link
 */
export const NumericNoLink: Story = {
  args: {
    label: 'Total',
    value: 0,
    type: 'numeric',
  },
};

/**
 * Price variant without text link
 */
export const PriceNoLink: Story = {
  args: {
    label: 'Amount Due',
    value: 0,
    type: 'price',
  },
};

/**
 * Both variants stacked, matching the Figma spec
 */
export const BothVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', width: '322px' }}>
      <CardSummary
        label="Total"
        value={0}
        type="numeric"
        textLink={{ label: 'Text Link', href: '#' }}
        style={{ borderBottom: 'none' }}
      />
      <CardSummary
        label="Amount Due"
        value={0}
        type="price"
        textLink={{ label: 'Text Link', href: '#' }}
      />
    </div>
  ),
};

/**
 * With populated data
 */
export const WithData: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--md)' }}>
      <CardSummary
        label="Active Users"
        value={1284}
        type="numeric"
        textLink={{ label: 'View All', href: '#' }}
      />
      <CardSummary
        label="Revenue"
        value={48250.75}
        type="price"
        textLink={{ label: 'Details', href: '#' }}
      />
    </div>
  ),
};

/**
 * Dashboard grid layout
 */
export const DashboardGrid: Story = {
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 'var(--_space---gap--md)',
      width: '100%',
      maxWidth: '1000px',
    }}>
      <CardSummary label="Orders" value={156} textLink={{ label: 'View', href: '#' }} />
      <CardSummary label="Revenue" value={24830} type="price" textLink={{ label: 'View', href: '#' }} />
      <CardSummary label="Customers" value={892} />
      <CardSummary label="Avg. Order" value={159.17} type="price" />
      <CardSummary label="Returns" value={3} textLink={{ label: 'Review', href: '#' }} />
      <CardSummary label="Refunds" value={478.5} type="price" textLink={{ label: 'Review', href: '#' }} />
    </div>
  ),
  decorators: [
    (Story) => (
      <div style={{ width: '1000px' }}>
        <Story />
      </div>
    ),
  ],
};
