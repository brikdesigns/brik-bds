import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Avatar> = {
  title: 'Foundations/Assets/avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'offline', 'busy', 'away'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

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
    name: 'John Doe',
    size: 'md',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, content types, statuses
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Sizes (initials)</SectionLabel>
        <Row>
          <Avatar name="John Doe" size="sm" />
          <Avatar name="John Doe" size="md" />
          <Avatar name="John Doe" size="lg" />
          <Avatar name="John Doe" size="xl" />
        </Row>
      </div>
      <div>
        <SectionLabel>With image</SectionLabel>
        <Row>
          <Avatar src="https://i.pravatar.cc/150?img=1" alt="User" name="Sarah J" size="sm" />
          <Avatar src="https://i.pravatar.cc/150?img=1" alt="User" name="Sarah J" size="md" />
          <Avatar src="https://i.pravatar.cc/150?img=1" alt="User" name="Sarah J" size="lg" />
          <Avatar src="https://i.pravatar.cc/150?img=1" alt="User" name="Sarah J" size="xl" />
        </Row>
      </div>
      <div>
        <SectionLabel>Status indicators</SectionLabel>
        <Row>
          <Avatar name="User" status="online" />
          <Avatar name="User" status="offline" />
          <Avatar name="User" status="busy" />
          <Avatar name="User" status="away" />
        </Row>
      </div>
      <div>
        <SectionLabel>Image + status</SectionLabel>
        <Row>
          <Avatar src="https://i.pravatar.cc/150?img=5" alt="User" name="Sarah" status="online" size="lg" />
          <Avatar src="https://i.pravatar.cc/150?img=3" alt="User" name="Alex" status="busy" size="lg" />
          <Avatar src="https://i.pravatar.cc/150?img=8" alt="User" name="Taylor" status="away" size="lg" />
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
        <SectionLabel>User list</SectionLabel>
        <Stack gap="var(--gap-md)">
          {[
            { name: 'John Doe', status: 'online' as const },
            { name: 'Jane Smith', status: 'away' as const },
            { name: 'Bob Johnson', status: 'offline' as const },
            { name: 'Alice Williams', status: 'busy' as const },
          ].map((user) => (
            <div key={user.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
              <Avatar name={user.name} status={user.status} />
              <div>
                <div style={{
                  fontFamily: 'var(--font-family-label)',
                  fontSize: 'var(--label-md)', // bds-lint-ignore
                  fontWeight: 'var(--font-weight-semi-bold)',
                }}>
                  {user.name}
                </div>
                <div style={{
                  fontFamily: 'var(--font-family-body)',
                  fontSize: 'var(--body-sm)', // bds-lint-ignore
                  color: 'var(--text-secondary)',
                }}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </div>
              </div>
            </div>
          ))}
        </Stack>
      </div>
      <div>
        <SectionLabel>Avatar group (stacked)</SectionLabel>
        <div style={{ display: 'flex', marginLeft: '12px' }}>
          {['John Doe', 'Jane Smith', 'Bob Johnson', '+5'].map((name) => (
            <Avatar
              key={name}
              name={name}
              size="md"
              style={{ marginLeft: '-12px', border: '2px solid var(--background-input)' }}
            />
          ))}
        </div>
      </div>
    </Stack>
  ),
};
