import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductSummaryCard } from './ProductSummaryCard';

const meta: Meta<typeof ProductSummaryCard> = {
  title: 'Containers/product-summary-card',
  component: ProductSummaryCard,
  // Deprecated (ADR-038 Phase 3) — superseded by `<Card layout="metric">`.
  // `!manifest` hides it from MCP discovery so agents reach for the Card layout.
  // Title stays under Containers/ for now to keep visual baselines stable; the
  // Deprecated/ sidebar move rides with its removal once the portal migrates.
  tags: ['surface-shared', '!manifest'],
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
 * @summary Offering summary — tag, "Interested in", price
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
 * @summary Plan summary — tag, "Selected plan", recurring price
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
