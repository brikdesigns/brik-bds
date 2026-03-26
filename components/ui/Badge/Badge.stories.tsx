import type { Meta, StoryObj } from '@storybook/react-vite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCircleExclamation, faSpinner, faCircleInfo, faCircleXmark, faTriangleExclamation, faRotate, faStar, faTag } from '@fortawesome/free-solid-svg-icons';
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
    variant: {
      control: 'select',
      options: ['dark', 'light'],
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
  args: { children: 'New', status: 'info', size: 'md', variant: 'dark' },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Dark and light styles × all statuses × all sizes
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      {/* Dark variant */}
      <div>
        <SectionLabel>Dark (default)</SectionLabel>
        <Stack gap="var(--gap-lg)">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Row key={size}>
              {statuses.map((s) => (
                <Badge key={s} size={size} status={s} variant="dark">{s}</Badge>
              ))}
            </Row>
          ))}
        </Stack>
      </div>
      {/* Light variant */}
      <div>
        <SectionLabel>Light</SectionLabel>
        <Stack gap="var(--gap-lg)">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Row key={size}>
              {statuses.map((s) => (
                <Badge key={s} size={size} status={s} variant="light">{s}</Badge>
              ))}
            </Row>
          ))}
        </Stack>
      </div>
      {/* xs icon-only — both variants */}
      <div>
        <SectionLabel>xs icon-only</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <Row>
            <Badge size="xs" status="positive" icon={<FontAwesomeIcon icon={faCheck} />} />
            <Badge size="xs" status="warning" icon={<FontAwesomeIcon icon={faTriangleExclamation} />} />
            <Badge size="xs" status="error" icon={<FontAwesomeIcon icon={faCircleXmark} />} />
            <Badge size="xs" status="info" icon={<FontAwesomeIcon icon={faCircleInfo} />} />
            <Badge size="xs" status="progress" icon={<FontAwesomeIcon icon={faRotate} />} />
          </Row>
          <Row>
            <Badge size="xs" status="positive" variant="light" icon={<FontAwesomeIcon icon={faCheck} />} />
            <Badge size="xs" status="warning" variant="light" icon={<FontAwesomeIcon icon={faTriangleExclamation} />} />
            <Badge size="xs" status="error" variant="light" icon={<FontAwesomeIcon icon={faCircleXmark} />} />
            <Badge size="xs" status="info" variant="light" icon={<FontAwesomeIcon icon={faCircleInfo} />} />
            <Badge size="xs" status="progress" variant="light" icon={<FontAwesomeIcon icon={faRotate} />} />
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
        <SectionLabel>Dark with icons</SectionLabel>
        <Row>
          <Badge status="positive" icon={<FontAwesomeIcon icon={faCheck} />}>Done</Badge>
          <Badge status="error" icon={<FontAwesomeIcon icon={faCircleExclamation} />}>Canceled</Badge>
          <Badge status="progress" icon={<FontAwesomeIcon icon={faSpinner} />}>In Progress</Badge>
          <Badge status="info" icon={<FontAwesomeIcon icon={faCircleInfo} />}>Neutral</Badge>
          <Badge status="warning" icon={<FontAwesomeIcon icon={faTriangleExclamation} />}>Needs Attention</Badge>
        </Row>
      </div>
      <div>
        <SectionLabel>Light with icons</SectionLabel>
        <Row>
          <Badge status="positive" variant="light" icon={<FontAwesomeIcon icon={faCheck} />}>Done</Badge>
          <Badge status="error" variant="light" icon={<FontAwesomeIcon icon={faCircleExclamation} />}>Canceled</Badge>
          <Badge status="progress" variant="light" icon={<FontAwesomeIcon icon={faSpinner} />}>In Progress</Badge>
          <Badge status="info" variant="light" icon={<FontAwesomeIcon icon={faCircleInfo} />}>Neutral</Badge>
          <Badge status="warning" variant="light" icon={<FontAwesomeIcon icon={faTriangleExclamation} />}>Needs Attention</Badge>
        </Row>
      </div>
      <div>
        <SectionLabel>Icons across sizes</SectionLabel>
        {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} style={{ display: 'flex', gap: 'var(--gap-md)', alignItems: 'center', marginBottom: 'var(--gap-md)' }}>
            <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--body-xs)', color: 'var(--text-muted)', width: '24px' }}>{size}</span>
            {size === 'xs' ? (
              <>
                <Badge size="xs" status="positive" icon={<FontAwesomeIcon icon={faCheck} />} />
                <Badge size="xs" status="error" icon={<FontAwesomeIcon icon={faCircleXmark} />} />
                <Badge size="xs" status="progress" icon={<FontAwesomeIcon icon={faRotate} />} />
              </>
            ) : (
              <>
                <Badge size={size} status="positive" icon={<FontAwesomeIcon icon={faCheck} />}>Done</Badge>
                <Badge size={size} status="error" icon={<FontAwesomeIcon icon={faCircleXmark} />}>Failed</Badge>
                <Badge size={size} status="progress" icon={<FontAwesomeIcon icon={faRotate} />}>Running</Badge>
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
              <Badge size="xs" status="positive" icon={<FontAwesomeIcon icon={faStar} />} />
              <Tag size="xs" icon={<FontAwesomeIcon icon={faTag} />} />
            </>
          ) : (
            <>
              <Badge size={size} status="positive" icon={<FontAwesomeIcon icon={faStar} />}>Active</Badge>
              <Tag size={size} icon={<FontAwesomeIcon icon={faTag} />}>Category</Tag>
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
        <SectionLabel>Content status (dark)</SectionLabel>
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
        <SectionLabel>Content status (light)</SectionLabel>
        <Stack gap="var(--gap-lg)">
          {([
            { status: 'positive' as const, label: 'Published', desc: 'Article is live and visible' },
            { status: 'progress' as const, label: 'In Review', desc: 'Being reviewed by editor' },
            { status: 'warning' as const, label: 'Draft', desc: 'Saved but not published' },
            { status: 'error' as const, label: 'Archived', desc: 'Has been removed' },
          ]).map(({ status, label, desc }) => (
            <div key={`${status}-light`} style={{ display: 'flex', gap: 'var(--gap-md)', alignItems: 'center' }}>
              <Badge status={status} variant="light">{label}</Badge>
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
