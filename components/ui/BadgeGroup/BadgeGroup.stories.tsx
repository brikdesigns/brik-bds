import type { Meta, StoryObj } from '@storybook/react-vite';
import { BadgeGroup } from './BadgeGroup';
import { Badge } from '../Badge';

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
        <Badge tone="positive" size="sm">Active</Badge>
        <Badge tone="warning" size="sm">Pending</Badge>
        <Badge tone="info" size="sm">Draft</Badge>
        <Badge tone="negative" size="sm">Blocked</Badge>
      </BadgeGroup>
    </Frame>
  ),
};

/* `gap` is a Control on Default — the gap-scale comparison lives in
   BadgeGroup.mdx as a docs-local demo (#1489). The `InsideField` usage
   composition + the Badge appearance mix also live there as docs-local
   demos (#2499). */
