import type { Meta, StoryObj } from '@storybook/react-vite';
import { PricingCard } from './PricingCard';
import { Badge } from '../Badge';
import { Button } from '../Button';

const meta: Meta<typeof PricingCard> = {
  title: 'Containers/pricing-card',
  component: PricingCard,
  tags: ['surface-web'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
  argTypes: {
    title: {
      control: 'text',
      description: 'Plan name rendered as the card heading.',
    },
    price: {
      control: 'text',
      description: 'Price string (e.g. `"$49"`, `"Free"`). Rendered verbatim — format before passing.',
    },
    period: {
      control: 'text',
      description: 'Billing cadence suffix rendered after the price (e.g. `"/month"`). Omit for free tiers.',
    },
    description: {
      control: 'text',
      description: 'One-line plan summary rendered below the price.',
    },
    highlighted: {
      control: 'boolean',
      description: 'Applies accent treatment — use for the recommended or most popular tier.',
    },
    badge: {
      control: false,
      description: 'Optional badge rendered above the title (e.g. "Most popular"). Pass a `<Badge>` element.',
    },
    features: {
      control: false,
      description: 'Array of feature strings rendered as a checklist.',
    },
    action: {
      control: false,
      description: 'CTA element (typically `<Button fullWidth>`). Anchored to the card bottom.',
    },
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

/* ─── Playground ─────────────────────────────────────────────── */

/** @summary Interactive sandbox — toggle highlighted, period via Controls */
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

/* ─── Variants (Q3 — semantic starting points) ───────────────── */

/**
 * `highlighted` plan — the recommended or most popular tier. Rendered with
 * accent treatment and typically accompanied by a "Most popular" badge.
 *
 * @summary highlighted=true — recommended/most popular tier
 */
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

/* ─── Patterns (Q4 — irreducible compositions) ───────────────── */

/**
 * Three-tier pricing grid — the canonical side-by-side layout with the
 * middle plan highlighted. The grid layout requires multiple PricingCards
 * with coordinated props that can't be expressed via a single component's args.
 *
 * @summary Three-tier pricing grid — starter / pro / enterprise
 */
export const PricingGrid: Story = {
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
