import type { Meta, StoryObj } from '@storybook/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCircleExclamation, faSpinner, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['default', 'positive', 'warning', 'error', 'info', 'progress', 'neutral'],
      description: 'Status variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
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

export const Progress: Story = {
  args: {
    status: 'progress',
    children: 'In Progress',
  },
};

export const Neutral: Story = {
  args: {
    status: 'neutral',
    children: 'Inactive',
  },
};

// Size variants
export const SizeSmall: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
};

export const SizeMedium: Story = {
  args: {
    children: 'Medium',
    size: 'md',
  },
};

export const SizeLarge: Story = {
  args: {
    children: 'Large',
    size: 'lg',
  },
};

// All status variants
export const AllStatuses: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Badge>Default</Badge>
<Badge status="positive">Success</Badge>
<Badge status="warning">Warning</Badge>
<Badge status="error">Error</Badge>
<Badge status="info">Info</Badge>
<Badge status="progress">Progress</Badge>
<Badge status="neutral">Neutral</Badge>`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge>Default</Badge>
      <Badge status="positive">Success</Badge>
      <Badge status="warning">Warning</Badge>
      <Badge status="error">Error</Badge>
      <Badge status="info">Info</Badge>
      <Badge status="progress">Progress</Badge>
      <Badge status="neutral">Neutral</Badge>
    </div>
  ),
};

// All sizes
export const AllSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

// With FA icons
export const WithIcons: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Badge status="positive" icon={<FontAwesomeIcon icon={faCheck} />}>Success</Badge>
<Badge status="error" icon={<FontAwesomeIcon icon={faCircleExclamation} />}>Error</Badge>
<Badge status="progress" icon={<FontAwesomeIcon icon={faSpinner} />}>Loading</Badge>
<Badge status="info" icon={<FontAwesomeIcon icon={faCircleInfo} />}>Info</Badge>`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge status="positive" icon={<FontAwesomeIcon icon={faCheck} />}>Success</Badge>
      <Badge status="error" icon={<FontAwesomeIcon icon={faCircleExclamation} />}>Error</Badge>
      <Badge status="progress" icon={<FontAwesomeIcon icon={faSpinner} />}>Loading</Badge>
      <Badge status="info" icon={<FontAwesomeIcon icon={faCircleInfo} />}>Info</Badge>
    </div>
  ),
};

// Size × Status matrix
export const SizeStatusMatrix: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Badge size="sm">Default</Badge>
<Badge size="sm" status="positive">Positive</Badge>
<Badge size="md">Default</Badge>
<Badge size="md" status="warning">Warning</Badge>
<Badge size="lg">Default</Badge>
<Badge size="lg" status="error">Error</Badge>`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            fontFamily: 'var(--_typography---font-family--label)',
            fontSize: '12px',
            color: 'var(--_color---text--muted)',
            width: '32px',
          }}>
            {size}
          </span>
          <Badge size={size}>Default</Badge>
          <Badge size={size} status="positive">Positive</Badge>
          <Badge size={size} status="warning">Warning</Badge>
          <Badge size={size} status="error">Error</Badge>
          <Badge size={size} status="info">Info</Badge>
          <Badge size={size} status="progress">Progress</Badge>
          <Badge size={size} status="neutral">Neutral</Badge>
        </div>
      ))}
    </div>
  ),
};

// Contextual examples
export const StatusIndicators: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Badge status="positive">Published</Badge>
<Badge status="progress">In Review</Badge>
<Badge status="warning">Draft</Badge>
<Badge status="error">Archived</Badge>
<Badge status="neutral">Inactive</Badge>`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Badge status="positive">Published</Badge>
        <span style={{ fontFamily: 'var(--_typography---font-family--body)' }}>
          Article is live and visible
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Badge status="progress">In Review</Badge>
        <span style={{ fontFamily: 'var(--_typography---font-family--body)' }}>
          Being reviewed by editor
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
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Badge status="neutral">Inactive</Badge>
        <span style={{ fontFamily: 'var(--_typography---font-family--body)' }}>
          Currently disabled
        </span>
      </div>
    </div>
  ),
};
