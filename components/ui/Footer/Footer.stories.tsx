import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from './Footer';

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

const sampleColumns = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'Integrations', href: '#' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help Center', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Status', href: '#' },
    ],
  },
];

const LogoPlaceholder = () => (
  <div style={{
    fontFamily: 'var(--font-family-heading)',
    fontSize: 'var(--label-lg)',
    fontWeight: 'var(--font-weight-bold)' as unknown as number,
    color: 'inherit',
  }}>
    BrandName
  </div>
);

const socialLinks = (
  <>
    <a href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: 'var(--body-md)' }}>FB</a>
    <a href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: 'var(--body-md)' }}>IG</a>
    <a href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: 'var(--body-md)' }}>LI</a>
    <a href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: 'var(--body-md)' }}>X</a>
  </>
);

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Footer> = {
  title: 'Navigation/Primary/footer',
  component: Footer,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'brand'] },
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    logo: <LogoPlaceholder />,
    tagline: 'Building better digital experiences for small businesses.',
    columns: sampleColumns,
    copyright: '\u00A9 2026 Brik Designs. All rights reserved.',
    variant: 'default',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Default, brand, with social, minimal
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Default</SectionLabel>
        <Footer
          logo={<LogoPlaceholder />}
          tagline="Building better digital experiences for small businesses."
          columns={sampleColumns}
          copyright={'\u00A9 2026 Brik Designs. All rights reserved.'}
        />
      </div>

      <div>
        <SectionLabel>Brand</SectionLabel>
        <Footer
          logo={<LogoPlaceholder />}
          tagline="Building better digital experiences for small businesses."
          columns={sampleColumns}
          copyright={'\u00A9 2026 Brik Designs. All rights reserved.'}
          variant="brand"
        />
      </div>

      <div>
        <SectionLabel>With social links</SectionLabel>
        <Footer
          logo={<LogoPlaceholder />}
          columns={sampleColumns}
          copyright={'\u00A9 2026 Brik Designs. All rights reserved.'}
          socialLinks={socialLinks}
        />
      </div>

      <div>
        <SectionLabel>Minimal (copyright only)</SectionLabel>
        <Footer copyright={'\u00A9 2026 Brik Designs. All rights reserved.'} />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Full marketing page footer
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Marketing site footer</SectionLabel>
        <Footer
          logo={<LogoPlaceholder />}
          tagline="Modern websites and digital systems for growing businesses."
          columns={[
            {
              heading: 'Services',
              links: [
                { label: 'Web Design', href: '#' },
                { label: 'Development', href: '#' },
                { label: 'SEO', href: '#' },
                { label: 'Consulting', href: '#' },
              ],
            },
            {
              heading: 'Resources',
              links: [
                { label: 'Blog', href: '#' },
                { label: 'Case Studies', href: '#' },
                { label: 'Documentation', href: '#' },
              ],
            },
            {
              heading: 'Legal',
              links: [
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
              ],
            },
          ]}
          copyright={'\u00A9 2026 Brik Designs LLC. All rights reserved.'}
          socialLinks={socialLinks}
        />
      </div>
    </Stack>
  ),
};
