import type { Meta, StoryObj } from '@storybook/react-vite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCircleExclamation, faSpinner, faCircleInfo, faCircleXmark, faTriangleExclamation, faRotate } from '@fortawesome/free-solid-svg-icons';
import { Badge } from './Badge';

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

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: { children: 'New', status: 'info', size: 'md' },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — All statuses × all sizes
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      {/* xs row — icon only */}
      <div>
        <SectionLabel>xs (icon only)</SectionLabel>
        <Row>
          <Badge size="xs" status="positive" icon={<FontAwesomeIcon icon={faCheck} />} />
          <Badge size="xs" status="warning" icon={<FontAwesomeIcon icon={faTriangleExclamation} />} />
          <Badge size="xs" status="error" icon={<FontAwesomeIcon icon={faCircleXmark} />} />
          <Badge size="xs" status="info" icon={<FontAwesomeIcon icon={faCircleInfo} />} />
          <Badge size="xs" status="progress" icon={<FontAwesomeIcon icon={faRotate} />} />
        </Row>
      </div>
      {/* sm, md, lg rows — text labels */}
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <SectionLabel>{size}</SectionLabel>
          <Row>
            <Badge size={size} status="positive">Positive</Badge>
            <Badge size={size} status="warning">Warning</Badge>
            <Badge size={size} status="error">Error</Badge>
            <Badge size={size} status="info">Info</Badge>
            <Badge size={size} status="progress">Progress</Badge>
          </Row>
        </div>
      ))}
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
        <SectionLabel>With icons</SectionLabel>
        <Row>
          <Badge status="positive" icon={<FontAwesomeIcon icon={faCheck} />}>Success</Badge>
          <Badge status="error" icon={<FontAwesomeIcon icon={faCircleExclamation} />}>Error</Badge>
          <Badge status="progress" icon={<FontAwesomeIcon icon={faSpinner} />}>Loading</Badge>
          <Badge status="info" icon={<FontAwesomeIcon icon={faCircleInfo} />}>Info</Badge>
          <Badge status="warning" icon={<FontAwesomeIcon icon={faTriangleExclamation} />}>Warning</Badge>
        </Row>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   4. PATTERNS — Real-world usage
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  name: 'Patterns',
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Content status</SectionLabel>
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
    </Stack>
  ),
};
