import type { Meta, StoryObj } from '@storybook/react-vite';
import { PricingCard } from './PricingCard';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * PricingCard — pricing-tier display with title, price, period, description,
 * feature list, optional badge, and CTA. Use `highlighted` for the "most
 * popular" tier in a multi-tier grid.
 * @summary Pricing tier display
 */
const meta: Meta<typeof PricingCard> = {
  title: 'Components/Card/pricing-card',
  component: PricingCard,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
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

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    title: 'Professional',
    price: '$49',
    period: '/month',
    description: 'For growing businesses that need more power.',
    features: commonFeatures,
    action: <Button variant="primary" fullWidth>Get started</Button>,
  },
};

/* ─── Tier shapes ────────────────────────────────────────────── */

/** Standard tier — no highlight, no badge.
 *  @summary Standard pricing tier */
export const Standard: Story = {
  args: {
    title: 'Professional',
    price: '$49',
    period: '/month',
    description: 'For growing businesses that need more power.',
    features: commonFeatures,
    action: <Button variant="primary" fullWidth>Get started</Button>,
  },
};

/** Highlighted tier — `highlighted` styling + a "Most popular" Badge. The
 *  middle card in a 3-tier grid.
 *  @summary Highlighted tier with badge */
export const Highlighted: Story = {
  args: {
    title: 'Professional',
    price: '$49',
    period: '/month',
    description: 'Most popular choice for growing businesses.',
    features: commonFeatures,
    badge: <Badge status="positive" size="sm">Most popular</Badge>,
    action: <Button variant="primary" fullWidth>Get started</Button>,
    highlighted: true,
  },
};

/** Free tier — no period (price reads as "Free"). Lower-emphasis CTA.
 *  @summary Free tier */
export const FreeTier: Story = {
  args: {
    title: 'Starter',
    price: 'Free',
    description: 'Get started with the basics.',
    features: ['1 project', 'Community support', 'Basic analytics'],
    action: <Button variant="outline" fullWidth>Sign up free</Button>,
  },
};

/* ─── Composition recipes ────────────────────────────────────── */

/** Three-tier pricing grid — the canonical pricing-page recipe. Middle tier
 *  uses `highlighted` to draw the eye.
 *  @summary 3-tier pricing grid */
export const ThreeTierGrid: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 1000 }}><Story /></div>],
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 'var(--padding-lg)',
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
        badge={<Badge status="positive" size="sm">Most popular</Badge>}
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
