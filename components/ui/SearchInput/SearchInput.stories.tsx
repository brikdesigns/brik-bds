import type { Meta, StoryObj } from '@storybook/react';
import { SearchInput } from './SearchInput';

const meta = {
  title: 'Components/search-input',
  component: SearchInput,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size variant',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    label: {
      control: 'text',
      description: 'Optional label text',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width input',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default search input
 */
export const Default: Story = {
  args: {
    placeholder: 'Search...',
  },
};

/**
 * Small search input
 */
export const Small: Story = {
  args: {
    placeholder: 'Search...',
    size: 'sm',
  },
};

/**
 * Search with label
 */
export const WithLabel: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search products...',
    fullWidth: true,
  },
};

/**
 * Disabled search input
 */
export const Disabled: Story = {
  args: {
    placeholder: 'Search...',
    disabled: true,
  },
};

/**
 * Both sizes compared
 */
export const AllSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<SearchInput size="md" placeholder="Medium search..." />
<SearchInput size="sm" placeholder="Small search..." />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---lg)', minWidth: '300px' }}>
      <SearchInput size="md" placeholder="Medium search..." fullWidth />
      <SearchInput size="sm" placeholder="Small search..." fullWidth />
    </div>
  ),
  args: {
    placeholder: 'Search...',
  },
};

/**
 * Small search with label for compact layouts
 */
export const SmallWithLabel: Story = {
  args: {
    label: 'Filter',
    placeholder: 'Filter results...',
    size: 'sm',
    fullWidth: true,
  },
};

/**
 * Search inputs in a toolbar layout
 */
export const ToolbarExample: Story = {
  parameters: {
    docs: {
      source: {
        code: `<SearchInput size="sm" placeholder="Search products..." />
<SearchInput size="sm" placeholder="Filter by name..." />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--_space---gap--lg)', alignItems: 'center' }}>
      <SearchInput size="sm" placeholder="Search products..." />
      <SearchInput size="sm" placeholder="Filter by name..." />
    </div>
  ),
  args: {
    placeholder: 'Search...',
  },
};
