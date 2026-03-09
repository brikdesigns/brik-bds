import type { Meta, StoryObj } from '@storybook/react-vite';
import { PasswordInput } from './PasswordInput';

const meta: Meta<typeof PasswordInput> = {
  title: 'Components/Input/password-input',
  component: PasswordInput,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
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
  },
};

export default meta;
type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    error: 'Password is required',
    defaultValue: '',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Password',
    placeholder: 'Enter password',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Password',
    placeholder: 'Enter password',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    helperText: 'Must be at least 8 characters',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Password',
    placeholder: 'Cannot edit',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    helperText: 'Must be at least 8 characters',
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

export const AllSizes: Story = {
  render: () => (
    <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PasswordInput size="sm" label="Small (sm)" placeholder="Enter password" fullWidth />
      <PasswordInput size="md" label="Medium (md)" placeholder="Enter password" fullWidth />
      <PasswordInput size="lg" label="Large (lg)" placeholder="Enter password" fullWidth />
    </div>
  ),
};
