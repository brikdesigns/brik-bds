import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { Tooltip } from './Tooltip';

/** Shared trigger button style for story demos */
const triggerStyles: CSSProperties = {
  padding: 'var(--padding-sm) var(--padding-lg)',
  backgroundColor: 'var(--background-brand-primary)',
  color: 'var(--text-inverse)',
  border: 'none',
  borderRadius: 'var(--border-radius-md)',
  cursor: 'pointer',
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--label-sm)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
};

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Feedback/tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '64px' /* bds-lint-ignore — extra space for tooltip overflow */ }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    content: {
      control: 'text',
      description: 'Tooltip content',
    },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Placement position',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

// Placement examples
export const Top: Story = {
  args: {
    content: 'This is a tooltip',
    placement: 'top',
    children: <button style={triggerStyles}>Hover me</button>,
  },
};

export const Bottom: Story = {
  args: {
    content: 'This appears below',
    placement: 'bottom',
    children: <button style={triggerStyles}>Hover me</button>,
  },
};

export const Left: Story = {
  args: {
    content: 'To the left',
    placement: 'left',
    children: <button style={triggerStyles}>Hover me</button>,
  },
};

export const Right: Story = {
  args: {
    content: 'To the right',
    placement: 'right',
    children: <button style={triggerStyles}>Hover me</button>,
  },
};

// All placements
export const AllPlacements: Story = {
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 'var(--padding-xl)',
      justifyItems: 'center',
    }}>
      <Tooltip content="Top placement" placement="top">
        <button style={triggerStyles}>Top</button>
      </Tooltip>
      <Tooltip content="Bottom placement" placement="bottom">
        <button style={triggerStyles}>Bottom</button>
      </Tooltip>
      <Tooltip content="Left placement" placement="left">
        <button style={triggerStyles}>Left</button>
      </Tooltip>
      <Tooltip content="Right placement" placement="right">
        <button style={triggerStyles}>Right</button>
      </Tooltip>
    </div>
  ),
};

// Contextual examples
export const IconButton: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--gap-md)' }}>
      <Tooltip content="Edit item">
        <button style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--background-secondary)',
          border: 'var(--border-width-md) solid var(--border-secondary)',
          borderRadius: 'var(--border-radius-md)',
          cursor: 'pointer',
        }}>
          ✏️
        </button>
      </Tooltip>
      <Tooltip content="Delete item">
        <button style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--background-secondary)',
          border: 'var(--border-width-md) solid var(--border-secondary)',
          borderRadius: 'var(--border-radius-md)',
          cursor: 'pointer',
        }}>
          🗑️
        </button>
      </Tooltip>
      <Tooltip content="Share">
        <button style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--background-secondary)',
          border: 'var(--border-width-md) solid var(--border-secondary)',
          borderRadius: 'var(--border-radius-md)',
          cursor: 'pointer',
        }}>
          📤
        </button>
      </Tooltip>
    </div>
  ),
};

export const WithKeyboardShortcut: Story = {
  render: () => (
    <Tooltip content="Save (Cmd+S)" placement="bottom">
      <button style={triggerStyles}>Save</button>
    </Tooltip>
  ),
};

export const HelpText: Story = {
  render: () => (
    <div style={{
      fontFamily: 'var(--font-family-body)',
      fontSize: 'var(--body-md)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--gap-md)',
    }}>
      <span>Username</span>
      <Tooltip content="Must be 3-20 characters" placement="right">
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '16px',
          height: '16px',
          backgroundColor: 'var(--background-secondary)',
          color: 'var(--text-secondary)',
          borderRadius: '50%',
          fontSize: 'var(--label-sm)', // bds-lint-ignore — matches help icon size
          cursor: 'help',
        }}>
          ?
        </span>
      </Tooltip>
    </div>
  ),
};
