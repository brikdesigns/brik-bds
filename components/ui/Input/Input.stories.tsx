import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Input

A themed text input component with support for labels, helper text, and error states.

## Features
- Optional label
- Helper text for guidance
- Error state with message
- Icon support (before/after)
- Full width option

## Theme Integration
Inputs automatically adapt to the current theme, using theme colors for borders, text, and error states.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
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
  render: () => (
    <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input label="Text" type="text" placeholder="Plain text" fullWidth />
      <Input label="Email" type="email" placeholder="email@example.com" fullWidth />
      <Input label="Password" type="password" placeholder="••••••••" fullWidth />
      <Input label="Number" type="number" placeholder="0" fullWidth />
    </div>
  ),
};
