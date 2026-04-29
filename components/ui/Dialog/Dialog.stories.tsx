import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog } from './Dialog';
import { Button } from '../Button';

/**
 * **Deprecated** — use `<Modal preset="confirm">` instead. Same behavior, same
 * API (title, description, confirmLabel, cancelLabel, onConfirm), with
 * `confirmVariant="destructive"` covering this component's `variant="destructive"`.
 * This story remains only as a migration reference.
 * @summary [Deprecated] use Modal preset="confirm"
 */
const meta: Meta<typeof Dialog> = {
  title: 'Deprecated/Overlay/dialog',
  component: Dialog,
  tags: ['!manifest'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'destructive'] },
    title: { control: 'text' },
    description: { control: 'text' },
    confirmLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Args-driven sandbox. `render` is required because the dialog is controlled by `useState`.
 *  Kept for migration reference only. New code should use `Modal preset="confirm"`.
 *  @summary [Deprecated] live playground */
export const Playground: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Dialog
          {...args}
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
        />
      </>
    );
  },
  args: {
    isOpen: false,
    onClose: () => {},
    title: 'Confirm action',
    description: 'Are you sure you want to proceed? This action cannot be undone.',
    variant: 'default',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
  },
};
