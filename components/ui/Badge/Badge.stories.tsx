import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { Badge } from './Badge';
import { Tag } from '../Tag/Tag';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Badge> = {
  title: 'Components/Indicator/badge',
  component: Badge,
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
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

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

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--gap-md)', flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

const statuses = ['positive', 'warning', 'error', 'info', 'progress'] as const;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: { children: 'New', status: 'info', size: 'md', appearance: 'solid' },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Solid and subtle appearances × all statuses × all sizes
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      {/* Solid appearance */}
      <div>
        <SectionLabel>Solid (default)</SectionLabel>
        <Stack gap="var(--gap-lg)">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Row key={size}>
              {statuses.map((s) => (
                <Badge key={s} size={size} status={s} appearance="solid">{s}</Badge>
              ))}
            </Row>
          ))}
        </Stack>
      </div>
      {/* Subtle appearance */}
      <div>
        <SectionLabel>Subtle</SectionLabel>
        <Stack gap="var(--gap-lg)">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Row key={size}>
              {statuses.map((s) => (
                <Badge key={s} size={size} status={s} appearance="subtle">{s}</Badge>
              ))}
            </Row>
          ))}
        </Stack>
      </div>
      {/* xs icon-only — both appearances */}
      <div>
        <SectionLabel>xs icon-only</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <Row>
            <Badge size="xs" status="positive" icon={<Icon icon="ph:check" />} />
            <Badge size="xs" status="warning" icon={<Icon icon="ph:warning" />} />
            <Badge size="xs" status="error" icon={<Icon icon="ph:x-circle" />} />
            <Badge size="xs" status="info" icon={<Icon icon="ph:info" />} />
            <Badge size="xs" status="progress" icon={<Icon icon="ph:arrows-clockwise" />} />
          </Row>
          <Row>
            <Badge size="xs" status="positive" appearance="subtle" icon={<Icon icon="ph:check" />} />
            <Badge size="xs" status="warning" appearance="subtle" icon={<Icon icon="ph:warning" />} />
            <Badge size="xs" status="error" appearance="subtle" icon={<Icon icon="ph:x-circle" />} />
            <Badge size="xs" status="info" appearance="subtle" icon={<Icon icon="ph:info" />} />
            <Badge size="xs" status="progress" appearance="subtle" icon={<Icon icon="ph:arrows-clockwise" />} />
          </Row>
        </Stack>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. ICONS — Badges with leading icons
   ═══════════════════════════════════════════════════════════════ */

export const Icons: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Solid with icons</SectionLabel>
        <Row>
          <Badge status="positive" icon={<Icon icon="ph:check" />}>Done</Badge>
          <Badge status="error" icon={<Icon icon="ph:warning-circle" />}>Canceled</Badge>
          <Badge status="progress" icon={<Icon icon="ph:spinner" />}>In Progress</Badge>
          <Badge status="info" icon={<Icon icon="ph:info" />}>Neutral</Badge>
          <Badge status="warning" icon={<Icon icon="ph:warning" />}>Needs Attention</Badge>
        </Row>
      </div>
      <div>
        <SectionLabel>Subtle with icons</SectionLabel>
        <Row>
          <Badge status="positive" appearance="subtle" icon={<Icon icon="ph:check" />}>Done</Badge>
          <Badge status="error" appearance="subtle" icon={<Icon icon="ph:warning-circle" />}>Canceled</Badge>
          <Badge status="progress" appearance="subtle" icon={<Icon icon="ph:spinner" />}>In Progress</Badge>
          <Badge status="info" appearance="subtle" icon={<Icon icon="ph:info" />}>Neutral</Badge>
          <Badge status="warning" appearance="subtle" icon={<Icon icon="ph:warning" />}>Needs Attention</Badge>
        </Row>
      </div>
      <div>
        <SectionLabel>Icons across sizes</SectionLabel>
        {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} style={{ display: 'flex', gap: 'var(--gap-md)', alignItems: 'center', marginBottom: 'var(--gap-md)' }}>
            <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--body-xs)', color: 'var(--text-muted)', width: '24px' }}>{size}</span>
            {size === 'xs' ? (
              <>
                <Badge size="xs" status="positive" icon={<Icon icon="ph:check" />} />
                <Badge size="xs" status="error" icon={<Icon icon="ph:x-circle" />} />
                <Badge size="xs" status="progress" icon={<Icon icon="ph:arrows-clockwise" />} />
              </>
            ) : (
              <>
                <Badge size={size} status="positive" icon={<Icon icon="ph:check" />}>Done</Badge>
                <Badge size={size} status="error" icon={<Icon icon="ph:x-circle" />}>Failed</Badge>
                <Badge size={size} status="progress" icon={<Icon icon="ph:arrows-clockwise" />}>Running</Badge>
              </>
            )}
          </div>
        ))}
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   4. ALIGNMENT — Side-by-side with Tag at every size
   ═══════════════════════════════════════════════════════════════ */

export const Alignment: Story = {
  name: 'Badge + Tag alignment',
  render: () => (
    <Stack>
      <SectionLabel>Badge and Tag share the same height at every size tier</SectionLabel>
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
   5. PATTERNS — Real-world usage
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  name: 'Patterns',
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Content status (solid)</SectionLabel>
        <Stack gap="var(--gap-lg)">
          {([
            { status: 'positive' as const, label: 'Published', desc: 'Article is live and visible' },
            { status: 'progress' as const, label: 'In Review', desc: 'Being reviewed by editor' },
            { status: 'warning' as const, label: 'Draft', desc: 'Saved but not published' },
            { status: 'error' as const, label: 'Archived', desc: 'Has been removed' },
          ]).map(({ status, label, desc }) => (
            <div key={status} style={{ display: 'flex', gap: 'var(--gap-md)', alignItems: 'center' }}>
              <Badge status={status}>{label}</Badge>
              <span style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-secondary)' }}>
                {desc}
              </span>
            </div>
          ))}
        </Stack>
      </div>
      <div>
        <SectionLabel>Content status (subtle)</SectionLabel>
        <Stack gap="var(--gap-lg)">
          {([
            { status: 'positive' as const, label: 'Published', desc: 'Article is live and visible' },
            { status: 'progress' as const, label: 'In Review', desc: 'Being reviewed by editor' },
            { status: 'warning' as const, label: 'Draft', desc: 'Saved but not published' },
            { status: 'error' as const, label: 'Archived', desc: 'Has been removed' },
          ]).map(({ status, label, desc }) => (
            <div key={`${status}-subtle`} style={{ display: 'flex', gap: 'var(--gap-md)', alignItems: 'center' }}>
              <Badge status={status} appearance="subtle">{label}</Badge>
              <span style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-secondary)' }}>
                {desc}
              </span>
            </div>
          ))}
        </Stack>
      </div>
    </Stack>
  ),
};
