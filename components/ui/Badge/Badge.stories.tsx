import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { Badge } from './Badge';
import { Tag } from '../Tag/Tag';

/* ─── Meta ────────────────────────────────────────────────────── */

/**
 * Badge — status indicator with semantic tones and sizes.
 * @summary Status indicator with semantic tones and sizes
 */
const meta: Meta<typeof Badge> = {
  title: 'Components/badge',
  component: Badge,
  tags: ['surface-shared'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['positive', 'warning', 'error', 'info', 'progress'],
      description: 'Semantic status tone — drives the badge color.',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description:
        'Size token (shared scale with Tag). `xs` is icon-only — text is suppressed, so pass `icon` and omit children.',
    },
    appearance: {
      control: 'select',
      options: ['solid', 'subtle'],
      description: 'Fill appearance — `solid` (saturated bg) or `subtle` (pastel bg, saturated text).',
    },
    density: {
      control: 'select',
      options: ['comfortable', 'compact'],
      description: '`compact` tightens horizontal padding one token-step for dense rows; height is unchanged.',
    },
    icon: {
      control: false,
      description: 'Optional leading icon (ReactNode). Required for `xs` size, which is icon-only.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

/* ─── Layout helpers (story-only) ─────────────────────────────── */

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--gap-md)', flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

const StatusRow = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <div style={{ display: 'flex', gap: 'var(--gap-md)', alignItems: 'center' }}>
    {children}
    <span style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-secondary)' }}>
      {label}
    </span>
  </div>
);

/* ─── Default ─────────────────────────────────────────────────── */

/** @summary Canonical badge — tweak props via Controls */
export const Default: Story = {
  args: { children: 'New', status: 'info', size: 'md', appearance: 'solid' },
};

/* ─── Status variants (Q3 — one per semantic tone) ────────────── */

/** @summary Positive status — published, approved, complete */
export const Positive: Story = {
  args: { status: 'positive', children: 'Done' },
};

/** @summary Warning status — draft, needs attention */
export const Warning: Story = {
  args: { status: 'warning', children: 'Draft' },
};

/** @summary Error status — failed, archived, blocked */
export const Error: Story = {
  args: { status: 'error', children: 'Failed' },
};

/** @summary Info — neutral informational status (default tone) */
export const Info: Story = {
  args: { status: 'info', children: 'New' },
};

/** @summary Progress — in-flight status, often with a spinner */
export const Progress: Story = {
  args: { status: 'progress', children: 'In Progress' },
};

/* ─── Size axis (the one args-lean axis gallery) ──────────────── */

/**
 * Size axis — the four size tokens (xs / sm / md / lg) side-by-side.
 * `xs` is icon-only (no text fits); the other sizes take text or icon + text.
 *
 * @summary All four sizes side-by-side
 */
export const Sizes: Story = {
  render: () => (
    <Row>
      <Badge size="xs" status="positive" icon={<Icon icon="ph:check" />} />
      <Badge size="sm" status="positive">Small</Badge>
      <Badge size="md" status="positive">Medium</Badge>
      <Badge size="lg" status="positive">Large</Badge>
    </Row>
  ),
};

/* ─── Patterns (Q4 irreducible + real-world composition) ──────── */

/**
 * Badge and Tag share the same height at every size tier. Render-mode is
 * required because the value of the demo is the *cross-component* alignment
 * — args alone can't render two different components in one story.
 *
 * @summary Badge + Tag pixel-aligned at every size
 */
export const BadgeTagAlignment: Story = {
  name: 'Badge + Tag alignment',
  render: () => (
    <Stack>
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Row key={size}>
          <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--body-xs)', color: 'var(--text-muted)', width: 'var(--size-600)' }}>{size}</span>
          {size === 'xs' ? (
            <>
              <Badge size="xs" status="positive" icon={<Icon icon="ph:star" />} />
              <Tag size="xs" icon={<Icon icon="ph:tag" />} />
            </>
          ) : (
            <>
              <Badge size={size} status="positive" icon={<Icon icon="ph:star" />}>Active</Badge>
              <Tag size={size} icon={<Icon icon="ph:tag" />}>Category</Tag>
            </>
          )}
        </Row>
      ))}
    </Stack>
  ),
};

/** @summary Content lifecycle statuses in a settings list */
export const ContentStatusSolid: Story = {
  render: () => (
    <Stack gap="var(--gap-lg)">
      <StatusRow label="Article is live and visible">
        <Badge status="positive">Published</Badge>
      </StatusRow>
      <StatusRow label="Being reviewed by editor">
        <Badge status="progress">In Review</Badge>
      </StatusRow>
      <StatusRow label="Saved but not published">
        <Badge status="warning">Draft</Badge>
      </StatusRow>
      <StatusRow label="Has been removed">
        <Badge status="error">Archived</Badge>
      </StatusRow>
    </Stack>
  ),
};
