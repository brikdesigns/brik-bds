import type { Meta, StoryObj } from '@storybook/react';
import { TabBar } from './TabBar';

const meta: Meta<typeof TabBar> = {
  title: 'Components/tab-bar',
  component: TabBar,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof TabBar>;

// ─── Default ────────────────────────────────────────────────────

/**
 * Default tab bar with active state
 */
export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `<TabBar
  items={[
    { label: 'Active', active: true },
    { label: 'Latest' },
    { label: 'Product' },
    { label: 'Design System' },
    { label: 'Marketing' },
    { label: 'Other' },
  ]}
/>`,
      },
    },
  },
  args: {
    items: [
      { label: 'Active', active: true },
      { label: 'Latest' },
      { label: 'Product' },
      { label: 'Design System' },
      { label: 'Marketing' },
      { label: 'Other' },
    ],
  },
};

// ─── Few Tabs ───────────────────────────────────────────────────

/**
 * Tab bar with fewer items
 */
export const FewTabs: Story = {
  parameters: {
    docs: {
      source: {
        code: `<TabBar
  items={[
    { label: 'All', active: true },
    { label: 'Active' },
    { label: 'Archived' },
  ]}
/>`,
      },
    },
  },
  args: {
    items: [
      { label: 'All', active: true },
      { label: 'Active' },
      { label: 'Archived' },
    ],
  },
};

// ─── No Active ──────────────────────────────────────────────────

/**
 * Tab bar with no active tab — all tabs show in secondary color
 */
export const NoActive: Story = {
  parameters: {
    docs: {
      source: {
        code: `<TabBar
  items={[
    { label: 'Overview' },
    { label: 'Billing' },
    { label: 'Security' },
  ]}
/>`,
      },
    },
  },
  args: {
    items: [
      { label: 'Overview' },
      { label: 'Billing' },
      { label: 'Security' },
    ],
  },
};

// ─── On Dark Background ─────────────────────────────────────────

/**
 * Tab bar on dark brand background (as used inside PageHeader)
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
        code: `<TabBar
  items={[
    { label: 'Active', active: true },
    { label: 'Latest' },
    { label: 'Product' },
  ]}
/>`,
      },
    },
  },
  args: {
    items: [
      { label: 'Active', active: true },
      { label: 'Latest' },
      { label: 'Product' },
    ],
  },
};
