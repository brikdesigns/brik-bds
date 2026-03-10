import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Toast } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Components/Feedback/toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: { control: 'text', description: 'Bold title text' },
    description: { control: 'text', description: 'Description text' },
    variant: {
      control: 'select',
      options: ['default', 'success', 'error', 'warning', 'info'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  args: {
    title: 'Title goes here',
    description: 'Description goes here',
    onDismiss: () => {},
  },
};

export const Success: Story = {
  args: {
    title: 'Changes saved',
    description: 'Your settings have been updated successfully.',
    variant: 'success',
    onDismiss: () => {},
  },
};

export const Error: Story = {
  args: {
    title: 'Something went wrong',
    description: 'Please try again or contact support.',
    variant: 'error',
    onDismiss: () => {},
  },
};

export const Warning: Story = {
  args: {
    title: 'Session expiring',
    description: 'Your session will expire in 5 minutes.',
    variant: 'warning',
    onDismiss: () => {},
  },
};

export const Info: Story = {
  args: {
    title: 'New update available',
    description: 'Version 2.1 is ready to install.',
    variant: 'info',
    onDismiss: () => {},
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Changes saved successfully',
    variant: 'success',
    onDismiss: () => {},
  },
};

export const NonDismissible: Story = {
  args: {
    title: 'Processing',
    description: 'Please wait while we complete your request',
    variant: 'info',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      <Toast
        title="Default toast"
        description="No status badge — neutral notification"
        onDismiss={() => {}}
      />
      <Toast
        title="Success"
        description="Operation completed successfully"
        variant="success"
        onDismiss={() => {}}
      />
      <Toast
        title="Error"
        description="Something went wrong. Please try again."
        variant="error"
        onDismiss={() => {}}
      />
      <Toast
        title="Warning"
        description="Your session will expire soon"
        variant="warning"
        onDismiss={() => {}}
      />
      <Toast
        title="Info"
        description="A new version is available"
        variant="info"
        onDismiss={() => {}}
      />
    </div>
  ),
};

export const Interactive: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [visible, setVisible] = useState(false);

<button onClick={() => setVisible(true)}>Show toast</button>

{visible && (
  <Toast
    title="Action completed"
    description="Your changes have been saved"
    variant="success"
    onDismiss={() => setVisible(false)}
  />
)}`,
      },
    },
  },
  render: () => {
    const [visible, setVisible] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--gap-lg)' }}>
        <button
          type="button"
          onClick={() => setVisible(true)}
          style={{
            fontFamily: 'var(--font-family-label)',
            fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
            fontSize: 'var(--label-sm)',
            padding: 'var(--gap-sm) var(--padding-md)',
            backgroundColor: 'var(--background-brand-primary)',
            color: 'var(--text-on-color-dark)',
            border: 'none',
            borderRadius: 'var(--border-radius-md)',
            cursor: 'pointer',
          }}
        >
          Show toast
        </button>
        {visible && (
          <Toast
            title="Action completed"
            description="Your changes have been saved"
            variant="success"
            onDismiss={() => setVisible(false)}
          />
        )}
      </div>
    );
  },
};
