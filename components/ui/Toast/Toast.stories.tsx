import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Components/toast',
  component: Toast,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    title: { control: 'text', description: 'Primary message line.' },
    description: { control: 'text', description: 'Optional secondary line; omit for a title-only toast.' },
    variant: {
      control: 'select',
      options: ['default', 'success', 'error', 'warning', 'info'],
      description: 'Status tone — selects the colored `Badge` icon. The surface stays white.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox
   ═══════════════════════════════════════════════════════════════ */

/**
 * Neutral toast — no badge. Edit `title` / `description`, switch `variant`,
 * and omit `onDismiss` for a non-dismissible toast via Controls.
 *
 * @summary White-surface notification with optional status badge
 */
export const Default: Story = {
  args: {
    title: 'Title goes here',
    description: 'Description goes here',
    variant: 'default',
    onDismiss: () => {},
  },
};

/* ═══════════════════════════════════════════════════════════════
   VARIANTS — one story per status tone
   ═══════════════════════════════════════════════════════════════ */

/** @summary Success — positive badge, circle-check icon */
export const Success: Story = {
  args: { title: 'Changes saved', description: 'Your settings have been updated successfully.', variant: 'success', onDismiss: () => {} },
};

/** @summary Error — error badge, circle-exclamation icon */
export const Error: Story = {
  args: { title: 'Something went wrong', description: 'Please try again or contact support.', variant: 'error', onDismiss: () => {} },
};

/** @summary Warning — warning badge, triangle-exclamation icon */
export const Warning: Story = {
  args: { title: 'Session expiring', description: 'Your session will expire in 5 minutes.', variant: 'warning', onDismiss: () => {} },
};

/** @summary Info — info badge, circle-info icon */
export const Info: Story = {
  args: { title: 'New update available', description: 'Version 2.1 is ready to install.', variant: 'info', onDismiss: () => {} },
};
