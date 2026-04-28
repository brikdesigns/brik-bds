import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InteractiveListItem } from './InteractiveListItem';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { Tag } from '../Tag';

/* ─── Layout helpers (story-only) ────────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div
    style={{
      fontFamily: 'var(--font-family-label)',
      fontSize: 'var(--body-xs)', // bds-lint-ignore
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      marginBottom: 'var(--gap-md)',
      color: 'var(--text-muted)',
    }}
  >
    {children}
  </div>
);

const Stack = ({
  children,
  gap = 'var(--gap-tiny)',
}: {
  children: React.ReactNode;
  gap?: string;
}) => <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>;

/* ─── Meta ───────────────────────────────────────────────────────── */

const meta: Meta<typeof InteractiveListItem> = {
  title: 'Components/Display/InteractiveListItem',
  component: InteractiveListItem,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    title: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof InteractiveListItem>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: {
    title: 'Emily Rivera',
    subtitle: 'Hygienist · 2 years',
    disabled: false,
  },
  render: (args) => (
    <div style={{ minWidth: 360 }}>
      <InteractiveListItem
        {...args}
        leading={<Avatar name="Emily Rivera" size="md" />}
        trailing={<Badge status="info">New hire</Badge>}
        onClick={() => console.log('clicked')}
      />
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS
   ═══════════════════════════════════════════════════════════════ */

/** @summary Slot combinations side by side */
export const Variants: Story = {
  render: () => (
    <div style={{ minWidth: 480 }}>
      <Stack>
        <InteractiveListItem
          leading={<Avatar name="Emily Rivera" size="md" />}
          title="Title only"
          onClick={() => {}}
        />
        <InteractiveListItem
          leading={<Avatar name="Emily Rivera" size="md" />}
          title="Title + subtitle"
          subtitle="Single-line metadata"
          onClick={() => {}}
        />
        <InteractiveListItem
          leading={<Avatar name="Emily Rivera" size="md" />}
          title="Full row"
          subtitle="Hygienist · 2 years"
          trailing={<Badge status="info">New hire</Badge>}
          onClick={() => {}}
        />
        <InteractiveListItem
          leading={<Avatar name="Tyler Nguyen" size="md" />}
          title="Disabled"
          subtitle="No interaction"
          trailing={<Tag size="sm">Inactive</Tag>}
          disabled
          onClick={() => {}}
        />
      </Stack>
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS
   ═══════════════════════════════════════════════════════════════ */

/** @summary Real-world: an activity feed inside a sheet (request rows) */
export const Patterns: Story = {
  render: () => (
    <div style={{ minWidth: 520 }}>
      <SectionLabel>Activity feed (drill-down rows)</SectionLabel>
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
