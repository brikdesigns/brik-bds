import type { Meta, StoryObj } from '@storybook/react-vite';
import { BadgeGroup } from './BadgeGroup';
import { Badge } from '../Badge';
import { Field } from '../Field';

const meta: Meta<typeof BadgeGroup> = {
  title: 'Components/Indicator/badge-group',
  component: BadgeGroup,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    gap: { control: 'select', options: ['xs', 'sm', 'md'] },
    wrap: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof BadgeGroup>;

const Frame = ({ width = '360px', children }: { width?: string; children: React.ReactNode }) => (
  <div style={{ width, padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
    {children}
  </div>
);

/* ─── 1. Playground ──────────────────────────────────────────── */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: {
    gap: 'xs',
    wrap: true,
  },
  render: (args) => (
    <Frame>
      <BadgeGroup {...args}>
        <Badge status="positive" size="sm">Active</Badge>
        <Badge status="warning" size="sm">Pending</Badge>
        <Badge status="info" size="sm">Draft</Badge>
        <Badge status="error" size="sm">Blocked</Badge>
      </BadgeGroup>
    </Frame>
  ),
};

/* ─── 2. Gaps ────────────────────────────────────────────────── */

/** @summary Gaps */
export const Gaps: Story = {
  render: () => (
    <Frame>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
        <BadgeGroup gap="xs">
          <Badge status="positive" size="sm">xs gap</Badge>
          <Badge status="info" size="sm">tight</Badge>
          <Badge status="brand" size="sm">cluster</Badge>
        </BadgeGroup>

        <BadgeGroup gap="sm">
          <Badge status="positive" size="sm">sm gap</Badge>
          <Badge status="info" size="sm">standard</Badge>
          <Badge status="brand" size="sm">list</Badge>
        </BadgeGroup>

        <BadgeGroup gap="md">
          <Badge status="positive" size="md">md gap</Badge>
          <Badge status="info" size="md">roomy</Badge>
          <Badge status="brand" size="md">display</Badge>
        </BadgeGroup>
      </div>
    </Frame>
  ),
};

/* ─── 3. Inside a Field ──────────────────────────────────────── */

/** @summary Inside field */
export const InsideField: Story = {
  render: () => (
    <Frame>
      <Field label="Integrations health">
        <BadgeGroup>
          <Badge status="positive" size="sm">Helicone</Badge>
          <Badge status="positive" size="sm">Supabase</Badge>
          <Badge status="warning" size="sm">Stripe</Badge>
          <Badge status="error" size="sm">Twilio</Badge>
        </BadgeGroup>
      </Field>
    </Frame>
  ),
};

/* ─── 4. Variants — appearance mix ───────────────────────────── */

/** @summary All variants side by side */
export const Variants: Story = {
  name: 'Appearance mix',
  render: () => (
    <Frame width="480px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
        <Field label="Solid appearance">
          <BadgeGroup>
            <Badge status="positive" size="sm" appearance="solid">Paid</Badge>
            <Badge status="warning" size="sm" appearance="solid">Overdue</Badge>
            <Badge status="error" size="sm" appearance="solid">Failed</Badge>
            <Badge status="info" size="sm" appearance="solid">Scheduled</Badge>
          </BadgeGroup>
        </Field>

        <Field label="Subtle appearance">
          <BadgeGroup>
            <Badge status="positive" size="sm" appearance="subtle">Paid</Badge>
            <Badge status="warning" size="sm" appearance="subtle">Overdue</Badge>
            <Badge status="error" size="sm" appearance="subtle">Failed</Badge>
            <Badge status="info" size="sm" appearance="subtle">Scheduled</Badge>
          </BadgeGroup>
        </Field>
      </div>
    </Frame>
  ),
};

/* ─── 5. Patterns ────────────────────────────────────────────── */

/** @summary Common usage patterns */
export const Patterns: Story = {
  render: () => (
    <Frame width="480px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
        <Field label="Account status">
          <BadgeGroup gap="sm">
            <Badge status="positive" size="sm" appearance="subtle">Active</Badge>
            <Badge status="info" size="sm" appearance="subtle">Verified</Badge>
            <Badge status="warning" size="sm" appearance="subtle">Trial</Badge>
          </BadgeGroup>
        </Field>

        <Field label="Notifications">
          <BadgeGroup gap="xs">
            <Badge status="error" size="sm">3 alerts</Badge>
            <Badge status="warning" size="sm">5 pending</Badge>
            <Badge status="info" size="sm">12 messages</Badge>
          </BadgeGroup>
        </Field>

        <Field label="Tags">
          <BadgeGroup gap="sm" wrap>
            <Badge status="brand" size="sm" appearance="subtle">Engineering</Badge>
            <Badge status="brand" size="sm" appearance="subtle">Design</Badge>
            <Badge status="brand" size="sm" appearance="subtle">Product</Badge>
            <Badge status="brand" size="sm" appearance="subtle">Marketing</Badge>
          </BadgeGroup>
        </Field>
      </div>
    </Frame>
  ),
};
