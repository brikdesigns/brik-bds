import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextLink } from './TextLink';

const meta: Meta<typeof TextLink> = {
  title: 'Components/Action/text-link',
  component: TextLink,
  tags: ['surface-shared'],
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
type Story = StoryObj<typeof TextLink>;

// Basic link
/** @summary Default rendering */
export const Default: Story = {
  args: {
    href: '#',
    children: 'Learn More',
  },
};

// Small link
/** @summary Small */
export const Small: Story = {
  args: {
    href: '#',
    size: 'small',
    children: 'View Details',
  },
};

// External link
/** @summary External */
export const External: Story = {
  args: {
    href: 'https://example.com',
    target: '_blank',
    rel: 'noopener noreferrer',
    children: 'Visit Website',
  },
};

// Link in context
/** @summary In paragraph */
export const InParagraph: Story = {
  parameters: {
    docs: {
      source: {
        code: `<p>
  Our team specializes in web design and development.{' '}
  <TextLink href="#">Learn more about our services</TextLink> or{' '}
  <TextLink href="#">contact us</TextLink> to get started.
</p>`,
      },
    },
  },
  render: () => (
    <p
      style={{
        fontFamily: 'var(--font-family-body)',
        color: 'var(--text-primary)',
        maxWidth: '400px',
        lineHeight: '1.6',
      }}
    >
      Our team specializes in web design and development.{' '}
      <TextLink href="#">Learn more about our services</TextLink> or{' '}
      <TextLink href="#">contact us</TextLink> to get started.
    </p>
  ),
};

// Navigation links
/** @summary Navigation links */
export const NavigationLinks: Story = {
  parameters: {
    docs: {
      source: {
        code: `<nav>
  <TextLink href="#">Home</TextLink>
  <TextLink href="#">About</TextLink>
  <TextLink href="#">Services</TextLink>
  <TextLink href="#">Contact</TextLink>
</nav>`,
      },
    },
  },
  render: () => (
    <nav style={{ display: 'flex', gap: 'var(--gap-xl)' }}>
      <TextLink href="#">Home</TextLink>
      <TextLink href="#">About</TextLink>
      <TextLink href="#">Services</TextLink>
      <TextLink href="#">Contact</TextLink>
    </nav>
  ),
};

// All sizes
/** @summary All sizes */
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--gap-xl)', alignItems: 'center' }}>
      <TextLink href="#">Default Link</TextLink>
      <TextLink href="#" size="small">Small Link</TextLink>
    </div>
  ),
};
