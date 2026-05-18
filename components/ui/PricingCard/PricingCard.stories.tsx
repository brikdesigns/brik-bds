import type { Meta, StoryObj } from '@storybook/react-vite';
import { PricingCard } from './PricingCard';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * @deprecated Stories for PricingCard now live in Card.stories.tsx
 * (`Containers/card` sidebar entry). This file is kept during the migration
 * window and will be removed in a future release.
 */
const meta: Meta<typeof PricingCard> = {
  title: 'Containers/pricing-card',
  component: PricingCard,
  tags: ['surface-web', '!manifest'],
  parameters: { layout: 'centered' },
  argTypes: {
    title: { control: 'text' },
    price: { control: 'text' },
    period: { control: 'text' },
    description: { control: 'text' },
    highlighted: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof PricingCard>;

const commonFeatures = [
  'Unlimited projects',
  'Priority support',
  'Custom domain',
  'Analytics dashboard',
];

/** @summary Pricing tier card — see Card stories for the canonical reference */
export const Default: Story = {
  args: {
    title: 'Professional',
    price: '$49',
    period: '/month',
    description: 'For growing businesses that need more power.',
    features: commonFeatures,
    action: <Button variant="primary" style={{ width: '100%' }}>Get started</Button>,
  },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
};

/**
 * `highlighted=true` — recommended tier treatment with brand surface.
 * @summary highlighted=true — recommended tier
 */
export const Highlighted: Story = {
  args: {
    title: 'Professional',
    price: '$49',
    period: '/month',
    description: 'Most popular choice for growing businesses.',
    features: commonFeatures,
    badge: <Badge status="positive" size="sm">Most popular</Badge>,
    action: <Button variant="primary" style={{ width: '100%' }}>Get started</Button>,
    highlighted: true,
  },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
};
