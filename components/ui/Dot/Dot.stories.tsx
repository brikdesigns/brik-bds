import type { Meta, StoryObj } from '@storybook/react';
import { Dot } from './Dot';

const meta: Meta<typeof Dot> = {
  title: 'Components/dot',
  component: Dot,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['default', 'positive', 'warning', 'error', 'info', 'neutral'],
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
type Story = StoryObj<typeof Dot>;

// Status variants
export const Default: Story = {
  args: {
    status: 'default',
  },
};

export const Positive: Story = {
  args: {
    status: 'positive',
  },
};

export const Warning: Story = {
  args: {
    status: 'warning',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
  },
};

export const Info: Story = {
  args: {
    status: 'info',
  },
};

export const Neutral: Story = {
  args: {
    status: 'neutral',
  },
};

// All statuses
export const AllStatuses: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Dot status="default" />
<Dot status="positive" />
<Dot status="warning" />
<Dot status="error" />
<Dot status="info" />
<Dot status="neutral" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Dot status="default" />
      <Dot status="positive" />
      <Dot status="warning" />
      <Dot status="error" />
      <Dot status="info" />
      <Dot status="neutral" />
    </div>
  ),
};

// All sizes
export const AllSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Dot size="sm" status="positive" />
<Dot size="md" status="positive" />
<Dot size="lg" status="positive" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <Dot size="sm" status="positive" />
        <span style={{
          fontFamily: 'var(--_typography---font-family--label)',
          fontSize: 'var(--_typography---label--sm)',
          color: 'var(--_color---text--secondary)',
        }}>
          Small
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <Dot size="md" status="positive" />
        <span style={{
          fontFamily: 'var(--_typography---font-family--label)',
          fontSize: 'var(--_typography---label--sm)',
          color: 'var(--_color---text--secondary)',
        }}>
          Medium
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <Dot size="lg" status="positive" />
        <span style={{
          fontFamily: 'var(--_typography---font-family--label)',
          fontSize: 'var(--_typography---label--sm)',
          color: 'var(--_color---text--secondary)',
        }}>
          Large
        </span>
      </div>
    </div>
  ),
};

// Contextual examples
export const OnlineStatus: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Dot status="positive" />
<Dot status="warning" />
<Dot status="error" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Dot status="positive" />
        <span style={{
          fontFamily: 'var(--_typography---font-family--body)',
          fontSize: 'var(--_typography---body--md-base)',
        }}>
          Online
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Dot status="warning" />
        <span style={{
          fontFamily: 'var(--_typography---font-family--body)',
          fontSize: 'var(--_typography---body--md-base)',
        }}>
          Away
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Dot status="error" />
        <span style={{
          fontFamily: 'var(--_typography---font-family--body)',
          fontSize: 'var(--_typography---body--md-base)',
        }}>
          Offline
        </span>
      </div>
    </div>
  ),
};

export const ListItems: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Dot status="positive" size="sm" />
<Dot status="warning" size="sm" />
<Dot status="error" size="sm" />`,
      },
    },
  },
  render: () => (
    <ul style={{
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Dot status="positive" size="sm" />
        <span style={{
          fontFamily: 'var(--_typography---font-family--body)',
          fontSize: 'var(--_typography---body--md-base)',
        }}>
          All systems operational
        </span>
      </li>
      <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Dot status="warning" size="sm" />
        <span style={{
          fontFamily: 'var(--_typography---font-family--body)',
          fontSize: 'var(--_typography---body--md-base)',
        }}>
          Minor service disruption
        </span>
      </li>
      <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Dot status="error" size="sm" />
        <span style={{
          fontFamily: 'var(--_typography---font-family--body)',
          fontSize: 'var(--_typography---body--md-base)',
        }}>
          Service outage detected
        </span>
      </li>
    </ul>
  ),
};

export const ActivityFeed: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Dot status="positive" />
<Dot status="info" />
<Dot status="neutral" />`,
      },
    },
  },
  render: () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '16px',
      backgroundColor: 'var(--_color---background--secondary)',
      borderRadius: 'var(--_border-radius---md)',
      width: '300px',
    }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Dot status="positive" style={{ marginTop: '4px' }} />
        <div>
          <div style={{
            fontFamily: 'var(--_typography---font-family--body)',
            fontSize: 'var(--_typography---body--md-base)',
            fontWeight: 'var(--font-weight--semi-bold)',
          }}>
            Deployment successful
          </div>
          <div style={{
            fontFamily: 'var(--_typography---font-family--body)',
            fontSize: 'var(--_typography---body--sm)',
            color: 'var(--_color---text--secondary)',
          }}>
            2 minutes ago
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Dot status="info" style={{ marginTop: '4px' }} />
        <div>
          <div style={{
            fontFamily: 'var(--_typography---font-family--body)',
            fontSize: 'var(--_typography---body--md-base)',
            fontWeight: 'var(--font-weight--semi-bold)',
          }}>
            Build started
          </div>
          <div style={{
            fontFamily: 'var(--_typography---font-family--body)',
            fontSize: 'var(--_typography---body--sm)',
            color: 'var(--_color---text--secondary)',
          }}>
            5 minutes ago
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Dot status="neutral" style={{ marginTop: '4px' }} />
        <div>
          <div style={{
            fontFamily: 'var(--_typography---font-family--body)',
            fontSize: 'var(--_typography---body--md-base)',
            fontWeight: 'var(--font-weight--semi-bold)',
          }}>
            Code pushed to main
          </div>
          <div style={{
            fontFamily: 'var(--_typography---font-family--body)',
            fontSize: 'var(--_typography---body--sm)',
            color: 'var(--_color---text--secondary)',
          }}>
            10 minutes ago
          </div>
        </div>
      </div>
    </div>
  ),
};
