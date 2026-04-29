import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { Badge } from './Badge';
import { Tag } from '../Tag/Tag';

/**
 * Badge — status indicator with semantic colors. Non-interactive — for
 * categorization and removable pills, see `Tag` and `Chip`.
 * @summary Status indicator with color and size variants
 */
const meta: Meta<typeof Badge> = {
  title: 'Components/Indicator/badge',
  component: Badge,
  parameters: { layout: 'centered' },
  argTypes: {
    status: { control: 'select', options: ['positive', 'warning', 'error', 'info', 'progress'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    appearance: { control: 'select', options: ['solid', 'subtle'] },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

const statuses = ['positive', 'warning', 'error', 'info', 'progress'] as const;
const sizes = ['xs', 'sm', 'md', 'lg'] as const;

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--gap-md)', flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

/* ─── Sandbox ────────────────────────────────────────────────── */

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { children: 'New', status: 'info', size: 'md', appearance: 'solid' },
};

/* ─── Status axis ────────────────────────────────────────────── */

/** All five status values side-by-side. ADR-006 axis-gallery exception.
 *  @summary All status values rendered together */
export const Statuses: Story = {
  render: () => (
    <Row>
      {statuses.map((s) => <Badge key={s} status={s}>{s}</Badge>)}
    </Row>
  ),
};

/** Subtle appearance — pastel background. Same statuses as `Statuses` but in
 *  the alternate appearance.
 *  @summary All statuses, subtle appearance */
export const Subtle: Story = {
  render: () => (
    <Row>
      {statuses.map((s) => <Badge key={s} status={s} appearance="subtle">{s}</Badge>)}
    </Row>
  ),
};

/* ─── Size axis ──────────────────────────────────────────────── */

/** All four sizes side-by-side. xs is icon-only (no text).
 *  @summary All sizes rendered together */
export const Sizes: Story = {
  render: () => (
    <Row>
      {sizes.map((size) => (
        size === 'xs'
          ? <Badge key={size} size="xs" status="info" icon={<Icon icon="ph:info" />} />
          : <Badge key={size} size={size} status="info">{size}</Badge>
      ))}
    </Row>
  ),
};

/* ─── Content shapes ─────────────────────────────────────────── */

/** Badge with leading icon — common pattern for status badges.
 *  @summary Badge with leading icon */
export const WithIcon: Story = {
  args: {
    status: 'positive',
    icon: <Icon icon="ph:check" />,
    children: 'Done',
  },
};

/** Icon-only badge (xs size) — used as a compact status indicator.
 *  Required to omit children at xs.
 *  @summary Icon-only badge at xs size */
export const IconOnly: Story = {
  args: {
    size: 'xs',
    status: 'positive',
    icon: <Icon icon="ph:check" />,
  },
};

/* ─── Cross-component contract ───────────────────────────────── */

/** Badge and Tag share the same height at every size tier. This story enforces
 *  that contract visually — if either component drifts, this story regresses.
 *  @summary Badge/Tag height alignment contract */
export const AlignedWithTag: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'flex', gap: 'var(--gap-md)', alignItems: 'center' }}>
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
        </div>
      ))}
    </div>
  ),
};
