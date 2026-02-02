import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Badge

A themed badge component for status indicators and labels.

## Status Variants
- **default** - Brand colored
- **positive** - Green, for success states
- **warning** - Yellow, for caution/pending states
- **error** - Red, for error/failure states
- **info** - Blue, for informational messages

## Theme Integration
The default badge uses brand colors that change per theme.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['default', 'positive', 'warning', 'error', 'info'],
      description: 'Status variant',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// Status variants
export const Default: Story = {
  args: {
    children: 'New',
  },
};

export const Positive: Story = {
  args: {
    status: 'positive',
    children: 'Success',
  },
};

export const Warning: Story = {
  args: {
    status: 'warning',
    children: 'Pending',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
    children: 'Failed',
  },
};

export const Info: Story = {
  args: {
    status: 'info',
    children: 'Info',
  },
};

// All status variants
export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge>Default</Badge>
      <Badge status="positive">Success</Badge>
      <Badge status="warning">Warning</Badge>
      <Badge status="error">Error</Badge>
      <Badge status="info">Info</Badge>
    </div>
  ),
};

// Contextual examples
export const StatusIndicators: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Badge status="positive">Published</Badge>
        <span style={{ fontFamily: 'var(--_typography---font-family--body)' }}>
          Article is live and visible
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Badge status="warning">Draft</Badge>
        <span style={{ fontFamily: 'var(--_typography---font-family--body)' }}>
          Saved but not published
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Badge status="error">Archived</Badge>
        <span style={{ fontFamily: 'var(--_typography---font-family--body)' }}>
          Has been removed
        </span>
      </div>
    </div>
  ),
};

// Category tags
export const CategoryTags: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Badge>Design</Badge>
      <Badge>Development</Badge>
      <Badge>Marketing</Badge>
      <Badge>Strategy</Badge>
    </div>
  ),
};
