import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InteractiveListItem } from './InteractiveListItem';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';

/* ─── Layout helper (story-only) ─────────────────────────────────── */

const Stack = ({
  children,
  gap = 'var(--gap-tiny)',
}: {
  children: React.ReactNode;
  gap?: string;
}) => <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>;

/* ─── Meta ───────────────────────────────────────────────────────── */

const meta: Meta<typeof InteractiveListItem> = {
  title: 'Blocks/interactive-list-item',
  component: InteractiveListItem,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    title: { control: 'text', description: 'Primary title text.' },
    subtitle: {
      control: 'text',
      description: 'Optional secondary line. Also accepts multi-line ReactNode (see Variants).',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      description: 'Row size — `md` for full sheets/panels, `sm` for narrow slots (DevBar, popovers).',
    },
    disabled: { control: 'boolean', description: 'Mutes styling and blocks the click.' },
  },
};

export default meta;
type Story = StoryObj<typeof InteractiveListItem>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox
   ═══════════════════════════════════════════════════════════════ */

/**
 * Canonical row. Toggle `size` / `disabled` and edit `title` / `subtitle`
 * via Controls. The `leading` (Avatar) and `trailing` (Badge) slots are
 * fixed here to show the full three-slot layout.
 *
 * @summary Clickable row — leading + title + subtitle + trailing
 */
export const Default: Story = {
  args: {
    title: 'Emily Rivera',
    subtitle: 'Hygienist · 2 years',
    size: 'md',
    disabled: false,
  },
  render: (args) => (
    <div style={{ minWidth: 360 }}>
      <InteractiveListItem
        {...args}
        leading={<Avatar name="Emily Rivera" size="md" />}
        trailing={<Badge status="info">New hire</Badge>}
        onClick={() => {}}
      />
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   VARIANTS — irreducible composition (subtitle as rich ReactNode)
   ═══════════════════════════════════════════════════════════════ */

/**
 * Activity feed inside a sheet — each row drills into the related request.
 * The `subtitle` slot carries a multi-line ReactNode: a text line
 * (submitter · timestamp) above a row of inline `<Badge>`s; the `trailing`
 * slot shows a caret. Irreducible because the value is the multi-row feed
 * and the composed subtitle, which Controls can't express.
 *
 * @summary Activity feed with rich multi-line subtitle rows
 */
export const ActivityFeed: Story = {
  render: () => (
    <div style={{ minWidth: 520 }}>
      <Stack gap="0">
        <InteractiveListItem
          leading={
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--border-radius-circle)',
                backgroundColor: 'var(--surface-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--body-md)',
              }}
              aria-hidden="true"
            >
              📋
            </span>
          }
          title="Restock surgical gloves"
          subtitle={
            <>
              <span>Acme Dental Supply · Submitted 2d ago</span>
              <span style={{ display: 'flex', gap: 'var(--gap-sm)' }}>
                <Badge status="warning" size="xs">In review</Badge>
                <Badge status="error" size="xs">High</Badge>
              </span>
            </>
          }
          trailing={<span aria-hidden="true">›</span>}
          onClick={() => {}}
        />
        <InteractiveListItem
          leading={
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--border-radius-circle)',
                backgroundColor: 'var(--surface-positive, var(--surface-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--body-md)',
              }}
              aria-hidden="true"
            >
              ✓
            </span>
          }
          title="Replace HEPA filter, Operatory 3"
          subtitle={
            <>
              <span>Sarah Mitchell · Resolved 5d ago</span>
              <span style={{ display: 'flex', gap: 'var(--gap-sm)' }}>
                <Badge status="positive" size="xs">Resolved</Badge>
              </span>
            </>
          }
          trailing={<span aria-hidden="true">›</span>}
          onClick={() => {}}
        />
      </Stack>
    </div>
  ),
};
