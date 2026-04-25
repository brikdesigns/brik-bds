import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Toast } from './Toast';
import { Button } from '../Button';

const meta: Meta<typeof Toast> = {
  title: 'Components/Feedback/toast',
  component: Toast,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    variant: { control: 'select', options: ['default', 'success', 'error', 'warning', 'info'] },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

/* ─── Layout helpers ─────────────────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {children}
  </span>
);

const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', width: '100%', maxWidth: '500px' }}>
    {children}
  </div>
);

/* ─── Playground ─────────────────────────────────────────────── */

export const Playground: Story = {
  args: {
    title: 'Title goes here',
    description: 'Description goes here',
    variant: 'default',
    onDismiss: () => {},
  },
};

/* ─── Variants ───────────────────────────────────────────────── */

export const Variants: Story = {
  render: () => (
    <Stack>
      <SectionLabel>Default</SectionLabel>
      <Toast title="Default toast" description="No status badge — neutral notification" onDismiss={() => {}} />

      <SectionLabel>Success</SectionLabel>
      <Toast title="Changes saved" description="Your settings have been updated successfully." variant="success" onDismiss={() => {}} />

      <SectionLabel>Error</SectionLabel>
      <Toast title="Something went wrong" description="Please try again or contact support." variant="error" onDismiss={() => {}} />

      <SectionLabel>Warning</SectionLabel>
      <Toast title="Session expiring" description="Your session will expire in 5 minutes." variant="warning" onDismiss={() => {}} />

      <SectionLabel>Info</SectionLabel>
      <Toast title="New update available" description="Version 2.1 is ready to install." variant="info" onDismiss={() => {}} />

      <SectionLabel>Title only</SectionLabel>
      <Toast title="Changes saved successfully" variant="success" onDismiss={() => {}} />

      <SectionLabel>Non-dismissible</SectionLabel>
      <Toast title="Processing" description="Please wait while we complete your request" variant="info" />
    </Stack>
  ),
};

/* ─── Patterns ───────────────────────────────────────────────── */

export const Patterns: Story = {
  name: 'Patterns',
  render: () => {
    const [visible, setVisible] = useState(false);

    return (
      <Stack>
        <SectionLabel>Interactive toggle</SectionLabel>
        <Button variant="primary" size="sm" onClick={() => setVisible(true)}>Show toast</Button>
        {visible && (
          <Toast
            title="Action completed"
            description="Your changes have been saved"
            variant="success"
            onDismiss={() => setVisible(false)}
          />
        )}

        <SectionLabel>Error with context</SectionLabel>
        <Toast
          title="Upload failed"
          description="The file exceeds the maximum size of 10MB. Please compress and try again."
          variant="error"
          onDismiss={() => {}}
        />

        <SectionLabel>Informational</SectionLabel>
        <Toast
          title="Syncing in progress"
          description="Your data is being synchronized across devices. This may take a moment."
          variant="info"
        />
      </Stack>
    );
  },
};
