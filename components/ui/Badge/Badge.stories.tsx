import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

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
      options: ['positive', 'warning', 'error', 'info', 'progress', 'neutral'],
      description:
        'Semantic status tone — drives the badge color. `neutral` is a muted-gray, low-emphasis tone for inert states.',
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

/** @summary Progress — in-flight status, often with a spinner */
export const Progress: Story = {
  args: { status: 'progress', children: 'In Progress' },
};

/** @summary Neutral — muted-gray, inert status (skipped, not linked) */
export const Neutral: Story = {
  args: { status: 'neutral', children: 'Not linked' },
};

/* `size` is a Control on Default — the side-by-side scale lives in Badge.mdx
   as a docs-local demo (#1489). */

/* ─── Patterns (Q4 irreducible + real-world composition) ──────── */

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
