import type { Meta, StoryObj } from '@storybook/react-vite';
import { PricingCard } from './PricingCard';
import { Badge } from '../Badge';
import { Button } from '../Button';

const meta: Meta<typeof PricingCard> = {
  title: 'Components/Card/pricing-card',
  component: PricingCard,
  parameters: {
    layout: 'centered',
  },
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

export const Default: Story = {
  args: {
    title: 'Professional',
    price: '$49',
    period: '/month',
    description: 'For growing businesses that need more power.',
    features: commonFeatures,
    action: <Button variant="primary" fullWidth>Get started</Button>,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Highlighted: Story = {
  args: {
    title: 'Professional',
    price: '$49',
    period: '/month',
    description: 'Most popular choice for growing businesses.',
    features: commonFeatures,
    badge: <Badge status="default" size="sm">Most popular</Badge>,
    action: <Button variant="primary" fullWidth>Get started</Button>,
    highlighted: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Free: Story = {
  args: {
    title: 'Starter',
    price: 'Free',
    description: 'Get started with the basics.',
    features: ['1 project', 'Community support', 'Basic analytics'],
    action: <Button variant="outline" fullWidth>Sign up free</Button>,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

export const PricingGrid: Story = {
  parameters: {
    docs: {
      source: {
        code: `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
  <PricingCard title="Starter" price="Free" ... />
  <PricingCard title="Professional" price="$49" highlighted ... />
  <PricingCard title="Enterprise" price="$199" ... />
</div>`,
      },
    },
  },
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 'var(--padding-lg)',
      maxWidth: '1000px',
      alignItems: 'start',
    }}>
      <PricingCard
        title="Starter"
        price="Free"
        description="Get started with the basics."
        features={['1 project', 'Community support', 'Basic analytics']}
        action={<Button variant="outline" fullWidth>Sign up free</Button>}
      />
      <PricingCard
        title="Professional"
        price="$49"
        period="/month"
        description="Most popular choice for growing businesses."
        features={['Unlimited projects', 'Priority support', 'Custom domain', 'Analytics dashboard', 'API access']}
        badge={<Badge status="default" size="sm">Most popular</Badge>}
        action={<Button variant="primary" fullWidth>Get started</Button>}
        highlighted
      />
      <PricingCard
        title="Enterprise"
        price="$199"
        period="/month"
        description="For large teams with advanced needs."
        features={['Everything in Professional', 'Dedicated account manager', 'SLA guarantee', 'Custom integrations']}
        action={<Button variant="outline" fullWidth>Contact sales</Button>}
      />
    </div>
  ),
};
