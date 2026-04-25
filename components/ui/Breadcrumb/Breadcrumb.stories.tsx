import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumb } from './Breadcrumb';

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

const meta: Meta<typeof Breadcrumb> = {
  title: 'Navigation/Secondary/breadcrumb',
  component: Breadcrumb,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    separator: { control: 'select', options: ['slash', 'chevron'] },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Products', href: '#' },
      { label: 'Design System' },
    ],
    separator: 'slash',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Separator styles, depths, single item
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Slash separator (default)</SectionLabel>
        <Breadcrumb
          items={[
            { label: 'Home', href: '#' },
            { label: 'Products', href: '#' },
            { label: 'Design System' },
          ]}
        />
      </div>

      <div>
        <SectionLabel>Chevron separator</SectionLabel>
        <Breadcrumb
          separator="chevron"
          items={[
            { label: 'Home', href: '#' },
            { label: 'Products', href: '#' },
            { label: 'Design System' },
          ]}
        />
      </div>

      <div>
        <SectionLabel>Deep nesting</SectionLabel>
        <Breadcrumb
          items={[
            { label: 'Home', href: '#' },
            { label: 'Products', href: '#' },
            { label: 'Design System', href: '#' },
            { label: 'Components', href: '#' },
            { label: 'Breadcrumb' },
          ]}
        />
      </div>

      <div>
        <SectionLabel>Single item</SectionLabel>
        <Breadcrumb items={[{ label: 'Dashboard' }]} />
      </div>

      <div>
        <SectionLabel>On dark background</SectionLabel>
        <div style={{ backgroundColor: 'var(--background-brand-primary)', padding: 'var(--padding-xl)', borderRadius: 'var(--border-radius-md)' }}>
          <Breadcrumb
            items={[
              { label: 'Show All', href: '#' },
              { label: 'Product', href: '#' },
              { label: 'Design System' },
            ]}
          />
        </div>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Real-world compositions
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => (
    <Stack gap="var(--gap-huge)">
      {/* Page header breadcrumb */}
      <div>
        <SectionLabel>Page header context</SectionLabel>
        <div style={{
          padding: 'var(--padding-xl)',
          borderBottom: 'var(--border-width-md) solid var(--border-secondary)',
        }}>
          <Breadcrumb
            separator="chevron"
            items={[
              { label: 'Admin', href: '#' },
              { label: 'Companies', href: '#' },
              { label: 'Acme Corp' },
            ]}
          />
          <h1 style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: 'var(--heading-lg)',
            marginTop: 'var(--gap-lg)',
          }}>
            Acme Corp
          </h1>
        </div>
      </div>

      {/* Settings path */}
      <div>
        <SectionLabel>Settings navigation</SectionLabel>
        <Breadcrumb
          items={[
            { label: 'Settings', href: '#' },
            { label: 'Integrations', href: '#' },
            { label: 'Webflow API' },
          ]}
        />
      </div>
    </Stack>
  ),
};
