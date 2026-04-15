import React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilterToggle } from './FilterToggle';
import { FilterButton } from '../FilterButton/FilterButton';

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

const Row = ({ children, gap = 'var(--gap-lg)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap, alignItems: 'flex-start' }}>{children}</div>
);

/* ─── Meta ────────────────────────────────────────────── */

const meta = {
  title: 'Components/Action/filter-toggle',
  component: FilterToggle,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 120, padding: 'var(--padding-lg)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilterToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    label: 'Show Archived',
    active: false,
    onToggle: () => {},
    size: 'md',
  },
  render: (args) => {
    function Toggle() {
      const [active, setActive] = useState(args.active);
      return (
        <FilterToggle
          {...args}
          active={active}
          onToggle={() => setActive((prev) => !prev)}
        />
      );
    }
    return <Toggle />;
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, states
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  args: { label: 'Toggle', active: false, onToggle: () => {} },
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Sizes — inactive</SectionLabel>
        <Row>
          <FilterToggle label="Small" active={false} onToggle={() => {}} size="sm" />
          <FilterToggle label="Medium" active={false} onToggle={() => {}} size="md" />
          <FilterToggle label="Large" active={false} onToggle={() => {}} size="lg" />
        </Row>
      </div>

      <div>
        <SectionLabel>Sizes — active</SectionLabel>
        <Row>
          <FilterToggle label="Small" active onToggle={() => {}} size="sm" />
          <FilterToggle label="Medium" active onToggle={() => {}} size="md" />
          <FilterToggle label="Large" active onToggle={() => {}} size="lg" />
        </Row>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Mixed filter bar with FilterButton + FilterToggle
   ═══════════════════════════════════════════════════════════════ */

const statusOptions = [
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
  { id: 'pending', label: 'Pending' },
];

const roleOptions = [
  { id: 'admin', label: 'Admin' },
  { id: 'editor', label: 'Editor' },
  { id: 'viewer', label: 'Viewer' },
];

export const Patterns: Story = {
  args: { label: 'Toggle', active: false, onToggle: () => {} },
  render: () => {
    function FilterBar() {
      const [status, setStatus] = useState<string | undefined>();
      const [role, setRole] = useState<string | undefined>();
      const [primaryOnly, setPrimaryOnly] = useState(false);

      return (
        <Stack>
          <div>
            <SectionLabel>Filter bar — FilterButton + FilterToggle</SectionLabel>
            <Row>
              <FilterButton label="Status" options={statusOptions} value={status} onChange={setStatus} size="sm" />
              <FilterToggle
                label="Show Primary Contacts"
                active={primaryOnly}
                onToggle={() => setPrimaryOnly((prev) => !prev)}
                size="sm"
              />
              <FilterButton label="Role" options={roleOptions} value={role} onChange={setRole} size="sm" />
            </Row>
          </div>
        </Stack>
      );
    }
    return <FilterBar />;
  },
};
