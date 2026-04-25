import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog } from './Dialog';
import { Button } from '../Button';

const meta: Meta<typeof Dialog> = {
  title: 'Displays/Overlay/dialog',
  component: Dialog,
  tags: ['!manifest', 'surface-shared'], // deprecated — hide from MCP discovery (use Modal preset="confirm")
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

/* ─── Layout helpers ─────────────────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {children}
  </span>
);

const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', width: '100%' }}>
    {children}
  </div>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--gap-lg)', flexWrap: 'wrap' }}>
    {children}
  </div>
);

/* ─── Playground ─────────────────────────────────────────────── */

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

/* ─── Variants ───────────────────────────────────────────────── */

export const Variants: Story = {
  render: () => {
    const [openId, setOpenId] = useState<string | null>(null);
    const open = (id: string) => setOpenId(id);
    const close = () => setOpenId(null);

    return (
      <Stack>
        <SectionLabel>Default variant</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('default')}>Open dialog</Button>
            <Dialog
              isOpen={openId === 'default'}
              onClose={close}
              title="Confirm action"
              description="Are you sure you want to proceed? This action cannot be undone."
              onConfirm={close}
            />
          </div>
        </Row>

        <SectionLabel>Destructive variant</SectionLabel>
        <Row>
          <div>
            <Button variant="secondary" onClick={() => open('destructive')}>Delete item</Button>
            <Dialog
              isOpen={openId === 'destructive'}
              onClose={close}
              title="Delete item?"
              description="This will permanently remove the item. You cannot undo this action."
              variant="destructive"
              confirmLabel="Delete"
              cancelLabel="Keep"
              onConfirm={close}
            />
          </div>
        </Row>

        <SectionLabel>Custom content (replaces description)</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('custom')}>Open custom dialog</Button>
            <Dialog
              isOpen={openId === 'custom'}
              onClose={close}
              title="Update preferences"
              confirmLabel="Save"
              onConfirm={close}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
                <p style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)', color: 'var(--text-secondary)', margin: 0 }}>
                  Choose how you would like to receive notifications.
                </p>
                <label style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
                  <input type="checkbox" defaultChecked /> Email notifications
                </label>
                <label style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
                  <input type="checkbox" /> SMS notifications
                </label>
              </div>
            </Dialog>
          </div>
        </Row>
      </Stack>
    );
  },
};

/* ─── Patterns ───────────────────────────────────────────────── */

export const Patterns: Story = {
  render: () => {
    const [openId, setOpenId] = useState<string | null>(null);
    const open = (id: string) => setOpenId(id);
    const close = () => setOpenId(null);

    return (
      <Stack>
        <SectionLabel>Save changes before leaving</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('save')}>Leave page</Button>
            <Dialog
              isOpen={openId === 'save'}
              onClose={close}
              title="Unsaved changes"
              description="You have unsaved changes. Do you want to save before leaving?"
              confirmLabel="Save & leave"
              cancelLabel="Discard"
              onConfirm={close}
            />
          </div>
        </Row>

        <SectionLabel>Delete confirmation</SectionLabel>
        <Row>
          <div>
            <Button variant="secondary" onClick={() => open('delete')}>Delete company</Button>
            <Dialog
              isOpen={openId === 'delete'}
              onClose={close}
              title="Delete company?"
              description="This will permanently remove the company and all associated data. This action cannot be undone."
              variant="destructive"
              confirmLabel="Delete"
              onConfirm={close}
            />
          </div>
        </Row>
      </Stack>
    );
  },
};
