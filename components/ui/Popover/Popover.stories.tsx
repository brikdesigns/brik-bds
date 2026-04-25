import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover } from './Popover';
import { Button } from '../Button';

/* ─── Layout Helpers (story-only) ─────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{
    fontFamily: 'var(--font-family-label)',
    fontSize: 'var(--body-xs)', // bds-lint-ignore
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 'var(--gap-md)',
    color: 'var(--text-muted)',
  }}>
    {children}
  </div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

const Row = ({ children, gap = 'var(--gap-lg)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap, alignItems: 'flex-start' }}>{children}</div>
);

/* ─── Shared Content ──────────────────────────────────── */

const sampleContent = (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--gap-sm)',
    fontFamily: 'var(--font-family-body)',
    fontSize: 'var(--body-md)',
    color: 'var(--text-primary)',
  }}>
    <strong style={{ fontWeight: 'var(--font-weight-semi-bold)' as unknown as number }}>
      Popover title
    </strong>
    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
      This is some helpful content inside the popover panel.
    </p>
  </div>
);

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof Popover> = {
  title: 'Displays/Overlay/popover',
  component: Popover,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ padding: '120px' /* bds-lint-ignore — space for popover overflow */ }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    trigger: {
      control: 'select',
      options: ['click', 'hover'],
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    content: sampleContent,
    placement: 'bottom',
    trigger: 'click',
    children: <Button variant="outline">Click me</Button>,
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Placements, trigger modes
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Placements</SectionLabel>
        <Row gap="var(--gap-xl)">
          <Popover content={sampleContent} placement="top">
            <Button variant="outline" size="sm">Top</Button>
          </Popover>
          <Popover content={sampleContent} placement="bottom">
            <Button variant="outline" size="sm">Bottom</Button>
          </Popover>
          <Popover content={sampleContent} placement="left">
            <Button variant="outline" size="sm">Left</Button>
          </Popover>
          <Popover content={sampleContent} placement="right">
            <Button variant="outline" size="sm">Right</Button>
          </Popover>
        </Row>
      </div>

      <div>
        <SectionLabel>Trigger modes</SectionLabel>
        <Row>
          <Popover content={sampleContent} trigger="click">
            <Button variant="outline" size="sm">Click trigger</Button>
          </Popover>
          <Popover content={sampleContent} trigger="hover">
            <Button variant="ghost" size="sm">Hover trigger</Button>
          </Popover>
        </Row>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Rich content popover
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Notification settings</SectionLabel>
        <Popover
          placement="bottom"
          content={
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--gap-md)',
              fontFamily: 'var(--font-family-body)',
              minWidth: 240,
            }}>
              <div style={{ fontSize: 'var(--label-md)', fontWeight: 'var(--font-weight-semi-bold)' as unknown as number, color: 'var(--text-primary)' }}>
                Notification settings
              </div>
              <label style={{ fontSize: 'var(--body-sm)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
                <input type="checkbox" defaultChecked /> Push notifications
              </label>
              <label style={{ fontSize: 'var(--body-sm)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
                <input type="checkbox" /> Email digest
              </label>
              <label style={{ fontSize: 'var(--body-sm)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
                <input type="checkbox" defaultChecked /> Sound alerts
              </label>
            </div>
          }
        >
          <Button>Settings</Button>
        </Popover>
      </div>
    </Stack>
  ),
};
