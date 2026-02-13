import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Tooltip

A themed tooltip component for contextual information on hover/focus.

## Placement Options
- **top** - Above the trigger (default)
- **bottom** - Below the trigger
- **left** - Left of the trigger
- **right** - Right of the trigger

## Features
- Appears on hover and focus
- Includes directional arrow
- Keyboard accessible
- Auto-positions relative to trigger
- Non-interactive (doesn't block clicks)

## Usage
Use tooltips for:
- Explaining icon buttons
- Providing additional context
- Showing keyboard shortcuts
- Clarifying truncated text

## Best Practices
- Keep content concise (1-2 lines)
- Use for supplementary info, not critical content
- Don't use for complex layouts or interactions

## Accessibility
Includes proper \`role="tooltip"\` and responds to focus events
for keyboard navigation.
        `,
      },
    },
  },
  tags: ['autodocs'],
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
    children: <button style={{
      padding: '8px 16px',
      backgroundColor: 'var(--_color---background--brand-primary)',
      color: 'var(--_color---text--inverse)',
      border: 'none',
      borderRadius: 'var(--_border-radius---md)',
      cursor: 'pointer',
    }}>
      Hover me
    </button>,
  },
};

export const Bottom: Story = {
  args: {
    content: 'This appears below',
    placement: 'bottom',
    children: <button style={{
      padding: '8px 16px',
      backgroundColor: 'var(--_color---background--brand-primary)',
      color: 'var(--_color---text--inverse)',
      border: 'none',
      borderRadius: 'var(--_border-radius---md)',
      cursor: 'pointer',
    }}>
      Hover me
    </button>,
  },
};

export const Left: Story = {
  args: {
    content: 'To the left',
    placement: 'left',
    children: <button style={{
      padding: '8px 16px',
      backgroundColor: 'var(--_color---background--brand-primary)',
      color: 'var(--_color---text--inverse)',
      border: 'none',
      borderRadius: 'var(--_border-radius---md)',
      cursor: 'pointer',
    }}>
      Hover me
    </button>,
  },
};

export const Right: Story = {
  args: {
    content: 'To the right',
    placement: 'right',
    children: <button style={{
      padding: '8px 16px',
      backgroundColor: 'var(--_color---background--brand-primary)',
      color: 'var(--_color---text--inverse)',
      border: 'none',
      borderRadius: 'var(--_border-radius---md)',
      cursor: 'pointer',
    }}>
      Hover me
    </button>,
  },
};

// All placements
export const AllPlacements: Story = {
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '32px',
      padding: '64px',
    }}>
      <Tooltip content="Top placement" placement="top">
        <button style={{
          padding: '8px 16px',
          backgroundColor: 'var(--_color---background--brand-primary)',
          color: 'var(--_color---text--inverse)',
          border: 'none',
          borderRadius: 'var(--_border-radius---md)',
          cursor: 'pointer',
        }}>
          Top
        </button>
      </Tooltip>
      <Tooltip content="Bottom placement" placement="bottom">
        <button style={{
          padding: '8px 16px',
          backgroundColor: 'var(--_color---background--brand-primary)',
          color: 'var(--_color---text--inverse)',
          border: 'none',
          borderRadius: 'var(--_border-radius---md)',
          cursor: 'pointer',
        }}>
          Bottom
        </button>
      </Tooltip>
      <Tooltip content="Left placement" placement="left">
        <button style={{
          padding: '8px 16px',
          backgroundColor: 'var(--_color---background--brand-primary)',
          color: 'var(--_color---text--inverse)',
          border: 'none',
          borderRadius: 'var(--_border-radius---md)',
          cursor: 'pointer',
        }}>
          Left
        </button>
      </Tooltip>
      <Tooltip content="Right placement" placement="right">
        <button style={{
          padding: '8px 16px',
          backgroundColor: 'var(--_color---background--brand-primary)',
          color: 'var(--_color---text--inverse)',
          border: 'none',
          borderRadius: 'var(--_border-radius---md)',
          cursor: 'pointer',
        }}>
          Right
        </button>
      </Tooltip>
    </div>
  ),
};

// Contextual examples
export const IconButton: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Tooltip content="Edit item">
        <button style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--_color---background--secondary)',
          border: '1px solid var(--_color---border--default)',
          borderRadius: 'var(--_border-radius---md)',
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
          backgroundColor: 'var(--_color---background--secondary)',
          border: '1px solid var(--_color---border--default)',
          borderRadius: 'var(--_border-radius---md)',
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
          backgroundColor: 'var(--_color---background--secondary)',
          border: '1px solid var(--_color---border--default)',
          borderRadius: 'var(--_border-radius---md)',
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
      <button style={{
        padding: '8px 16px',
        backgroundColor: 'var(--_color---background--brand-primary)',
        color: 'var(--_color---text--inverse)',
        border: 'none',
        borderRadius: 'var(--_border-radius---md)',
        cursor: 'pointer',
      }}>
        Save
      </button>
    </Tooltip>
  ),
};

export const HelpText: Story = {
  render: () => (
    <div style={{
      fontFamily: 'var(--_typography---font-family--body)',
      fontSize: 'var(--_typography---body--md)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <span>Username</span>
      <Tooltip content="Must be 3-20 characters" placement="right">
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '16px',
          height: '16px',
          backgroundColor: 'var(--_color---background--secondary)',
          color: 'var(--_color---text--secondary)',
          borderRadius: '50%',
          fontSize: '12px',
          cursor: 'help',
        }}>
          ?
        </span>
      </Tooltip>
    </div>
  ),
};
