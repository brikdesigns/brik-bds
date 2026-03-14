import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PricingCard } from './PricingCard';
import { Badge } from '../Badge';
import { Button } from '../Button';

/* ─── Layout Helpers (story-only) ─────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{
    fontFamily: 'var(--font-family-label)',
    fontSize: 'var(--body-xs)', // bds-lint-ignore
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 'var(--gap-md)',
    color: 'var(--text-muted)',
  }}>
    {children}
  </div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof PricingCard> = {
  title: 'Displays/Card/pricing-card',
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

/* ─── Shared data ─────────────────────────────────────── */

const commonFeatures = [
  'Unlimited projects',
  'Priority support',
  'Custom domain',
  'Analytics dashboard',
];

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Highlighted, free tier, no features
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  decorators: [(Story) => <div style={{ width: 900 }}><Story /></div>],
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Standard</SectionLabel>
        <div style={{ width: 320 }}>
          <PricingCard
            title="Professional"
            price="$49"
            period="/month"
            description="For growing businesses that need more power."
            features={commonFeatures}
            action={<Button variant="primary" fullWidth>Get started</Button>}
          />
        </div>
      </div>

      <div>
        <SectionLabel>Highlighted with badge</SectionLabel>
        <div style={{ width: 320 }}>
          <PricingCard
            title="Professional"
            price="$49"
            period="/month"
            description="Most popular choice for growing businesses."
            features={commonFeatures}
            badge={<Badge status="positive" size="sm">Most popular</Badge>}
            action={<Button variant="primary" fullWidth>Get started</Button>}
            highlighted
          />
        </div>
      </div>

      <div>
        <SectionLabel>Free tier (no period)</SectionLabel>
        <div style={{ width: 320 }}>
          <PricingCard
            title="Starter"
            price="Free"
            description="Get started with the basics."
            features={['1 project', 'Community support', 'Basic analytics']}
            action={<Button variant="outline" fullWidth>Sign up free</Button>}
          />
        </div>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Pricing grid (3-tier layout)
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 1000 }}><Story /></div>],
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Three-tier pricing grid</SectionLabel>
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
      </div>
    </Stack>
  ),
};
