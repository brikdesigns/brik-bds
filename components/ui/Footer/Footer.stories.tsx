import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from './Footer';

/**
 * Footer — site footer with optional logo, tagline, link columns, copyright,
 * and social-link slot. Two surface variants (`default` / `brand`).
 * @summary Site footer with link columns
 */
const meta: Meta<typeof Footer> = {
  title: 'Components/Navigation/footer',
  component: Footer,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'brand'] },
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

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

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    logo: <LogoPlaceholder />,
    tagline: 'Building better digital experiences for small businesses.',
    columns: sampleColumns,
    copyright: '© 2026 Brik Designs. All rights reserved.',
    variant: 'default',
  },
};

/* ─── Variant axis ───────────────────────────────────────────── */

/** Default surface — neutral background.
 *  @summary Default footer */
export const Default: Story = {
  args: {
    logo: <LogoPlaceholder />,
    tagline: 'Building better digital experiences for small businesses.',
    columns: sampleColumns,
    copyright: '© 2026 Brik Designs. All rights reserved.',
    variant: 'default',
  },
};

/** Brand surface — brand-primary background with inverse text.
 *  @summary Brand-surface footer */
export const Brand: Story = {
  args: {
    logo: <LogoPlaceholder />,
    tagline: 'Building better digital experiences for small businesses.',
    columns: sampleColumns,
    copyright: '© 2026 Brik Designs. All rights reserved.',
    variant: 'brand',
  },
};

/* ─── Content shapes ─────────────────────────────────────────── */

/** With social links — adds the social slot beside the copyright row.
 *  @summary Footer with social links */
export const WithSocialLinks: Story = {
  args: {
    logo: <LogoPlaceholder />,
    columns: sampleColumns,
    copyright: '© 2026 Brik Designs. All rights reserved.',
    socialLinks,
  },
};

/** Minimal — copyright only. Use for app footers (vs. marketing footers).
 *  @summary Minimal footer (copyright only) */
export const Minimal: Story = {
  args: {
    copyright: '© 2026 Brik Designs. All rights reserved.',
  },
};
