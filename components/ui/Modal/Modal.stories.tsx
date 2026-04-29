import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '../Button';

/**
 * Modal — overlay dialog with backdrop. Five sizes (`sm`/`md`/`lg`/`xl`/`full`),
 * configurable close behavior (`closeOnBackdrop`, `closeOnEscape`,
 * `showCloseButton`), and a `confirm` preset that auto-renders a confirm/cancel
 * footer. Replaces the deprecated `Dialog` (use `preset="confirm"`).
 * @summary Overlay dialog with backdrop and confirm preset
 */
const meta: Meta<typeof Modal> = {
  title: 'Components/Overlay/modal',
  component: Modal,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'] },
    closeOnBackdrop: { control: 'boolean' },
    closeOnEscape: { control: 'boolean' },
    showCloseButton: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

/** Args-driven sandbox. Includes an open + close interaction test.
 *  @summary Live playground with interaction test */
export const Playground: Story = {
  render: () => {
    const Demo = () => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open modal</Button>
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Title goes here"
            size="md"
            footer={
              <>
                <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setIsOpen(false)}>Save</Button>
              </>
            }
          >
            <p>Description goes here</p>
          </Modal>
        </>
      );
    };
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open modal' });
    await userEvent.click(trigger);
    const dialog = within(document.body).getByRole('dialog');
    await expect(dialog).toBeVisible();
    const closeButton = within(dialog).getByLabelText('Close');
    await userEvent.click(closeButton);
  },
};

/* ─── Size axis ──────────────────────────────────────────────── */

/** Small (sm) — 400px wide, for short confirmation dialogs.
 *  @summary Small modal */
export const Small: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open sm</Button>
          <Modal isOpen={open} onClose={() => setOpen(false)} title="SM modal" size="sm" footer={<Button variant="primary" onClick={() => setOpen(false)}>Done</Button>}>
            <p>This is a sm modal.</p>
          </Modal>
        </>
      );
    };
    return <Demo />;
  },
};

/** Medium (md) — 560px wide, default form modal.
 *  @summary Medium modal */
export const Medium: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open md</Button>
          <Modal isOpen={open} onClose={() => setOpen(false)} title="MD modal" size="md" footer={<Button variant="primary" onClick={() => setOpen(false)}>Done</Button>}>
            <p>This is a md modal.</p>
          </Modal>
        </>
      );
    };
    return <Demo />;
  },
};

/** Large (lg) — 720px wide, for detail views and complex forms.
 *  @summary Large modal */
export const Large: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open lg</Button>
          <Modal isOpen={open} onClose={() => setOpen(false)} title="LG modal" size="lg" footer={<Button variant="primary" onClick={() => setOpen(false)}>Done</Button>}>
            <p>This is a lg modal.</p>
          </Modal>
        </>
      );
    };
    return <Demo />;
  },
};

/* ─── Behavior shapes ────────────────────────────────────────── */

/** Scrolling content — body scrolls when content exceeds the modal max-height.
 *  Header + footer stay pinned.
 *  @summary Modal with scrolling body */
export const ScrollingContent: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open scrolling modal</Button>
          <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            title="Long content"
            footer={
              <>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setOpen(false)}>Done</Button>
              </>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
              {Array.from({ length: 20 }, (_, i) => (
                <p key={i}>Paragraph {i + 1}. The modal body scrolls when content exceeds max height.</p>
              ))}
            </div>
          </Modal>
        </>
      );
    };
    return <Demo />;
  },
};

/** No close button — `showCloseButton={false}` removes the header X. Force the
 *  user to use the footer or Escape.
 *  @summary Modal without header close button */
export const NoCloseButton: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open modal</Button>
          <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            title="No close button"
            showCloseButton={false}
            footer={<Button variant="primary" onClick={() => setOpen(false)}>Close</Button>}
          >
            <p>This modal has no header close button. Use the footer or press Escape.</p>
          </Modal>
        </>
      );
    };
    return <Demo />;
  },
};

/* ─── Confirm preset ─────────────────────────────────────────── */

/**
 * Confirm preset — compact alertdialog with auto-rendered confirm/cancel footer.
 * Replaces the deprecated `Dialog` component (per [ADR-004](../../docs/adrs/ADR-004-component-bloat-guardrails.md)).
 * @summary Confirm preset (default action)
 */
export const ConfirmPreset: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Confirm action</Button>
          <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            preset="confirm"
            title="Save changes?"
            description="Your edits will be applied to the live record."
            confirmLabel="Save"
            onConfirm={() => setOpen(false)}
          />
        </>
      );
    };
    return <Demo />;
  },
};

/** Confirm preset with `confirmVariant="destructive"` — confirm button switches
 *  to the destructive color for delete-style actions.
 *  @summary Confirm preset (destructive action) */
export const ConfirmPresetDestructive: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="destructive" onClick={() => setOpen(true)}>Delete item</Button>
          <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            preset="confirm"
            title="Delete this item?"
            description="This action cannot be undone."
            confirmLabel="Delete"
            confirmVariant="destructive"
            onConfirm={() => setOpen(false)}
          />
        </>
      );
    };
    return <Demo />;
  },
};

/* ─── Composition ────────────────────────────────────────────── */

/** Form in modal — common shape for create/edit dialogs.
 *  @summary Form fields inside a modal */
export const FormInModal: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open form</Button>
          <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            title="Contact form"
            footer={
              <>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setOpen(false)}>Submit</Button>
              </>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
                <label style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-md)' }}>Name</label>
                <input type="text" placeholder="Your name" style={{ padding: 'var(--padding-md)', border: 'var(--border-width-md) solid var(--border-input)', borderRadius: 'var(--border-radius-50)', fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
                <label style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-md)' }}>Email</label>
                <input type="email" placeholder="your@email.com" style={{ padding: 'var(--padding-md)', border: 'var(--border-width-md) solid var(--border-input)', borderRadius: 'var(--border-radius-50)', fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)' }} />
              </div>
            </div>
          </Modal>
        </>
      );
    };
    return <Demo />;
  },
};
