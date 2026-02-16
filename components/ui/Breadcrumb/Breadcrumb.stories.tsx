import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    separator: {
      control: 'select',
      options: ['slash', 'chevron'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

// ─── Default (Slash separator) ──────────────────────────────────

/**
 * Default breadcrumb with slash separator
 */
export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Breadcrumb
  items={[
    { label: 'Home', href: '#' },
    { label: 'Products', href: '#' },
    { label: 'Design System' },
  ]}
/>`,
      },
    },
  },
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Products', href: '#' },
      { label: 'Design System' },
    ],
  },
};

// ─── Chevron Separator ──────────────────────────────────────────

/**
 * Breadcrumb with chevron (›) separator
 */
export const ChevronSeparator: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Breadcrumb
  separator="chevron"
  items={[
    { label: 'Home', href: '#' },
    { label: 'Products', href: '#' },
    { label: 'Design System' },
  ]}
/>`,
      },
    },
  },
  args: {
    separator: 'chevron',
    items: [
      { label: 'Home', href: '#' },
      { label: 'Products', href: '#' },
      { label: 'Design System' },
    ],
  },
};

// ─── Deep Nesting ───────────────────────────────────────────────

/**
 * Breadcrumb with many levels
 */
export const DeepNesting: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Breadcrumb
  items={[
    { label: 'Home', href: '#' },
    { label: 'Products', href: '#' },
    { label: 'Design System', href: '#' },
    { label: 'Components', href: '#' },
    { label: 'Breadcrumb' },
  ]}
/>`,
      },
    },
  },
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Products', href: '#' },
      { label: 'Design System', href: '#' },
      { label: 'Components', href: '#' },
      { label: 'Breadcrumb' },
    ],
  },
};

// ─── Single Item ────────────────────────────────────────────────

/**
 * Breadcrumb with a single item (current page only)
 */
export const SingleItem: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Breadcrumb items={[{ label: 'Dashboard' }]} />`,
      },
    },
  },
  args: {
    items: [{ label: 'Dashboard' }],
  },
};

// ─── On Dark Background ─────────────────────────────────────────

/**
 * Breadcrumb on a dark brand background (as used inside PageHeader)
 */
export const OnDarkBackground: Story = {
  decorators: [
    (Story) => (
      <div style={{
        backgroundColor: 'var(--_color---background--brand-primary)',
        padding: 'var(--_space---xl)',
      }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      source: {
        code: `<Breadcrumb
  items={[
    { label: 'Show All', href: '#' },
    { label: 'Product', href: '#' },
    { label: 'Design System' },
  ]}
/>`,
      },
    },
  },
  args: {
    items: [
      { label: 'Show All', href: '#' },
      { label: 'Product', href: '#' },
      { label: 'Design System' },
    ],
  },
};
