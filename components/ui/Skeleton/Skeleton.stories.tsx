import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
      description: 'Shape variant',
    },
    width: {
      control: 'text',
      description: 'Width (CSS value or number for px)',
    },
    height: {
      control: 'text',
      description: 'Height (CSS value or number for px)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

// Variant examples
export const Text: Story = {
  args: {
    variant: 'text',
    width: '200px',
  },
};

export const Circular: Story = {
  args: {
    variant: 'circular',
    width: 48,
    height: 48,
  },
};

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    width: '300px',
    height: '200px',
  },
};

// All variants
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h4 style={{
          fontFamily: 'var(--_typography---font-family--heading)',
          fontSize: 'var(--_typography---heading--tiny)',
          marginBottom: '12px',
        }}>
          Text
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px' }}>
          <Skeleton variant="text" />
          <Skeleton variant="text" width="85%" />
          <Skeleton variant="text" width="70%" />
        </div>
      </div>

      <div>
        <h4 style={{
          fontFamily: 'var(--_typography---font-family--heading)',
          fontSize: 'var(--_typography---heading--tiny)',
          marginBottom: '12px',
        }}>
          Circular
        </h4>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={48} height={48} />
          <Skeleton variant="circular" width={64} height={64} />
        </div>
      </div>

      <div>
        <h4 style={{
          fontFamily: 'var(--_typography---font-family--heading)',
          fontSize: 'var(--_typography---heading--tiny)',
          marginBottom: '12px',
        }}>
          Rectangular
        </h4>
        <Skeleton variant="rectangular" width="300px" height="180px" />
      </div>
    </div>
  ),
};

// Contextual examples
export const ArticleCard: Story = {
  render: () => (
    <div
      style={{
        width: '300px',
        padding: '16px',
        backgroundColor: 'var(--_color---background--primary)',
        border: '1px solid var(--_color---border--secondary)',
        borderRadius: 'var(--_border-radius---lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <Skeleton variant="rectangular" width="100%" height="160px" />
      <Skeleton variant="text" width="80%" height="24px" />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="text" width="60%" />
    </div>
  ),
};

export const UserProfile: Story = {
  render: () => (
    <div
      style={{
        width: '280px',
        padding: '24px',
        backgroundColor: 'var(--_color---background--primary)',
        border: '1px solid var(--_color---border--secondary)',
        borderRadius: 'var(--_border-radius---lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <Skeleton variant="circular" width={80} height={80} />
      <Skeleton variant="text" width="60%" height="20px" />
      <Skeleton variant="text" width="80%" height="14px" />
      <div style={{ width: '100%', display: 'flex', gap: '8px', marginTop: '12px' }}>
        <Skeleton variant="rectangular" width="100%" height="36px" />
      </div>
    </div>
  ),
};

export const CommentList: Story = {
  render: () => (
    <div
      style={{
        width: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: '12px',
            padding: '12px',
            backgroundColor: 'var(--_color---background--primary)',
            border: '1px solid var(--_color---border--secondary)',
            borderRadius: 'var(--_border-radius---md)',
          }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Skeleton variant="text" width="30%" height="14px" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="85%" />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const TableRows: Story = {
  render: () => (
    <div
      style={{
        width: '500px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
        backgroundColor: 'var(--_color---border--secondary)',
        borderRadius: 'var(--_border-radius---md)',
        overflow: 'hidden',
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr',
            gap: '16px',
            padding: '12px 16px',
            backgroundColor: 'var(--_color---background--primary)',
          }}
        >
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="60%" />
        </div>
      ))}
    </div>
  ),
};
