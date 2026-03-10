import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Indicator/skeleton',
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
  parameters: {
    docs: {
      source: {
        code: `<Skeleton variant="text" />
<Skeleton variant="text" width="85%" />
<Skeleton variant="text" width="70%" />

<Skeleton variant="circular" width={32} height={32} />
<Skeleton variant="circular" width={48} height={48} />
<Skeleton variant="circular" width={64} height={64} />

<Skeleton variant="rectangular" width="300px" height="180px" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-huge)' }}>
      <div>
        <h4 style={{
          fontFamily: 'var(--font-family-heading)',
          fontSize: 'var(--heading-tiny)',
          marginBottom: 'var(--padding-sm)',
        }}>
          Text
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)', maxWidth: '400px' }}>
          <Skeleton variant="text" />
          <Skeleton variant="text" width="85%" />
          <Skeleton variant="text" width="70%" />
        </div>
      </div>

      <div>
        <h4 style={{
          fontFamily: 'var(--font-family-heading)',
          fontSize: 'var(--heading-tiny)',
          marginBottom: 'var(--padding-sm)',
        }}>
          Circular
        </h4>
        <div style={{ display: 'flex', gap: 'var(--gap-lg)' }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={48} height={48} />
          <Skeleton variant="circular" width={64} height={64} />
        </div>
      </div>

      <div>
        <h4 style={{
          fontFamily: 'var(--font-family-heading)',
          fontSize: 'var(--heading-tiny)',
          marginBottom: 'var(--padding-sm)',
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
  parameters: {
    docs: {
      source: {
        code: `<Skeleton variant="rectangular" width="100%" height="160px" />
<Skeleton variant="text" width="80%" height="24px" />
<Skeleton variant="text" width="100%" />
<Skeleton variant="text" width="90%" />
<Skeleton variant="text" width="60%" />`,
      },
    },
  },
  render: () => (
    <div
      style={{
        width: '300px',
        padding: 'var(--padding-md)',
        backgroundColor: 'var(--background-primary)',
        border: '1px solid var(--border-secondary)',
        borderRadius: 'var(--border-radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--padding-sm)',
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
  parameters: {
    docs: {
      source: {
        code: `<Skeleton variant="circular" width={80} height={80} />
<Skeleton variant="text" width="60%" height="20px" />
<Skeleton variant="text" width="80%" height="14px" />
<Skeleton variant="rectangular" width="100%" height="36px" />`,
      },
    },
  },
  render: () => (
    <div
      style={{
        width: '280px',
        padding: 'var(--padding-lg)',
        backgroundColor: 'var(--background-primary)',
        border: '1px solid var(--border-secondary)',
        borderRadius: 'var(--border-radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--gap-lg)',
      }}
    >
      <Skeleton variant="circular" width={80} height={80} />
      <Skeleton variant="text" width="60%" height="20px" />
      <Skeleton variant="text" width="80%" height="14px" />
      <div style={{ width: '100%', display: 'flex', gap: 'var(--gap-md)', marginTop: 'var(--padding-sm)' }}>
        <Skeleton variant="rectangular" width="100%" height="36px" />
      </div>
    </div>
  ),
};

export const CommentList: Story = {
  parameters: {
    docs: {
      source: {
        code: `{/* Repeat for each comment */}
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="text" width="30%" height="14px" />
<Skeleton variant="text" width="100%" />
<Skeleton variant="text" width="85%" />`,
      },
    },
  },
  render: () => (
    <div
      style={{
        width: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-lg)',
      }}
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 'var(--padding-sm)',
            padding: 'var(--padding-sm)',
            backgroundColor: 'var(--background-primary)',
            border: '1px solid var(--border-secondary)',
            borderRadius: 'var(--border-radius-md)',
          }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
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
  parameters: {
    docs: {
      source: {
        code: `{/* Repeat for each row */}
<Skeleton variant="text" />
<Skeleton variant="text" />
<Skeleton variant="text" width="60%" />`,
      },
    },
  },
  render: () => (
    <div
      style={{
        width: '500px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1px', // bds-lint-ignore — 1px separator between rows
        backgroundColor: 'var(--border-secondary)',
        borderRadius: 'var(--border-radius-md)',
        overflow: 'hidden',
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr',
            gap: 'var(--gap-lg)',
            padding: 'var(--padding-sm) var(--padding-md)',
            backgroundColor: 'var(--background-primary)',
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
