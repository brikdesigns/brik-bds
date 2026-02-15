import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'lg'],
      description: 'Size variant',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

// Size variants
export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

// All sizes
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <Spinner size="sm" />
        <span style={{
          fontFamily: 'var(--_typography---font-family--label)',
          fontSize: 'var(--_typography---label--sm)',
          color: 'var(--_color---text--secondary)',
        }}>
          Small (16px)
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <Spinner size="lg" />
        <span style={{
          fontFamily: 'var(--_typography---font-family--label)',
          fontSize: 'var(--_typography---label--sm)',
          color: 'var(--_color---text--secondary)',
        }}>
          Large (48px)
        </span>
      </div>
    </div>
  ),
};

// Contextual examples
export const InButton: Story = {
  render: () => (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        backgroundColor: 'var(--_color---background--brand-primary)',
        color: 'var(--_color---text--inverse)',
        border: 'none',
        borderRadius: 'var(--_border-radius---md)',
        fontFamily: 'var(--_typography---font-family--label)',
        fontSize: 'var(--_typography---label--md-base)',
        fontWeight: 'var(--font-weight--semi-bold)',
        cursor: 'wait',
      }}
      disabled
    >
      <Spinner size="sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
      Loading...
    </button>
  ),
};

export const CenteredInContainer: Story = {
  render: () => (
    <div
      style={{
        width: '400px',
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--_color---background--secondary)',
        borderRadius: 'var(--_border-radius---md)',
      }}
    >
      <Spinner size="lg" />
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <Spinner size="lg" />
      <p
        style={{
          fontFamily: 'var(--_typography---font-family--body)',
          fontSize: 'var(--_typography---body--md-base)',
          color: 'var(--_color---text--secondary)',
          margin: 0,
        }}
      >
        Loading your content...
      </p>
    </div>
  ),
};
