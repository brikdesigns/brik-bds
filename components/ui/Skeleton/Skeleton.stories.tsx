import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Indicator/skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
    },
    width: { control: 'text' },
    height: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

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
    variant: 'text',
    width: '200px',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — All shape variants
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Text</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)', maxWidth: '400px' }}>
          <Skeleton variant="text" />
          <Skeleton variant="text" width="85%" />
          <Skeleton variant="text" width="70%" />
        </div>
      </div>
      <div>
        <SectionLabel>Circular</SectionLabel>
        <Row>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={48} height={48} />
          <Skeleton variant="circular" width={64} height={64} />
        </Row>
      </div>
      <div>
        <SectionLabel>Rectangular</SectionLabel>
        <Skeleton variant="rectangular" width="300px" height="180px" />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Real-world loading states
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  name: 'Patterns',
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Article card</SectionLabel>
        <div style={{
          width: '300px',
          padding: 'var(--padding-md)',
          backgroundColor: 'var(--background-primary)',
          border: 'var(--border-width-md) solid var(--border-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--padding-sm)',
        }}>
          <Skeleton variant="rectangular" width="100%" height="160px" />
          <Skeleton variant="text" width="80%" height="24px" />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
      <div>
        <SectionLabel>Comment list</SectionLabel>
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 'var(--padding-sm)',
              padding: 'var(--padding-sm)',
              backgroundColor: 'var(--background-primary)',
              border: 'var(--border-width-md) solid var(--border-secondary)',
              borderRadius: 'var(--border-radius-md)',
            }}>
              <Skeleton variant="circular" width={40} height={40} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
                <Skeleton variant="text" width="30%" height="14px" />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="85%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Stack>
  ),
};
