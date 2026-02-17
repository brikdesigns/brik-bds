import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Toast } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Components/toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: { control: 'text', description: 'Bold title text' },
    description: { control: 'text', description: 'Description text' },
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

export const TitleOnly: Story = {
  args: {
    title: 'Changes saved successfully',
    onDismiss: () => {},
  },
};

export const WithDescription: Story = {
  args: {
    title: 'File uploaded',
    description: 'Your document has been uploaded and is ready to share',
    onDismiss: () => {},
  },
};

export const NonDismissible: Story = {
  args: {
    title: 'Processing',
    description: 'Please wait while we complete your request',
  },
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
    onDismiss={() => setVisible(false)}
  />
)}`,
      },
    },
  },
  render: () => {
    const [visible, setVisible] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <button
          type="button"
          onClick={() => setVisible(true)}
          style={{
            fontFamily: 'var(--_typography---font-family--label)',
            fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
            fontSize: 'var(--_typography---label--sm)',
            padding: 'var(--_space---gap--md) var(--_space---gap--lg)',
            backgroundColor: 'var(--_color---background--brand-primary)',
            color: 'var(--_color---text--inverse)',
            border: 'none',
            borderRadius: 'var(--_border-radius---md)',
            cursor: 'pointer',
          }}
        >
          Show toast
        </button>
        {visible && (
          <Toast
            title="Action completed"
            description="Your changes have been saved"
            onDismiss={() => setVisible(false)}
          />
        )}
      </div>
    );
  },
};
