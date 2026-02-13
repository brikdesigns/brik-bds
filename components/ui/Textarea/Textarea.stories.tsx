import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    rows: {
      control: 'number',
      description: 'Number of visible text rows',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    resize: {
      control: 'select',
      options: ['none', 'both', 'horizontal', 'vertical'],
      description: 'Resize behavior',
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default textarea
 */
export const Default: Story = {
  args: {
    placeholder: 'Enter your text here...',
    rows: 4,
  },
};

/**
 * With placeholder
 */
export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Tell us about your project...',
    rows: 6,
  },
};

/**
 * With default value
 */
export const WithDefaultValue: Story = {
  args: {
    placeholder: 'Message',
    rows: 4,
    defaultValue: 'This is some default text that appears in the textarea.',
  },
};

/**
 * Disabled textarea
 */
export const Disabled: Story = {
  args: {
    placeholder: 'This field is disabled',
    rows: 4,
    disabled: true,
  },
};

/**
 * No resize
 */
export const NoResize: Story = {
  args: {
    placeholder: 'This textarea cannot be resized',
    rows: 4,
    resize: 'none',
  },
};

/**
 * Horizontal resize only
 */
export const HorizontalResize: Story = {
  args: {
    placeholder: 'Resize horizontally',
    rows: 4,
    resize: 'horizontal',
  },
};

/**
 * Many rows
 */
export const ManyRows: Story = {
  args: {
    placeholder: 'Large text area with many rows',
    rows: 10,
  },
};

/**
 * Form example with label
 */
export const FormExample: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--sm)', minWidth: '400px' }}>
      <label style={{
        fontFamily: 'var(--_typography---font-family--label)',
        fontSize: 'var(--_typography---label--md)',
        fontWeight: 600,
      }}>
        Comments
      </label>
      <Textarea
        placeholder="Share your feedback..."
        rows={6}
      />
    </div>
  ),
};

/**
 * Multiple textareas in a form
 */
export const MultipleTextareas: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--lg)', minWidth: '400px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--sm)' }}>
        <label style={{
          fontFamily: 'var(--_typography---font-family--label)',
          fontSize: 'var(--_typography---label--md)',
          fontWeight: 600,
        }}>
          Description
        </label>
        <Textarea
          placeholder="Describe your needs..."
          rows={4}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--sm)' }}>
        <label style={{
          fontFamily: 'var(--_typography---font-family--label)',
          fontSize: 'var(--_typography---label--md)',
          fontWeight: 600,
        }}>
          Additional Information
        </label>
        <Textarea
          placeholder="Any other details..."
          rows={4}
        />
      </div>
    </div>
  ),
};
