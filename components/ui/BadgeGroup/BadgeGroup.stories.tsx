import type { Meta, StoryObj } from '@storybook/react-vite';
import { BadgeGroup } from './BadgeGroup';
import { Badge } from '../Badge';
import { Field } from '../Field';

const meta: Meta<typeof BadgeGroup> = {
  title: 'Components/badge-group',
  component: BadgeGroup,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'md'],
      description: 'Gap between badges. Default `xs` (matches tight badge clusters).',
    },
    wrap: {
      control: 'boolean',
      description: 'When true, badges wrap to additional rows. Default true.',
    },
    children: {
      control: false,
      description: '`<Badge>` children, or anything with badge-sized footprint.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BadgeGroup>;

const Frame = ({ width = '360px', children }: { width?: string; children: React.ReactNode }) => (
  <div style={{ width, padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
    {children}
  </div>
);

/* ─── 1. Default ──────────────────────────────────────────────── */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
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

/* `gap` is a Control on Default — the gap-scale comparison lives in
   BadgeGroup.mdx as a docs-local demo (#1489). */

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

/* Badge `appearance` composed in a group — the solid-vs-subtle comparison
   lives in BadgeGroup.mdx as a docs-local demo (#1489). */
