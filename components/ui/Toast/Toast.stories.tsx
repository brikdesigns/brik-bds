import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast } from './Toast';
import { Button } from '../Button';

/**
 * Toast — transient notification with optional status variant. Dismissible by
 * default; pass `onDismiss` to handle close. Omit `onDismiss` to render as a
 * non-dismissible system message.
 * @summary Transient status notification with variants
 */
const meta: Meta<typeof Toast> = {
  title: 'Components/Feedback/toast',
  component: Toast,
  parameters: { layout: 'centered' },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    variant: { control: 'select', options: ['default', 'success', 'error', 'warning', 'info'] },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

/* ─── Sandbox ────────────────────────────────────────────────── */

/** Args-driven sandbox. Use Controls to explore variants and content.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    title: 'Title goes here',
    description: 'Description goes here',
    variant: 'default',
    onDismiss: () => {},
  },
};

/* ─── Variants ───────────────────────────────────────────────── */

/** Neutral notification — no status badge.
 *  @summary Default toast */
export const Default: Story = {
  args: {
    title: 'Default toast',
    description: 'No status badge — neutral notification.',
    onDismiss: () => {},
  },
};

/** Success status — confirms a completed action.
 *  @summary Success toast */
export const Success: Story = {
  args: {
    title: 'Changes saved',
    description: 'Your settings have been updated successfully.',
    variant: 'success',
    onDismiss: () => {},
  },
};

/** Error status — surfaces a failure that needs user attention.
 *  @summary Error toast */
export const Error: Story = {
  args: {
    title: 'Something went wrong',
    description: 'Please try again or contact support.',
    variant: 'error',
    onDismiss: () => {},
  },
};

/** Warning status — non-blocking but worth noticing.
 *  @summary Warning toast */
export const Warning: Story = {
  args: {
    title: 'Session expiring',
    description: 'Your session will expire in 5 minutes.',
    variant: 'warning',
    onDismiss: () => {},
  },
};

/** Info status — passive informational update.
 *  @summary Info toast */
export const Info: Story = {
  args: {
    title: 'New update available',
    description: 'Version 2.1 is ready to install.',
    variant: 'info',
    onDismiss: () => {},
  },
};

/* ─── Content shapes ─────────────────────────────────────────── */

/** Title-only — no description. Use for short confirmations.
 *  @summary Toast with title only */
export const TitleOnly: Story = {
  args: {
    title: 'Changes saved successfully',
    variant: 'success',
    onDismiss: () => {},
  },
};

/** Non-dismissible — omit `onDismiss` to suppress the close button. Use for
 *  system messages the user shouldn't be able to dismiss.
 *  @summary Non-dismissible toast */
export const NonDismissible: Story = {
  args: {
    title: 'Processing',
    description: 'Please wait while we complete your request.',
    variant: 'info',
  },
};

/* ─── Interactive ────────────────────────────────────────────── */

/** Interactive show/hide pattern — `useState` controls visibility, so `render` is required.
 *  @summary Toggle pattern with show/hide state */
export const Interactive: Story = {
  render: () => {
    const Toggle = () => {
      const [visible, setVisible] = useState(false);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
          <Button variant="primary" size="sm" onClick={() => setVisible(true)}>Show toast</Button>
          {visible && (
            <Toast
              title="Action completed"
              description="Your changes have been saved."
              variant="success"
              onDismiss={() => setVisible(false)}
            />
          )}
        </div>
      );
    };
    return <Toggle />;
  },
};
