import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dot } from './Dot';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Dot> = {
  title: 'Components/Indicator/dot',
  component: Dot,
  tags: ['surface-shared'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['default', 'positive', 'warning', 'error', 'info', 'neutral'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dot>;

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
  <div style={{ display: 'flex', gap: 'var(--gap-lg)', flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    status: 'default',
    size: 'md',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — All statuses × all sizes
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Statuses</SectionLabel>
        <Row>
          <Dot status="default" />
          <Dot status="positive" />
          <Dot status="warning" />
          <Dot status="error" />
          <Dot status="info" />
          <Dot status="neutral" />
        </Row>
      </div>
      <div>
        <SectionLabel>Sizes</SectionLabel>
        <Row>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--gap-md)' }}>
              <Dot size={size} status="positive" />
              <span style={{
                fontFamily: 'var(--font-family-label)',
                fontSize: 'var(--label-sm)', // bds-lint-ignore
                color: 'var(--text-secondary)',
              }}>
                {size}
              </span>
            </div>
          ))}
        </Row>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Real-world usage
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  name: 'Patterns',
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Status list</SectionLabel>
        <Stack gap="var(--gap-md)">
          {[
            { status: 'positive' as const, label: 'All systems operational' },
            { status: 'warning' as const, label: 'Minor service disruption' },
            { status: 'error' as const, label: 'Service outage detected' },
          ].map(({ status, label }) => (
            <div key={status} style={{ display: 'flex', gap: 'var(--gap-md)', alignItems: 'center' }}>
              <Dot status={status} size="sm" />
              <span style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)' }}>{label}</span>
            </div>
          ))}
        </Stack>
      </div>
      <div>
        <SectionLabel>Activity feed</SectionLabel>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--gap-lg)',
          padding: 'var(--padding-md)',
          backgroundColor: 'var(--background-secondary)',
          borderRadius: 'var(--border-radius-md)',
          width: '300px',
        }}>
          {[
            { status: 'positive' as const, title: 'Deployment successful', time: '2 minutes ago' },
            { status: 'info' as const, title: 'Build started', time: '5 minutes ago' },
            { status: 'neutral' as const, title: 'Code pushed to main', time: '10 minutes ago' },
          ].map(({ status, title, time }) => (
            <div key={title} style={{ display: 'flex', gap: 'var(--padding-sm)' }}>
              <Dot status={status} style={{ marginTop: 'var(--gap-xs)' }} />
              <div>
                <div style={{
                  fontFamily: 'var(--font-family-body)',
                  fontSize: 'var(--body-md)', // bds-lint-ignore
                  fontWeight: 'var(--font-weight-semi-bold)',
                }}>{title}</div>
                <div style={{
                  fontFamily: 'var(--font-family-body)',
                  fontSize: 'var(--body-sm)', // bds-lint-ignore
                  color: 'var(--text-secondary)',
                }}>{time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Stack>
  ),
};
