import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta = {
  title: 'Components/avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    src: {
      control: 'text',
      description: 'Image source URL',
    },
    alt: {
      control: 'text',
      description: 'Alt text for image',
    },
    name: {
      control: 'text',
      description: 'Name for generating initials',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size variant',
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'offline', 'busy', 'away'],
      description: 'Status indicator',
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Avatar with initials (no image)
 */
export const Initials: Story = {
  args: {
    name: 'John Doe',
  },
};

/**
 * Avatar with image
 */
export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    alt: 'User avatar',
    name: 'John Doe',
  },
};

/**
 * Small size
 */
export const Small: Story = {
  args: {
    name: 'Jane Smith',
    size: 'sm',
  },
};

/**
 * Medium size (default)
 */
export const Medium: Story = {
  args: {
    name: 'Jane Smith',
    size: 'md',
  },
};

/**
 * Large size
 */
export const Large: Story = {
  args: {
    name: 'Jane Smith',
    size: 'lg',
  },
};

/**
 * Extra large size
 */
export const ExtraLarge: Story = {
  args: {
    name: 'Jane Smith',
    size: 'xl',
  },
};

/**
 * With online status
 */
export const Online: Story = {
  args: {
    name: 'Tara F.',
    status: 'online',
  },
};

/**
 * With offline status
 */
export const Offline: Story = {
  args: {
    name: 'Tara F.',
    status: 'offline',
  },
};

/**
 * With busy status
 */
export const Busy: Story = {
  args: {
    name: 'Tara F.',
    status: 'busy',
  },
};

/**
 * With away status
 */
export const Away: Story = {
  args: {
    name: 'Tara F.',
    status: 'away',
  },
};

/**
 * Image with status indicator
 */
export const ImageWithStatus: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=5',
    alt: 'User avatar',
    name: 'Sarah Johnson',
    status: 'online',
    size: 'lg',
  },
};

/**
 * All sizes comparison
 */
export const AllSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Avatar name="John Doe" size="sm" />
<Avatar name="John Doe" size="md" />
<Avatar name="John Doe" size="lg" />
<Avatar name="John Doe" size="xl" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--_space---gap--lg)' }}>
      <Avatar name="John Doe" size="sm" />
      <Avatar name="John Doe" size="md" />
      <Avatar name="John Doe" size="lg" />
      <Avatar name="John Doe" size="xl" />
    </div>
  ),
};

/**
 * All status indicators
 */
export const AllStatuses: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Avatar name="User" status="online" />
<Avatar name="User" status="offline" />
<Avatar name="User" status="busy" />
<Avatar name="User" status="away" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--_space---gap--lg)' }}>
      <Avatar name="User" status="online" />
      <Avatar name="User" status="offline" />
      <Avatar name="User" status="busy" />
      <Avatar name="User" status="away" />
    </div>
  ),
};

/**
 * User list with avatars
 */
export const UserList: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Avatar name="John Doe" status="online" />
<Avatar name="Jane Smith" status="away" />
<Avatar name="Bob Johnson" status="offline" />
<Avatar name="Alice Williams" status="busy" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--md)' }}>
      {[
        { name: 'John Doe', status: 'online' as const },
        { name: 'Jane Smith', status: 'away' as const },
        { name: 'Bob Johnson', status: 'offline' as const },
        { name: 'Alice Williams', status: 'busy' as const },
        { name: 'Tara F.', status: 'online' as const },
      ].map((user) => (
        <div
          key={user.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--_space---gap--sm)',
          }}
        >
          <Avatar name={user.name} status={user.status} />
          <div>
            <div
              style={{
                fontFamily: 'var(--_typography---font-family--label)',
                fontSize: 'var(--_typography---label--md-base)',
                fontWeight: 'var(--font-weight--semi-bold)',
              }}
            >
              {user.name}
            </div>
            <div
              style={{
                fontFamily: 'var(--_typography---font-family--body)',
                fontSize: 'var(--_typography---body--sm)',
                color: 'var(--grayscale--light)',
              }}
            >
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * Avatar group (stacked)
 */
export const AvatarGroup: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Avatar name="John Doe" size="md" />
<Avatar name="Jane Smith" size="md" />
<Avatar name="Bob Johnson" size="md" />
<Avatar name="+5" size="md" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', marginLeft: '12px' }}>
      <Avatar
        name="John Doe"
        size="md"
        style={{ marginLeft: '-12px', border: '2px solid var(--_color---background--input)' }}
      />
      <Avatar
        name="Jane Smith"
        size="md"
        style={{ marginLeft: '-12px', border: '2px solid var(--_color---background--input)' }}
      />
      <Avatar
        name="Bob Johnson"
        size="md"
        style={{ marginLeft: '-12px', border: '2px solid var(--_color---background--input)' }}
      />
      <Avatar
        name="+5"
        size="md"
        style={{ marginLeft: '-12px', border: '2px solid var(--_color---background--input)' }}
      />
    </div>
  ),
};
