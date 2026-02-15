import type { Meta, StoryObj } from '@storybook/react';
import { Link } from './Link';

const meta: Meta<typeof Link> = {
  title: 'Components/link',
  component: Link,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'small'],
      description: 'Size variant',
    },
    href: {
      control: 'text',
      description: 'Link destination',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Link>;

// Basic link
export const Default: Story = {
  args: {
    href: '#',
    children: 'Learn More',
  },
};

// Small link
export const Small: Story = {
  args: {
    href: '#',
    size: 'small',
    children: 'View Details',
  },
};

// External link
export const External: Story = {
  args: {
    href: 'https://example.com',
    target: '_blank',
    rel: 'noopener noreferrer',
    children: 'Visit Website',
  },
};

// Link in context
export const InParagraph: Story = {
  parameters: {
    docs: {
      source: {
        code: `<p>
  Our team specializes in web design and development.{' '}
  <Link href="#">Learn more about our services</Link> or{' '}
  <Link href="#">contact us</Link> to get started.
</p>`,
      },
    },
  },
  render: () => (
    <p
      style={{
        fontFamily: 'var(--_typography---font-family--body)',
        color: 'var(--_color---text--primary)',
        maxWidth: '400px',
        lineHeight: '1.6',
      }}
    >
      Our team specializes in web design and development.{' '}
      <Link href="#">Learn more about our services</Link> or{' '}
      <Link href="#">contact us</Link> to get started.
    </p>
  ),
};

// Navigation links
export const NavigationLinks: Story = {
  parameters: {
    docs: {
      source: {
        code: `<nav>
  <Link href="#">Home</Link>
  <Link href="#">About</Link>
  <Link href="#">Services</Link>
  <Link href="#">Contact</Link>
</nav>`,
      },
    },
  },
  render: () => (
    <nav style={{ display: 'flex', gap: '24px' }}>
      <Link href="#">Home</Link>
      <Link href="#">About</Link>
      <Link href="#">Services</Link>
      <Link href="#">Contact</Link>
    </nav>
  ),
};

// All sizes
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <Link href="#">Default Link</Link>
      <Link href="#" size="small">Small Link</Link>
    </div>
  ),
};
