import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover } from './Popover';
import { Button } from '../Button';

/* ─── Layout helper (story-only) ──────────────────────────────── */

const Row = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
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
    <strong style={{ fontWeight: 'var(--font-weight-semibold)' as unknown as number }}>
      Popover title
    </strong>
    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
      This is some helpful content inside the popover panel.
    </p>
  </div>
);

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof Popover> = {
  title: 'Components/popover',
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
    content: { control: false, description: 'Popover panel content.' },
    children: { control: false, description: 'The trigger element.' },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    trigger: {
      control: 'select',
      options: ['click', 'hover'],
    },
    isOpen: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. Popover manages its own open
   state internally when `isOpen` is left unset, so args alone
   drive the trigger interaction — no render/hook wiring needed.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Click the trigger to reveal the panel. Switch `placement` and `trigger`
 * via Controls.
 *
 * @summary Floating content panel anchored to a trigger
 */
export const Default: Story = {
  args: {
    content: sampleContent,
    placement: 'bottom',
    trigger: 'click',
    children: <Button variant="outline">Click me</Button>,
  },
};

/* ═══════════════════════════════════════════════════════════════
   PLACEMENTS — narrow axis-only-gallery exception (ADR-006): side
   by side is the entire point, and the Controls panel can only
   show one placement at a time. Mirrors the sibling Tooltip file.
   ═══════════════════════════════════════════════════════════════ */

/**
 * All four placements around the trigger. Side-by-side is the point —
 * the Controls panel can only show one placement at a time.
 *
 * @summary All four placements side by side
 */
export const Placements: Story = {
  render: () => (
    <Row>
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
  ),
};
