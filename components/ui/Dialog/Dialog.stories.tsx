import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog } from './Dialog';
import { Button } from '../Button';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Overlay/dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Dialog
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Confirm action"
          description="Are you sure you want to proceed? This action cannot be undone."
          onConfirm={() => {
            alert('Confirmed!');
            setOpen(false);
          }}
        />
      </>
    );
  },
};

export const Destructive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>Delete item</Button>
        <Dialog
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Delete item?"
          description="This will permanently remove the item. You cannot undo this action."
          confirmLabel="Delete"
          cancelLabel="Keep"
          variant="destructive"
          onConfirm={() => {
            alert('Deleted!');
            setOpen(false);
          }}
        />
      </>
    );
  },
};

export const CustomContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open custom dialog</Button>
        <Dialog
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Update preferences"
          confirmLabel="Save"
          onConfirm={() => setOpen(false)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
            <p style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--body-md)',
              color: 'var(--text-secondary)',
              margin: 0,
            }}>
              Choose how you would like to receive notifications.
            </p>
            <label style={{
              fontFamily: 'var(--font-family-label)',
              fontSize: 'var(--label-sm)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--gap-sm)',
            }}>
              <input type="checkbox" defaultChecked /> Email notifications
            </label>
            <label style={{
              fontFamily: 'var(--font-family-label)',
              fontSize: 'var(--label-sm)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--gap-sm)',
            }}>
              <input type="checkbox" /> SMS notifications
            </label>
          </div>
        </Dialog>
      </>
    );
  },
};
