import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Avatar> = {
  title: 'Foundations/Assets/avatar',
  component: Avatar,
  tags: ['surface-shared'],
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

/* ─── Character headshots (The Office) ────────────────────────── */

const headshots = {
  michael: 'https://randomuser.me/api/portraits/men/32.jpg',
  dwight:  'https://randomuser.me/api/portraits/men/44.jpg',
  jim:     'https://randomuser.me/api/portraits/men/75.jpg',
  pam:     'https://randomuser.me/api/portraits/women/68.jpg',
  creed:   'https://randomuser.me/api/portraits/men/85.jpg',
  oscar:   'https://randomuser.me/api/portraits/men/52.jpg',
};

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: {
    name: 'Michael Scott',
    src: headshots.michael,
    size: 'md',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, content types, statuses
   ═══════════════════════════════════════════════════════════════ */

/** @summary All variants side by side */
export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Sizes (initials)</SectionLabel>
        <Row>
          <Avatar name="Michael Scott" size="sm" />
          <Avatar name="Dwight Schrute" size="md" />
          <Avatar name="Jim Halpert" size="lg" />
          <Avatar name="Pam Beesly" size="xl" />
        </Row>
      </div>
      <div>
        <SectionLabel>With image</SectionLabel>
        <Row>
          <Avatar src={headshots.michael} alt="Michael Scott" name="Michael Scott" size="sm" />
          <Avatar src={headshots.dwight} alt="Dwight Schrute" name="Dwight Schrute" size="md" />
          <Avatar src={headshots.jim} alt="Jim Halpert" name="Jim Halpert" size="lg" />
          <Avatar src={headshots.pam} alt="Pam Beesly" name="Pam Beesly" size="xl" />
        </Row>
      </div>
      <div>
        <SectionLabel>Status indicators</SectionLabel>
        <Row>
          <Avatar src={headshots.michael} alt="Michael Scott" name="Michael Scott" status="online" />
          <Avatar src={headshots.dwight} alt="Dwight Schrute" name="Dwight Schrute" status="offline" />
          <Avatar src={headshots.jim} alt="Jim Halpert" name="Jim Halpert" status="busy" />
          <Avatar src={headshots.pam} alt="Pam Beesly" name="Pam Beesly" status="away" />
        </Row>
      </div>
      <div>
        <SectionLabel>Image + status (large)</SectionLabel>
        <Row>
          <Avatar src={headshots.creed} alt="Creed Bratton" name="Creed Bratton" status="online" size="lg" />
          <Avatar src={headshots.oscar} alt="Oscar Martinez" name="Oscar Martinez" status="busy" size="lg" />
          <Avatar src={headshots.michael} alt="Michael Scott" name="Michael Scott" status="away" size="lg" />
        </Row>
      </div>
    </Stack>
  ),
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
        <SectionLabel>User list</SectionLabel>
        <Stack gap="var(--gap-md)">
          {([
            { name: 'Michael Scott', src: headshots.michael, status: 'online' as const },
            { name: 'Dwight Schrute', src: headshots.dwight, status: 'online' as const },
            { name: 'Jim Halpert', src: headshots.jim, status: 'away' as const },
            { name: 'Pam Beesly', src: headshots.pam, status: 'online' as const },
            { name: 'Creed Bratton', src: headshots.creed, status: 'offline' as const },
            { name: 'Oscar Martinez', src: headshots.oscar, status: 'busy' as const },
          ]).map((user) => (
            <div key={user.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
              <Avatar name={user.name} src={user.src} status={user.status} />
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
        <div style={{ display: 'flex', marginLeft: 'var(--padding-sm)' }}>
          {([
            { name: 'Michael Scott', src: headshots.michael },
            { name: 'Dwight Schrute', src: headshots.dwight },
            { name: 'Jim Halpert', src: headshots.jim },
            { name: 'Pam Beesly', src: headshots.pam },
            { name: '+2', src: undefined },
          ]).map((user) => (
            <Avatar
              key={user.name}
              name={user.name}
              src={user.src}
              size="md"
              style={{ marginLeft: '-12px', border: '2px solid var(--background-input)' }}
            />
          ))}
        </div>
      </div>
    </Stack>
  ),
};
