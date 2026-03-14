import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavBar } from './NavBar';
import { Button } from '../Button';

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

/* ─── Shared Data ─────────────────────────────────────────────── */

const sampleLinks = [
  { label: 'Home', href: '#', active: true },
  { label: 'Features', href: '#' },
  { label: 'Pricing', href: '#' },
  { label: 'About', href: '#' },
  { label: 'Contact', href: '#' },
];

const LogoPlaceholder = () => (
  <div style={{
    fontFamily: 'var(--font-family-heading)',
    fontSize: 'var(--label-lg)',
    fontWeight: 'var(--font-weight-bold)' as unknown as number,
    color: 'var(--text-primary)',
  }}>
    BrandName
  </div>
);

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof NavBar> = {
  title: 'Navigation/Primary/nav-bar',
  component: NavBar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    logo: <LogoPlaceholder />,
    links: sampleLinks,
    actions: <Button size="sm">Get Started</Button>,
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Links only, multiple actions, minimal, sticky
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Full nav bar</SectionLabel>
        <NavBar
          logo={<LogoPlaceholder />}
          links={sampleLinks}
          actions={<Button size="sm">Get Started</Button>}
        />
      </div>

      <div>
        <SectionLabel>Links only</SectionLabel>
        <NavBar logo={<LogoPlaceholder />} links={sampleLinks} />
      </div>

      <div>
        <SectionLabel>Multiple actions</SectionLabel>
        <NavBar
          logo={<LogoPlaceholder />}
          links={sampleLinks.slice(0, 3)}
          actions={
            <div style={{ display: 'flex', gap: 'var(--gap-md)', alignItems: 'center' }}>
              <Button variant="ghost" size="sm">Log In</Button>
              <Button size="sm">Sign Up</Button>
            </div>
          }
        />
      </div>

      <div>
        <SectionLabel>Minimal (logo + action)</SectionLabel>
        <NavBar logo={<LogoPlaceholder />} actions={<Button size="sm">Contact</Button>} />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Sticky nav with scrollable content
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => (
    <div>
      <NavBar
        logo={<LogoPlaceholder />}
        links={sampleLinks}
        actions={<Button size="sm">Get Started</Button>}
        sticky
      />
      <div style={{
        height: 2000,
        padding: 'var(--padding-xl)',
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--body-md)',
        color: 'var(--text-secondary)',
      }}>
        <p>Scroll down to see the sticky navbar behavior.</p>
      </div>
    </div>
  ),
};
