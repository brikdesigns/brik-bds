import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Modal, type ModalProps } from './Modal';
import { Button } from '../Button';

/** Narrows `ModalProps` to the confirm-preset branch for the render callbacks below. */
type ModalConfirmArgs = Extract<ModalProps, { preset: 'confirm' }>;

const meta: Meta<typeof Modal> = {
  title: 'Components/modal',
  component: Modal,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    title: { control: 'text' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Default-shape only. `xl` unlocks multi-column body layouts (see TwoColumnForm).',
    },
    closeOnBackdrop: { control: 'boolean' },
    closeOnEscape: { control: 'boolean' },
    showCloseButton: {
      control: 'boolean',
      description: 'Default-shape only — hides the header X (footer / Escape remain the dismissal surface).',
    },
    description: { control: 'text', description: 'Confirm-preset only — body copy under the title.' },
    confirmLabel: { control: 'text', description: 'Confirm-preset only.' },
    cancelLabel: { control: 'text', description: 'Confirm-preset only.' },
    confirmVariant: {
      control: 'select',
      options: ['primary', 'destructive'],
      description: 'Confirm-preset only — `destructive` is the starting template for delete-type actions.',
    },
    confirmDisabled: { control: 'boolean', description: 'Confirm-preset only.' },
    confirmLoading: { control: 'boolean', description: 'Confirm-preset only.' },
    preset: {
      control: false,
      options: ['confirm'],
      description:
        'Discriminated-union entry point. Omit for the flexible default (header / body / footer slots); `"confirm"` renders the compact `alertdialog` preset and unlocks the `confirm*`/`cancelLabel` props.',
    },
    isOpen: { table: { disable: true } },
    onClose: { table: { disable: true } },
    onConfirm: { table: { disable: true } },
    children: { table: { disable: true } },
    footer: { table: { disable: true } },
    'aria-label': { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. `isOpen` has no uncontrolled mode,
   so the trigger + useState wiring is irreducible to args alone
   (ADR-010 Q4). `render` reads `args`, so size / closeOnBackdrop /
   closeOnEscape / showCloseButton stay live via Controls.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Default modal shape — header title, body, and footer actions. Toggle
 * size, closeOnBackdrop, closeOnEscape, and showCloseButton via Controls.
 *
 * @summary Default modal — header, body, and footer actions
 */
export const Default: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    title: 'Title goes here',
    size: 'md',
    closeOnBackdrop: true,
    closeOnEscape: true,
    showCloseButton: true,
    children: <p>Description goes here</p>,
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open modal</Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>Save</Button>
            </>
          }
        />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open modal' });

    // Open the modal
    await userEvent.click(trigger);

    // Modal renders in a portal — query from document.body
    const dialog = within(document.body).getByRole('dialog');
    await expect(dialog).toBeVisible();

    // role="dialog" must expose an accessible name (WCAG 4.1.2) — the
    // title is wired to the dialog via aria-labelledby (#844).
    await expect(dialog).toHaveAccessibleName('Title goes here');

    // Close via the close button
    const closeButton = within(dialog).getByLabelText('Close');
    await userEvent.click(closeButton);
  },
};

/* ═══════════════════════════════════════════════════════════════
   CONFIRM PRESET — two Q3 starting templates (ADR-010): the base
   confirm shape, and the destructive variant named in the matrix's
   own canonical example ("variant: 'destructive' for a delete CTA").
   ═══════════════════════════════════════════════════════════════ */

/**
 * `preset="confirm"` — compact alertdialog with an auto-rendered
 * confirm/cancel footer. Replaces the legacy `Dialog` component
 * (ADR-004). The starting template for confirmation flows.
 *
 * @summary preset="confirm" — auto-rendered confirm/cancel footer
 */
export const Confirm: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    preset: 'confirm',
    title: 'Save changes?',
    description: 'Your edits will be applied to the live record.',
    confirmLabel: 'Save',
    confirmVariant: 'primary',
  },
  argTypes: {
    size: { table: { disable: true } },
    closeOnBackdrop: { table: { disable: true } },
    closeOnEscape: { table: { disable: true } },
    showCloseButton: { table: { disable: true } },
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Confirm action</Button>
        <Modal
          {...(args as ModalConfirmArgs)}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={() => setIsOpen(false)}
        />
      </>
    );
  },
};

/**
 * `confirmVariant="destructive"` — switches the confirm button to the
 * destructive treatment while keeping the compact alertdialog shape. The
 * starting template for delete-type confirmations.
 *
 * @summary confirmVariant="destructive" — delete-style confirm action
 */
export const ConfirmDestructive: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    preset: 'confirm',
    title: 'Delete this item?',
    description: 'This action cannot be undone.',
    confirmLabel: 'Delete',
    confirmVariant: 'destructive',
  },
  argTypes: {
    size: { table: { disable: true } },
    closeOnBackdrop: { table: { disable: true } },
    closeOnEscape: { table: { disable: true } },
    showCloseButton: { table: { disable: true } },
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button variant="destructive" onClick={() => setIsOpen(true)}>Delete item</Button>
        <Modal
          {...(args as ModalConfirmArgs)}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={() => setIsOpen(false)}
        />
      </>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   TWO-COLUMN FORM — irreducible composition (ADR-010 Q4).
   ═══════════════════════════════════════════════════════════════ */

const fieldInput = {
  padding: 'var(--padding-md)',
  border: 'var(--border-width-md) solid var(--border-input)',
  borderRadius: 'var(--border-radius-50)',
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-md)',
} as const;

const Field = ({ label: text, children }: { label: string; children: React.ReactNode }) => (
  // Label wraps the control so it's implicitly associated (accessible name +
  // `getByLabelText` in the play test) without threading ids through.
  <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)', flex: '1 1 0', minWidth: 0 }}>
    <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-md)' }}>{text}</span>
    {children}
  </label>
);

/**
 * `xl` modal hosting a two-column showcase panel + lead form. Reachable as
 * a Control on `Default`, but that only widens an empty body — this story
 * exists because the production composition it unlocks (a showcase panel
 * beside a multi-field form; the brikdesigns lead-capture modal, #599) is
 * irreducible to a prop toggle (ADR-010 Q4): the side-by-side layout needs
 * `xl`'s width to read as two columns rather than wrap. The panel mirrors
 * the in-app `LeadModalLayout` (surface-primary card, border-muted edge,
 * stacked label → value → price · frequency); email and phone share a row
 * to keep the form compact.
 *
 * @summary xl modal — two-column showcase panel + lead-capture form
 */
export const TwoColumnForm: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Get started</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Get started"
          size="xl"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>Submit</Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-xl)', alignItems: 'stretch' }}>
            <aside
              style={{
                flex: '1 1 260px',
                maxWidth: 360,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--gap-md)',
                padding: 'var(--padding-md)',
                backgroundColor: 'var(--surface-primary)',
                border: 'var(--border-width-sm) solid var(--border-muted)',
                borderRadius: 'var(--border-radius-lg)',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  aspectRatio: '3 / 2',
                  backgroundColor: 'var(--surface-secondary)',
                  borderRadius: 'var(--border-radius-md)',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xs)' }}>
                <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-secondary)' }}>Interested in</span>
                <span style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'var(--heading-sm)', color: 'var(--text-primary)' }}>Brand Identity System</span>
                <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-secondary)' }}>$650 · one-time</span>
              </div>
            </aside>

            <div style={{ flex: '1.6 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
              <Field label="Name">
                <input type="text" placeholder="Your name" style={fieldInput} />
              </Field>
              <div style={{ display: 'flex', gap: 'var(--gap-lg)', flexWrap: 'wrap' }}>
                <Field label="Email">
                  <input type="email" placeholder="your@email.com" style={fieldInput} />
                </Field>
                <Field label="Phone">
                  <input type="tel" placeholder="(555) 555-5555" style={fieldInput} />
                </Field>
              </div>
              <Field label="Message">
                <textarea rows={4} placeholder="Tell us about your project" style={{ ...fieldInput, resize: 'vertical' }} />
              </Field>
            </div>
          </div>
        </Modal>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Get started' }));

    // Modal portals to document.body — query the dialog there (#599 gotcha).
    const dialog = within(document.body).getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleName('Get started');

    // Both columns render: the showcase panel (left) + the form (right).
    await expect(within(dialog).getByText('Interested in')).toBeVisible();
    await expect(within(dialog).getByLabelText('Email')).toBeVisible();
    await expect(within(dialog).getByLabelText('Phone')).toBeVisible();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  },
};
