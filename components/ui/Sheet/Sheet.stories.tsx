import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sheet } from './Sheet';
import { Button } from '../Button';

const meta: Meta<typeof Sheet> = {
  title: 'Components/Overlay/sheet',
  component: Sheet,
  parameters: { layout: 'centered' },
  argTypes: {
    side: { control: 'select', options: ['right', 'left', 'bottom'] },
    title: { control: 'text' },
    width: { control: 'text' },
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

const SampleContent = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)', fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)', color: 'var(--text-primary)', lineHeight: 'var(--font-line-height-normal)' }}>
    <p style={{ margin: 0 }}>This is the sheet panel content. Use it for detail views, settings panels, or contextual information.</p>
    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>The sheet slides in from the edge of the screen and overlays the main content with a backdrop.</p>
  </div>
);

/* ─── Playground ─────────────────────────────────────────────── */

export const Playground: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open sheet</Button>
        <Sheet {...args} isOpen={open} onClose={() => setOpen(false)}>
          <SampleContent />
        </Sheet>
      </>
    );
  },
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
    title: 'Details',
    side: 'right',
    width: '400px',
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
        <SectionLabel>Right (default)</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('right')}>Open right</Button>
            <Sheet isOpen={openId === 'right'} onClose={close} title="Details" side="right">
              <SampleContent />
            </Sheet>
          </div>
        </Row>

        <SectionLabel>Left</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('left')}>Open left</Button>
            <Sheet isOpen={openId === 'left'} onClose={close} title="Navigation" side="left" width="320px">
              <SampleContent />
            </Sheet>
          </div>
        </Row>

        <SectionLabel>Bottom</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('bottom')}>Open bottom</Button>
            <Sheet isOpen={openId === 'bottom'} onClose={close} title="Actions" side="bottom">
              <SampleContent />
            </Sheet>
          </div>
        </Row>

        <SectionLabel>Wide (600px)</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('wide')}>Open wide</Button>
            <Sheet isOpen={openId === 'wide'} onClose={close} title="Report Details" width="600px">
              <SampleContent />
            </Sheet>
          </div>
        </Row>

        <SectionLabel>No title</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('notitle')}>Open minimal</Button>
            <Sheet isOpen={openId === 'notitle'} onClose={close} showCloseButton>
              <SampleContent />
            </Sheet>
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
        <SectionLabel>Detail panel with actions</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('detail')}>View details</Button>
            <Sheet isOpen={openId === 'detail'} onClose={close} title="Company details">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
                <SampleContent />
                <div style={{ display: 'flex', gap: 'var(--gap-md)', justifyContent: 'flex-end' }}>
                  <Button variant="ghost" onClick={close}>Cancel</Button>
                  <Button variant="primary" onClick={close}>Save</Button>
                </div>
              </div>
            </Sheet>
          </div>
        </Row>

        <SectionLabel>Mobile bottom sheet</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('mobile')}>Show filters</Button>
            <Sheet isOpen={openId === 'mobile'} onClose={close} title="Filters" side="bottom">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
                <SampleContent />
                <Button variant="primary" onClick={close}>Apply filters</Button>
              </div>
            </Sheet>
          </div>
        </Row>
      </Stack>
    );
  },
};
