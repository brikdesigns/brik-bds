import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchInput } from './SearchInput';

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

/* ─── Meta ────────────────────────────────────────────────────── */

const meta = {
  title: 'Components/Input/search-input',
  component: SearchInput,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    placeholder: { control: 'text' },
    label: { control: 'text' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 120, maxWidth: 520, padding: 'var(--padding-lg)' }}>
        <Story />
      </div>
    ),
  ],
  args: { fullWidth: true },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    placeholder: 'Search...',
    size: 'md',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, label, disabled
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      {/* Sizes */}
      <div>
        <SectionLabel>Sizes</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <SearchInput size="md" placeholder="Medium search..." fullWidth />
          <SearchInput size="sm" placeholder="Small search..." fullWidth />
        </Stack>
      </div>

      {/* With label */}
      <div>
        <SectionLabel>With label</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <SearchInput label="Search" placeholder="Search products..." fullWidth />
          <SearchInput label="Filter" placeholder="Filter results..." size="sm" fullWidth />
        </Stack>
      </div>

      {/* Disabled */}
      <div>
        <SectionLabel>Disabled</SectionLabel>
        <SearchInput placeholder="Search..." disabled fullWidth />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Real-world layouts
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => (
    <Stack>
      {/* Toolbar search */}
      <div>
        <SectionLabel>Toolbar search</SectionLabel>
        <div style={{ display: 'flex', gap: 'var(--gap-lg)', alignItems: 'center' }}>
          <SearchInput size="sm" placeholder="Search products..." />
          <SearchInput size="sm" placeholder="Filter by name..." />
        </div>
      </div>

      {/* Full-width page search */}
      <div>
        <SectionLabel>Page search</SectionLabel>
        <SearchInput label="Search" placeholder="Search the knowledge base..." fullWidth />
      </div>
    </Stack>
  ),
};
