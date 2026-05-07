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
  tags: ['surface-web'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'brand', 'inverse'] },
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
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

/** @summary All variants side by side */
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
        <SectionLabel>Inverse (dark surface \u2014 meets WCAG AA on body-sm)</SectionLabel>
        <Footer
          logo={<LogoPlaceholder />}
          tagline="Building better digital experiences for small businesses."
          columns={sampleColumns}
          copyright={'\u00A9 2026 Brik Designs. All rights reserved.'}
          variant="inverse"
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

/* \u2500\u2500\u2500 Marketing-pattern helpers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

const NewsletterSection = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--gap-md)',
    textAlign: 'center',
    padding: 'var(--padding-md) 0',
  }}>
    <h3 style={{
      fontFamily: 'var(--font-family-heading)',
      fontSize: 'var(--heading-md)',
      fontWeight: 'var(--font-weight-bold)' as unknown as number,
      margin: 0,
      color: 'inherit',
    }}>
      Join our newsletter
    </h3>
    <p style={{
      fontFamily: 'var(--font-family-body)',
      fontSize: 'var(--body-sm)',
      margin: 0,
      opacity: 0.8,
    }}>
      Subscribe for updates, design tips, and case studies.
    </p>
    <input
      type="email"
      placeholder="you@example.com"
      style={{
        width: '320px',
        maxWidth: '100%',
        padding: 'var(--padding-sm)',
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--body-sm)',
        border: 'var(--border-width-sm) solid var(--border-secondary)',
        borderRadius: 'var(--border-radius-sm)',
      }}
    />
  </div>
);

const ContactBlock = () => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)', fontSize: 'var(--body-sm)' }}>
      <span style={{ opacity: 0.6 }}>{'\u260E'}</span>
      <span>(555) 123-4567</span>
    </div>
    <a
      href="mailto:hello@example.com"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--gap-sm)',
        fontSize: 'var(--body-sm)',
        color: 'inherit',
        textDecoration: 'none',
      }}
    >
      <span style={{ opacity: 0.6 }}>{'\u2709'}</span>
      <span>hello@example.com</span>
    </a>
  </>
);

const ServiceDot = ({ color }: { color: string }) => (
  <span
    aria-hidden="true"
    style={{
      display: 'inline-block',
      width: 10,
      height: 10,
      borderRadius: '50%',
      backgroundColor: color,
    }}
  />
);

/** @summary Common usage patterns */
export const Patterns: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Minimal marketing footer (legacy shape \u2014 no marketing slots)</SectionLabel>
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

      <div>
        <SectionLabel>Full marketing footer \u2014 newsletter + contact + badged columns + bottom links</SectionLabel>
        <Footer
          aboveTop={<NewsletterSection />}
          logo={<LogoPlaceholder />}
          tagline="We're a digital marketing and design agency."
          brandExtra={<ContactBlock />}
          columns={[
            {
              heading: 'Services',
              links: [
                { label: 'Brand Design', href: '#', adornment: <ServiceDot color="var(--services--yellow)" /> },
                { label: 'Marketing Design', href: '#', adornment: <ServiceDot color="var(--services--green)" /> },
                { label: 'Information Design', href: '#', adornment: <ServiceDot color="var(--services--blue)" /> },
                { label: 'Product Design', href: '#', adornment: <ServiceDot color="var(--services--purple)" /> },
                { label: 'Back Office Design', href: '#', adornment: <ServiceDot color="var(--services--orange)" /> },
              ],
            },
            {
              heading: 'About',
              links: [
                { label: 'Who We Are', href: '#' },
                { label: 'What We Do', href: '#' },
                { label: 'Customer Stories', href: '#' },
              ],
            },
            {
              heading: 'Follow Us',
              links: [
                { label: 'LinkedIn', href: '#' },
                { label: 'Instagram', href: '#' },
                { label: 'Facebook', href: '#' },
              ],
            },
          ]}
          copyright={'\u00A9 2026 Brik Designs. All rights reserved.'}
          bottomLinks={[
            { label: 'Terms', href: '#' },
            { label: 'Privacy policy', href: '#' },
          ]}
          socialLinks={<span>Made with {'\u2764\uFE0F'} in Palm Beach, FL</span>}
        />
      </div>
    </Stack>
  ),
};
