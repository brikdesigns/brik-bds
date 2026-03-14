import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Snackbar } from './Snackbar';
import { Button } from '../Button';

const meta: Meta<typeof Snackbar> = {
  title: 'Components/Feedback/snackbar',
  component: Snackbar,
  parameters: { layout: 'centered' },
  argTypes: {
    position: { control: 'select', options: ['top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'] },
    variant: { control: 'select', options: ['default', 'success', 'error', 'warning'] },
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
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', alignItems: 'center' }}>
    {children}
  </div>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-md)' }}>
    {children}
  </div>
);

/* ─── Playground ─────────────────────────────────────────────── */

export const Playground: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Show Snackbar</Button>
        <Snackbar {...args} isOpen={open} onClose={() => setOpen(false)} />
      </>
    );
  },
  args: {
    message: 'Your changes have been saved.',
    position: 'bottom',
    variant: 'default',
    duration: 4000,
  },
};

/* ─── Variants ───────────────────────────────────────────────── */

export const Variants: Story = {
  render: () => {
    const [active, setActive] = useState<string | null>(null);
    return (
      <Stack>
        <SectionLabel>Click to preview each variant</SectionLabel>
        <Row>
          <Button size="sm" onClick={() => setActive('default')}>Default</Button>
          <Button size="sm" onClick={() => setActive('success')}>Success</Button>
          <Button size="sm" onClick={() => setActive('error')}>Error</Button>
          <Button size="sm" onClick={() => setActive('warning')}>Warning</Button>
        </Row>
        <Snackbar isOpen={active === 'default'} onClose={() => setActive(null)} message="Default notification" position="bottom" />
        <Snackbar isOpen={active === 'success'} onClose={() => setActive(null)} message="Operation completed successfully!" variant="success" position="bottom" />
        <Snackbar isOpen={active === 'error'} onClose={() => setActive(null)} message="Something went wrong. Please try again." variant="error" position="bottom" />
        <Snackbar isOpen={active === 'warning'} onClose={() => setActive(null)} message="Your session will expire in 5 minutes." variant="warning" position="bottom" />
      </Stack>
    );
  },
};

/* ─── Patterns ───────────────────────────────────────────────── */

export const Patterns: Story = {
  name: 'Patterns',
  render: () => {
    const [pos, setPos] = useState<string | null>(null);
    const [undoOpen, setUndoOpen] = useState(false);

    return (
      <Stack>
        <SectionLabel>Position options</SectionLabel>
        <Row>
          {(['top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((p) => (
            <Button key={p} size="sm" variant="outline" onClick={() => setPos(p)}>{p}</Button>
          ))}
        </Row>
        {(['top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((p) => (
          <Snackbar key={p} isOpen={pos === p} onClose={() => setPos(null)} message={`Snackbar at ${p}`} position={p} duration={3000} />
        ))}

        <SectionLabel>With undo action</SectionLabel>
        <Button size="sm" variant="outline" onClick={() => setUndoOpen(true)}>Delete item</Button>
        <Snackbar
          isOpen={undoOpen}
          onClose={() => setUndoOpen(false)}
          message="Item deleted"
          action={
            <button
              type="button"
              onClick={() => setUndoOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-brand-primary)', fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', flexShrink: 0 }}
            >
              Undo
            </button>
          }
          duration={5000}
          position="bottom"
        />
      </Stack>
    );
  },
};
