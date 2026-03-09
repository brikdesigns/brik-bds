import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Snackbar } from './Snackbar';
import { Button } from '../Button';

const meta: Meta<typeof Snackbar> = {
  title: 'Components/Feedback/snackbar',
  component: Snackbar,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
    },
    variant: {
      control: 'select',
      options: ['default', 'success', 'error', 'warning'],
    },
  },
} satisfies Meta<typeof Snackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
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

export const Variants: Story = {
  render: () => {
    const [active, setActive] = useState<string | null>(null);
    return (
      <div style={{ display: 'flex', gap: 'var(--gap-md)', flexWrap: 'wrap' }}>
        <Button onClick={() => setActive('default')}>Default</Button>
        <Button onClick={() => setActive('success')}>Success</Button>
        <Button onClick={() => setActive('error')}>Error</Button>
        <Button onClick={() => setActive('warning')}>Warning</Button>
        <Snackbar
          isOpen={active === 'default'}
          onClose={() => setActive(null)}
          message="Default notification"
          position="bottom"
        />
        <Snackbar
          isOpen={active === 'success'}
          onClose={() => setActive(null)}
          message="Operation completed successfully!"
          variant="success"
          position="bottom"
        />
        <Snackbar
          isOpen={active === 'error'}
          onClose={() => setActive(null)}
          message="Something went wrong. Please try again."
          variant="error"
          position="bottom"
        />
        <Snackbar
          isOpen={active === 'warning'}
          onClose={() => setActive(null)}
          message="Your session will expire in 5 minutes."
          variant="warning"
          position="bottom"
        />
      </div>
    );
  },
};

export const WithAction: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Delete Item</Button>
        <Snackbar
          isOpen={open}
          onClose={() => setOpen(false)}
          message="Item deleted"
          action={
            <button
              type="button"
              onClick={() => { setOpen(false); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-brand-primary)',
                fontFamily: 'var(--font-family-label)',
                fontSize: 'var(--label-sm)',
                fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
                cursor: 'pointer',
                textDecoration: 'underline',
                flexShrink: 0,
              }}
            >
              Undo
            </button>
          }
          duration={5000}
          position="bottom"
        />
      </>
    );
  },
};

export const Positions: Story = {
  render: () => {
    const [pos, setPos] = useState<string | null>(null);
    return (
      <div style={{ display: 'flex', gap: 'var(--gap-md)', flexWrap: 'wrap' }}>
        {(['top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((p) => (
          <Button key={p} size="sm" variant="outline" onClick={() => setPos(p)}>
            {p}
          </Button>
        ))}
        {(['top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((p) => (
          <Snackbar
            key={p}
            isOpen={pos === p}
            onClose={() => setPos(null)}
            message={`Snackbar at ${p}`}
            position={p}
            duration={3000}
          />
        ))}
      </div>
    );
  },
};
