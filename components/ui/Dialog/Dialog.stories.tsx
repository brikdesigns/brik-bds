import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog } from './Dialog';
import { Button } from '../Button';

const meta: Meta<typeof Dialog> = {
  title: 'Containers/dialog',
  component: Dialog,
  tags: ['!manifest', 'surface-shared'], // deprecated — hide from MCP discovery (use Modal preset="confirm")
  parameters: { layout: 'centered' },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    confirmLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: '`destructive` is the starting template for delete-type confirmations.',
    },
    closeOnBackdrop: { control: 'boolean' },
    isOpen: { table: { disable: true } },
    onClose: { table: { disable: true } },
    onConfirm: { table: { disable: true } },
    children: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. `isOpen` has no uncontrolled mode,
   so the trigger + useState wiring is irreducible to args alone
   (ADR-010 Q4). `render` reads `args`, so title / description /
   confirmLabel / cancelLabel / variant / closeOnBackdrop stay live
   via Controls.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Deprecated — use `<Modal preset="confirm">`. Kept as a controlled
 * overlay for existing consumers migrating off it.
 *
 * @summary Confirm dialog (deprecated — use Modal preset="confirm")
 */
export const Default: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    title: 'Confirm action',
    description: 'Are you sure you want to proceed? This action cannot be undone.',
    variant: 'default',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
  },
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
};

/* ═══════════════════════════════════════════════════════════════
   DESTRUCTIVE — Q3 starting template (ADR-010's own canonical
   example: "variant: 'destructive' for a delete CTA").
   ═══════════════════════════════════════════════════════════════ */

/**
 * `variant="destructive"` switches the confirm button to the destructive
 * treatment — the starting template for delete-style confirmations.
 *
 * @summary Destructive variant — delete-style confirm action
 */
export const Destructive: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    variant: 'destructive',
    title: 'Delete item?',
    description: 'This will permanently remove the item. You cannot undo this action.',
    confirmLabel: 'Delete',
    cancelLabel: 'Keep',
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>Delete item</Button>
        <Dialog
          {...args}
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
        />
      </>
    );
  },
};
