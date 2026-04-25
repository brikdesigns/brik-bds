import type { Meta, StoryObj } from '@storybook/react-vite';
import { Counter } from './Counter';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Counter> = {
  title: 'Components/Indicator/counter',
  component: Counter,
  tags: ['surface-shared'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    count: {
      control: { type: 'number', min: 0, max: 999 },
    },
    status: {
      control: 'select',
      options: ['success', 'error', 'warning', 'neutral', 'progress', 'brand'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    max: {
      control: { type: 'number', min: 1, max: 999 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Counter>;

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

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: {
    count: 5,
    status: 'success',
    size: 'sm',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — All statuses × all sizes + max overflow
   ═══════════════════════════════════════════════════════════════ */

/** @summary All variants side by side */
export const Variants: Story = {
  render: () => {
    const statuses = ['success', 'error', 'warning', 'neutral', 'progress', 'brand'] as const;
    const sizes = ['sm', 'md', 'lg'] as const;
    return (
      <Stack>
        {sizes.map((size) => (
          <div key={size}>
            <SectionLabel>{size}</SectionLabel>
            <Row>
              {statuses.map((status) => (
                <Counter key={`${size}-${status}`} count={1} status={status} size={size} />
              ))}
            </Row>
          </div>
        ))}
        <div>
          <SectionLabel>Max overflow</SectionLabel>
          <Row>
            <Counter count={5} max={99} status="error" size="md" />
            <Counter count={99} max={99} status="error" size="md" />
            <Counter count={150} max={99} status="error" size="md" />
          </Row>
        </div>
      </Stack>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Real-world usage
   ═══════════════════════════════════════════════════════════════ */

/** @summary Common usage patterns */
export const Patterns: Story = {
  name: 'Patterns',
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Notification counts</SectionLabel>
        <Stack gap="var(--gap-md)">
          {[
            { label: 'Inbox', count: 12, status: 'brand' as const },
            { label: 'Errors', count: 3, status: 'error' as const },
            { label: 'Pending', count: 7, status: 'warning' as const },
            { label: 'Complete', count: 42, status: 'success' as const },
          ].map(({ label, count, status }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
              <Counter count={count} status={status} />
              <span style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)' }}>{label}</span>
            </div>
          ))}
        </Stack>
      </div>
    </Stack>
  ),
};
