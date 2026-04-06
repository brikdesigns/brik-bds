import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '../Button';

const meta: Meta<typeof Modal> = {
  title: 'Displays/Overlay/modal',
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
        >
          <p>Description goes here</p>
        </Modal>
      </>
    );
  },
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
    title: 'Title goes here',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open modal' });

    // Open the modal
    await userEvent.click(trigger);

    // Modal renders in a portal — query from document.body
    const dialog = within(document.body).getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Close via the close button
    const closeButton = within(dialog).getByLabelText('Close');
    await userEvent.click(closeButton);
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
        <SectionLabel>Size: sm / md / lg</SectionLabel>
        <Row>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size}>
              <Button onClick={() => open(size)}>Open {size}</Button>
              <Modal
                isOpen={openId === size}
                onClose={close}
                title={`${size.toUpperCase()} modal`}
                size={size}
                footer={<Button variant="primary" onClick={close}>Done</Button>}
              >
                <p>This is a {size} modal.</p>
              </Modal>
            </div>
          ))}
        </Row>

        <SectionLabel>Scrolling content</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('scroll')}>Open scrolling modal</Button>
            <Modal
              isOpen={openId === 'scroll'}
              onClose={close}
              title="Long content"
              footer={
                <>
                  <Button variant="ghost" onClick={close}>Cancel</Button>
                  <Button variant="primary" onClick={close}>Done</Button>
                </>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
                {Array.from({ length: 20 }, (_, i) => (
                  <p key={i}>Paragraph {i + 1}. The modal body scrolls when content exceeds max height.</p>
                ))}
              </div>
            </Modal>
          </div>
        </Row>

        <SectionLabel>No close button</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('noclose')}>Open modal</Button>
            <Modal
              isOpen={openId === 'noclose'}
              onClose={close}
              title="No close button"
              showCloseButton={false}
              footer={<Button variant="primary" onClick={close}>Close</Button>}
            >
              <p>This modal has no header close button. Use the footer or press Escape.</p>
            </Modal>
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
        <SectionLabel>Confirm delete</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('delete')}>Confirm action</Button>
            <Modal
              isOpen={openId === 'delete'}
              onClose={close}
              title="Confirm delete"
              footer={
                <>
                  <Button variant="ghost" onClick={close}>Cancel</Button>
                  <Button variant="primary" onClick={close}>Delete</Button>
                </>
              }
            >
              <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            </Modal>
          </div>
        </Row>

        <SectionLabel>Form in modal</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('form')}>Open form</Button>
            <Modal
              isOpen={openId === 'form'}
              onClose={close}
              title="Contact form"
              footer={
                <>
                  <Button variant="ghost" onClick={close}>Cancel</Button>
                  <Button variant="primary" onClick={close}>Submit</Button>
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
          </div>
        </Row>
      </Stack>
    );
  },
};
