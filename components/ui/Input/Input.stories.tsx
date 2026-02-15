import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant (per Figma)',
    },
    label: {
      control: 'text',
      description: 'Label text',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    helperText: {
      control: 'text',
      description: 'Helper text shown below input',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width input',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'Input type',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// Basic input
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

// With label
export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    type: 'email',
  },
};

// With helper text
export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    helperText: 'Must be at least 8 characters',
  },
};

// Error state
export const WithError: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    type: 'email',
    error: 'Please enter a valid email address',
    defaultValue: 'invalid-email',
  },
};

// Disabled
export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit',
    disabled: true,
  },
};

// Full width
export const FullWidth: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'John Doe',
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

// Form example
export const FormExample: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Input label="First Name" placeholder="John" fullWidth />
<Input label="Last Name" placeholder="Doe" fullWidth />
<Input label="Email" type="email" placeholder="john@example.com" fullWidth />
<Input
  label="Phone"
  type="tel"
  placeholder="(555) 123-4567"
  helperText="We'll only contact you about your order"
  fullWidth
/>`,
      },
    },
  },
  render: () => (
    <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input label="First Name" placeholder="John" fullWidth />
      <Input label="Last Name" placeholder="Doe" fullWidth />
      <Input label="Email" type="email" placeholder="john@example.com" fullWidth />
      <Input
        label="Phone"
        type="tel"
        placeholder="(555) 123-4567"
        helperText="We'll only contact you about your order"
        fullWidth
      />
    </div>
  ),
};

// Input types
export const InputTypes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Input label="Text" type="text" placeholder="Plain text" />
<Input label="Email" type="email" placeholder="email@example.com" />
<Input label="Password" type="password" placeholder="••••••••" />
<Input label="Number" type="number" placeholder="0" />`,
      },
    },
  },
  render: () => (
    <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input label="Text" type="text" placeholder="Plain text" fullWidth />
      <Input label="Email" type="email" placeholder="email@example.com" fullWidth />
      <Input label="Password" type="password" placeholder="••••••••" fullWidth />
      <Input label="Number" type="number" placeholder="0" fullWidth />
    </div>
  ),
};

// Size variants (per Figma)
export const SizeSmall: Story = {
  args: {
    size: 'sm',
    label: 'Small Input',
    placeholder: '14px text',
  },
};

export const SizeMedium: Story = {
  args: {
    size: 'md',
    label: 'Medium Input',
    placeholder: '16px text (default)',
  },
};

export const SizeLarge: Story = {
  args: {
    size: 'lg',
    label: 'Large Input',
    placeholder: '18px text',
  },
};

// All sizes comparison
export const AllSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Input size="sm" label="Small" placeholder="14px text" />
<Input size="md" label="Medium" placeholder="16px text" />
<Input size="lg" label="Large" placeholder="18px text" />`,
      },
    },
  },
  render: () => (
    <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Input size="sm" label="Small (sm)" placeholder="14px text" fullWidth />
      <Input size="md" label="Medium (md)" placeholder="16px text - default" fullWidth />
      <Input size="lg" label="Large (lg)" placeholder="18px text" fullWidth />
    </div>
  ),
};
