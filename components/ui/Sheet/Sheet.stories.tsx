import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sheet } from './Sheet';
import { Button } from '../Button';

const meta: Meta<typeof Sheet> = {
  title: 'Components/Overlay/sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    side: {
      control: 'select',
      options: ['right', 'left', 'bottom'],
    },
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const SampleContent = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--gap-lg)',
    fontFamily: 'var(--font-family-body)',
    fontSize: 'var(--body-md)',
    color: 'var(--text-primary)',
    lineHeight: 'var(--font-line-height-normal)',
  }}>
    <p style={{ margin: 0 }}>
      This is the sheet panel content. Use it for detail views,
      settings panels, or contextual information.
    </p>
    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
      The sheet slides in from the edge of the screen and overlays
      the main content with a backdrop.
    </p>
  </div>
);

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Sheet</Button>
        <Sheet {...args} isOpen={open} onClose={() => setOpen(false)}>
          <SampleContent />
        </Sheet>
      </>
    );
  },
  args: {
    title: 'Details',
    side: 'right',
  },
};

export const LeftSide: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Left Sheet</Button>
        <Sheet isOpen={open} onClose={() => setOpen(false)} title="Navigation" side="left" width="320px">
          <SampleContent />
        </Sheet>
      </>
    );
  },
};

export const BottomSheet: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Bottom Sheet</Button>
        <Sheet isOpen={open} onClose={() => setOpen(false)} title="Actions" side="bottom">
          <SampleContent />
        </Sheet>
      </>
    );
  },
};

export const WideSheet: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Wide Sheet</Button>
        <Sheet isOpen={open} onClose={() => setOpen(false)} title="Report Details" width="600px">
          <SampleContent />
        </Sheet>
      </>
    );
  },
};

export const NoTitle: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Minimal Sheet</Button>
        <Sheet isOpen={open} onClose={() => setOpen(false)} showCloseButton>
          <SampleContent />
        </Sheet>
      </>
    );
  },
};
