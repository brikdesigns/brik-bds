import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Divider> = {
  title: 'Components/Structure/divider',
  component: Divider,
  tags: ['surface-shared'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    spacing: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

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

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

const bodyText: React.CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-md)', // bds-lint-ignore
  color: 'var(--text-primary)',
  margin: 0,
};

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    orientation: 'horizontal',
    spacing: 'none',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <p style={bodyText}>Content above the divider</p>
        <Story />
        <p style={bodyText}>Content below the divider</p>
      </div>
    ),
  ],
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Orientations and spacings
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Horizontal spacings</SectionLabel>
        <div style={{ width: '400px', ...bodyText, color: 'var(--text-secondary)', fontSize: 'var(--body-sm)' }}>
          <p style={{ margin: 0 }}>spacing="none"</p>
          <Divider spacing="none" />
          <p style={{ margin: 0 }}>spacing="sm"</p>
          <Divider spacing="sm" />
          <p style={{ margin: 0 }}>spacing="md"</p>
          <Divider spacing="md" />
          <p style={{ margin: 0 }}>spacing="lg"</p>
          <Divider spacing="lg" />
          <p style={{ margin: 0 }}>End</p>
        </div>
      </div>
      <div>
        <SectionLabel>Vertical</SectionLabel>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          height: '48px',
          ...bodyText,
        }}>
          <span>Left</span>
          <Divider orientation="vertical" spacing="md" />
          <span>Right</span>
        </div>
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
        <SectionLabel>Content section separator</SectionLabel>
        <div style={{ width: '400px' }}>
          <p style={bodyText}>First paragraph of content goes here. This section introduces the topic.</p>
          <Divider spacing="lg" />
          <p style={bodyText}>Second section with related content. The divider provides visual separation.</p>
        </div>
      </div>
      <div>
        <SectionLabel>Toolbar separator</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)', height: '32px' }}>
          <span style={bodyText}>Edit</span>
          <span style={bodyText}>Copy</span>
          <Divider orientation="vertical" spacing="sm" />
          <span style={bodyText}>Delete</span>
        </div>
      </div>
    </Stack>
  ),
};
