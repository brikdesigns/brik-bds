import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip';
import { Button } from '../Button';

/* ─── Layout helper (story-only) ──────────────────────────────── */

const Row = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap, alignItems: 'center' }}>{children}</div>
);

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof Tooltip> = {
  title: 'Components/tooltip',
  component: Tooltip,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ padding: '80px' /* bds-lint-ignore — extra space for tooltip overflow */ }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    content: { control: 'text', description: 'Tooltip text revealed on hover / focus.' },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Side the tooltip and its arrow anchor to.',
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof Tooltip>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox
   ═══════════════════════════════════════════════════════════════ */

/**
 * Canonical tooltip. Edit `content` and switch `placement` via Controls;
 * the trigger is whatever you pass as `children`.
 *
 * @summary Contextual hover/focus tooltip with arrow
 */
export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    placement: 'top',
    children: <Button variant="outline">Hover me</Button>,
  },
};

/* ═══════════════════════════════════════════════════════════════
   VARIANTS — placement axis gallery
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
      <Tooltip content="Top placement" placement="top">
        <Button variant="outline" size="sm">Top</Button>
      </Tooltip>
      <Tooltip content="Bottom placement" placement="bottom">
        <Button variant="outline" size="sm">Bottom</Button>
      </Tooltip>
      <Tooltip content="Left placement" placement="left">
        <Button variant="outline" size="sm">Left</Button>
      </Tooltip>
      <Tooltip content="Right placement" placement="right">
        <Button variant="outline" size="sm">Right</Button>
      </Tooltip>
    </Row>
  ),
};
