import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { Badge } from './Badge';
import { Tag } from '../Tag/Tag';

/* ─── Meta ────────────────────────────────────────────────────── */

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
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    appearance: {
      control: 'select',
      options: ['solid', 'subtle'],
    },
    density: {
      control: 'select',
      options: ['comfortable', 'compact'],
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

/* ═══════════════════════════════════════════════════════════════
   PLAYGROUND
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: { children: 'New', status: 'info', size: 'md', appearance: 'solid' },
};

/* ═══════════════════════════════════════════════════════════════
   VARIANTS — one story per status (solid appearance, md size)
   ═══════════════════════════════════════════════════════════════ */

/** @summary Positive — confirmation status, e.g. published, approved, complete */
export const Positive: Story = {
  args: { status: 'positive', children: 'Done' },
};

/** @summary Warning — caution status, e.g. draft, needs attention */
export const Warning: Story = {
  args: { status: 'warning', children: 'Draft' },
};

/** @summary Error — failure status, e.g. failed, archived, blocked */
export const Error: Story = {
  args: { status: 'error', children: 'Failed' },
};

/** @summary Info — neutral informational status (default tone) */
export const Info: Story = {
  args: { status: 'info', children: 'New' },
};

/** @summary Progress — in-flight status, often paired with a spinner icon */
export const Progress: Story = {
  args: { status: 'progress', children: 'In Progress' },
};

/* ═══════════════════════════════════════════════════════════════
   VARIANTS — appearance + size axes (axis-only galleries)
   ═══════════════════════════════════════════════════════════════ */

/**
 * Subtle appearance — softer surface, lower contrast. ADR-006 axis exception:
 * one component, the appearance axis varied across all five statuses.
 *
 * @summary Subtle appearance across all statuses
 */
export const Subtle: Story = {
  render: () => (
    <Row>
      <Badge status="positive" appearance="subtle">Done</Badge>
      <Badge status="warning" appearance="subtle">Draft</Badge>
      <Badge status="error" appearance="subtle">Failed</Badge>
      <Badge status="info" appearance="subtle">New</Badge>
      <Badge status="progress" appearance="subtle">In Progress</Badge>
    </Row>
  ),
};

/**
 * Sizes axis — the four size tokens (xs / sm / md / lg) on a single status.
 * `xs` is icon-only by design — it's too small for legible text. Other sizes
 * accept text or icon-prefixed text.
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

/**
 * Density axis — `comfortable` (default) vs `compact` at each text size.
 * Compact tightens horizontal padding one token-step down so more badges
 * fit inline in a dense table row; height is unchanged. `xs` is icon-only
 * and unaffected, so it's omitted here.
 *
 * @summary Comfortable vs compact density across sizes
 */
export const Density: Story = {
  render: () => (
    <Stack gap="var(--gap-lg)">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Row key={size}>
          <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--body-xs)', color: 'var(--text-muted)', width: '24px' }}>{size}</span>
          <Badge size={size} status="positive" density="comfortable">Comfortable</Badge>
          <Badge size={size} status="positive" density="compact">Compact</Badge>
        </Row>
      ))}
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   VARIANTS — composition (icons)
   ═══════════════════════════════════════════════════════════════ */

/** @summary Badge with a leading icon — tightens the semantic association */
export const WithIcon: Story = {
  args: {
    status: 'positive',
    children: 'Done',
    icon: <Icon icon="ph:check" />,
  },
};

/**
 * Icon-only badge at `xs` — the only legible icon-only size. Useful in
 * tight-packed lists where the icon alone communicates status.
 *
 * @summary Icon-only badge at xs size
 */
export const IconOnly: Story = {
  args: {
    size: 'xs',
    status: 'positive',
    icon: <Icon icon="ph:check" />,
  },
};

/* ═══════════════════════════════════════════════════════════════
   IRREDUCIBLE — sibling-component alignment showcase
   ═══════════════════════════════════════════════════════════════ */

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
          <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--body-xs)', color: 'var(--text-muted)', width: '24px' }}>{size}</span>
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

/* ═══════════════════════════════════════════════════════════════
   PATTERNS — real-world compositions
   ═══════════════════════════════════════════════════════════════ */

/** @summary Content lifecycle (solid) — published / in review / draft / archived */
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

/** @summary Content lifecycle (subtle) — same shape, lower-contrast appearance */
export const ContentStatusSubtle: Story = {
  render: () => (
    <Stack gap="var(--gap-lg)">
      <StatusRow label="Article is live and visible">
        <Badge status="positive" appearance="subtle">Published</Badge>
      </StatusRow>
      <StatusRow label="Being reviewed by editor">
        <Badge status="progress" appearance="subtle">In Review</Badge>
      </StatusRow>
      <StatusRow label="Saved but not published">
        <Badge status="warning" appearance="subtle">Draft</Badge>
      </StatusRow>
      <StatusRow label="Has been removed">
        <Badge status="error" appearance="subtle">Archived</Badge>
      </StatusRow>
    </Stack>
  ),
};
