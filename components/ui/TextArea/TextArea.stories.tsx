import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextArea } from './TextArea';

const meta = {
  title: 'Components/Form/text-area',
  component: TextArea,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant (controls font-size)',
    },
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
} satisfies Meta<typeof TextArea>;

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
 * Small size
 */
export const SizeSmall: Story = {
  args: {
    size: 'sm',
    label: 'Notes',
    placeholder: 'Small textarea...',
    rows: 4,
    fullWidth: true,
  },
};

/**
 * Medium size (default)
 */
export const SizeMedium: Story = {
  args: {
    size: 'md',
    label: 'Notes',
    placeholder: 'Medium textarea...',
    rows: 4,
    fullWidth: true,
  },
};

/**
 * Large size
 */
export const SizeLarge: Story = {
  args: {
    size: 'lg',
    label: 'Notes',
    placeholder: 'Large textarea...',
    rows: 4,
    fullWidth: true,
  },
};

/**
 * All sizes side by side
 */
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--gap-lg)', minWidth: '800px' }}>
      <div style={{ flex: 1 }}>
        <TextArea size="sm" label="Small" placeholder="sm variant..." rows={3} fullWidth />
      </div>
      <div style={{ flex: 1 }}>
        <TextArea size="md" label="Medium" placeholder="md variant..." rows={3} fullWidth />
      </div>
      <div style={{ flex: 1 }}>
        <TextArea size="lg" label="Large" placeholder="lg variant..." rows={3} fullWidth />
      </div>
    </div>
  ),
};

/**
 * Form example with label
 */
export const FormExample: Story = {
  parameters: {
    docs: {
      source: {
        code: `<label>Comments</label>
<TextArea placeholder="Share your feedback..." rows={6} />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)', minWidth: '400px' }}>
      <label style={{
        fontFamily: 'var(--font-family-label)',
        fontSize: 'var(--label-md)',
        fontWeight: 'var(--font-weight-semi-bold)',
      }}>
        Comments
      </label>
      <TextArea
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)', minWidth: '400px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
        <label style={{
          fontFamily: 'var(--font-family-label)',
          fontSize: 'var(--label-md)',
          fontWeight: 'var(--font-weight-semi-bold)',
        }}>
          Description
        </label>
        <TextArea
          placeholder="Describe your needs..."
          rows={4}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
        <label style={{
          fontFamily: 'var(--font-family-label)',
          fontSize: 'var(--label-md)',
          fontWeight: 'var(--font-weight-semi-bold)',
        }}>
          Additional Information
        </label>
        <TextArea
          placeholder="Any other details..."
          rows={4}
        />
      </div>
    </div>
  ),
};
