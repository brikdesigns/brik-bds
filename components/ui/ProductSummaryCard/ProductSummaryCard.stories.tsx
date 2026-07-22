import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductSummaryCard } from './ProductSummaryCard';

const meta: Meta<typeof ProductSummaryCard> = {
  title: 'Cards/product-summary-card',
  component: ProductSummaryCard,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    serviceLine: {
      control: 'select',
      options: ['brand', 'marketing', 'information', 'product', 'back-office', 'service'],
    },
    serviceName: { control: 'text' },
    label: { control: 'text' },
    value: { control: 'text' },
    price: { control: 'text' },
    frequency: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ProductSummaryCard>;

/**
 * Offering selection — echoes the offering/tier a visitor clicked through on.
 * Omit `price`/`frequency` via Controls to see the graceful collapse.
 *
 * @summary Offering summary — service tag + "Interested in" + price • frequency
 */
export const Default: Story = {
  args: {
    serviceLine: 'brand',
    label: 'Interested in',
    value: 'Standard Logo Design',
    price: '$650',
    frequency: 'one time',
  },
  decorators: [(Story) => <div style={{ width: 420 }}><Story /></div>],
};

/**
 * Plan selection — same card with the parent service-line tag and recurring
 * frequency, as rendered in the Service Plan "Get Started" modal.
 *
 * @summary Plan summary — service-line tag + "Selected plan" + recurring price
 */
export const Plan: Story = {
  args: {
    serviceLine: 'marketing',
    label: 'Selected plan',
    value: 'Growth Marketing Plan',
    price: '$1,200',
    frequency: 'monthly',
  },
  decorators: [(Story) => <div style={{ width: 420 }}><Story /></div>],
};
