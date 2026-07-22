import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Footer } from './Footer';
import { type BdsLinkComponent } from '../NavItem';

/* Story-only stand-in for a router `Link` (Next.js / Remix). Tags the rendered
 * anchor so the injected-routing path is visible in the DOM. */
const MockLink: BdsLinkComponent = ({ href, children, ...props }) => (
  <a href={href} data-link-component="mock" {...props}>
    {children}
  </a>
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

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Footer> = {
  title: 'Blueprints/footer',
  component: Footer,
  tags: ['surface-web'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    logo: { control: false, description: 'Logo element rendered in the top-left brand area.' },
    tagline: { control: 'text', description: 'Optional tagline or description below the logo.' },
    brandExtra: {
      control: false,
      description:
        'Optional content rendered inside the logo area, below the tagline — typically a contact block (phone / email / address).',
    },
    columns: { control: false, description: 'Link columns — each a `{ heading, links }` group.' },
    columnHeadingLevel: {
      control: 'select',
      options: ['h2', 'h3', 'h4', 'h5', 'h6'],
      description:
        'Render level for column headings. Default `h4` so a page whose last in-page heading is h2/h3 keeps `heading-order` intact.',
    },
    copyright: { control: 'text' },
    bottomLinks: {
      control: false,
      description: 'Inline links next to the copyright, separated by a bullet — typically Terms / Privacy.',
    },
    socialLinks: {
      control: false,
      description: 'Right-aligned content in the bottom bar — typically social icons or a small tagline.',
    },
    aboveTop: {
      control: false,
      description:
        'Content rendered above the standard top section, full-width — typical use: newsletter signup, announcement banner, secondary CTA.',
    },
    variant: {
      control: 'select',
      options: ['default', 'brand', 'inverse'],
      description:
        'Background surface. Pure color/text swap — no semantic or ARIA difference between values. `inverse` meets WCAG AA on `body-sm`.',
    },
    containerMaxWidth: {
      control: 'select',
      options: [undefined, 'narrow', 'default', 'wide', 'xl'],
      description:
        'Constrain inner content to a `--content-width-*` while the background stays full-bleed. Omit for full-width.',
    },
    linkComponent: {
      description:
        'Render column + bottom-bar links with a router-aware component (Next.js `Link`, Remix `Link`) for client-side routing instead of the default `<a>`. See ADR-012.',
      control: false,
    },
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   1. DEFAULT — args-driven sandbox. Controls work.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    logo: <LogoPlaceholder />,
    tagline: 'Building better digital experiences for small businesses.',
    columns: sampleColumns,
    copyright: '© 2026 Brik Designs. All rights reserved.',
    variant: 'default',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Q3 semantic starting points
   ═══════════════════════════════════════════════════════════════ */

/** @summary Inner content constrained to a content width while the background spans full-bleed */
export const Constrained: Story = {
  args: {
    logo: <LogoPlaceholder />,
    tagline: 'Building better digital experiences for small businesses.',
    columns: sampleColumns,
    copyright: '© 2026 Brik Designs. All rights reserved.',
    variant: 'default',
    containerMaxWidth: 'xl',
  },
};

/** @summary Column + bottom-bar links routed through an injected link component for client-side routing */
export const WithLinkComponent: Story = {
  args: {
    logo: <LogoPlaceholder />,
    columns: sampleColumns,
    copyright: '© 2026 Brik Designs. All rights reserved.',
    bottomLinks: [
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
    ],
    linkComponent: MockLink,
  },
};

/** @summary External column links open in a new tab with `rel="noopener noreferrer"` and bypass the router linkComponent */
export const ExternalLinks: Story = {
  args: {
    logo: <LogoPlaceholder />,
    columns: [
      {
        heading: 'Follow',
        links: [
          { label: 'Home', href: '/home' },
          { label: 'LinkedIn', href: 'https://linkedin.com/company/brik', external: true },
        ],
      },
    ],
    copyright: '© 2026 Brik Designs.',
    linkComponent: MockLink,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // External link → bare <a target=_blank rel=noopener noreferrer>, NOT routed.
    const external = canvas.getByRole('link', { name: 'LinkedIn' });
    await expect(external).toHaveAttribute('target', '_blank');
    await expect(external).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(external).not.toHaveAttribute('data-link-component');
    // Internal link in the same footer still routes through the linkComponent.
    await expect(canvas.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'data-link-component',
      'mock',
    );
  },
};

/* ─── Marketing-pattern helpers ──────────────────────────────── */

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
      <span style={{ opacity: 0.6 }}>{'☎'}</span>
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
      <span style={{ opacity: 0.6 }}>{'✉'}</span>
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

/** @summary Full marketing-site footer — newsletter, contact block, badged service columns, bottom links, and social */
export const Marketing: Story = {
  args: {
    aboveTop: <NewsletterSection />,
    logo: <LogoPlaceholder />,
    tagline: "We're a digital marketing and design agency.",
    brandExtra: <ContactBlock />,
    columns: [
      {
        heading: 'Services',
        links: [
          { label: 'Brand Design', href: '#', adornment: <ServiceDot color="var(--surface-service-brand)" /> },
          { label: 'Marketing Design', href: '#', adornment: <ServiceDot color="var(--surface-service-marketing)" /> },
          { label: 'Information Design', href: '#', adornment: <ServiceDot color="var(--surface-service-information)" /> },
          { label: 'Product Design', href: '#', adornment: <ServiceDot color="var(--surface-service-product)" /> },
          { label: 'Back Office Design', href: '#', adornment: <ServiceDot color="var(--surface-service-back-office)" /> },
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
    ],
    copyright: '© 2026 Brik Designs. All rights reserved.',
    bottomLinks: [
      { label: 'Terms', href: '#' },
      { label: 'Privacy policy', href: '#' },
    ],
    socialLinks: <span>Made with {'❤️'} in Palm Beach, FL</span>,
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. CSS OVERRIDE API — `--bds-footer-surface` demo
   ═══════════════════════════════════════════════════════════════ */

/** @summary `--bds-footer-surface` pinned via inline style override so the inverse variant holds a fixed color across light + dark themes */
export const SurfaceOverride: Story = {
  args: {
    logo: <LogoPlaceholder />,
    tagline: 'Building better digital experiences for small businesses.',
    columns: sampleColumns,
    copyright: '© 2026 Brik Designs. All rights reserved.',
    variant: 'inverse',
    style: {
      // bds-lint-ignore — component-scoped CSS variable override, not a design token
      ['--bds-footer-surface' as string]: 'var(--color-grayscale-darkest)',
    } as CSSProperties,
  },
};
