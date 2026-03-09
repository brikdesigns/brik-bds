import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from './Footer';

const meta: Meta<typeof Footer> = {
  title: 'Navigation/Primary/footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'brand'],
    },
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

export const Default: Story = {
  args: {
    logo: <LogoPlaceholder />,
    tagline: 'Building better digital experiences for small businesses.',
    columns: sampleColumns,
    copyright: '\u00A9 2026 Brik Designs. All rights reserved.',
  },
};

export const BrandVariant: Story = {
  args: {
    logo: <LogoPlaceholder />,
    tagline: 'Building better digital experiences for small businesses.',
    columns: sampleColumns,
    copyright: '\u00A9 2026 Brik Designs. All rights reserved.',
    variant: 'brand',
  },
};

export const WithSocialLinks: Story = {
  args: {
    logo: <LogoPlaceholder />,
    columns: sampleColumns,
    copyright: '\u00A9 2026 Brik Designs. All rights reserved.',
    socialLinks: (
      <>
        <a href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: 'var(--body-md)' }}>FB</a>
        <a href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: 'var(--body-md)' }}>IG</a>
        <a href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: 'var(--body-md)' }}>LI</a>
        <a href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: 'var(--body-md)' }}>X</a>
      </>
    ),
  },
};

export const Minimal: Story = {
  args: {
    copyright: '\u00A9 2026 Brik Designs. All rights reserved.',
  },
};

export const ColumnsOnly: Story = {
  args: {
    columns: sampleColumns,
    copyright: '\u00A9 2026 Brik Designs. All rights reserved.',
  },
};
