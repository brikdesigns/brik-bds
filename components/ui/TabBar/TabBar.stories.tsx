import type { Meta, StoryObj } from '@storybook/react-vite';
import { TabBar } from './TabBar';

const sampleTabs = [
  { label: 'Active', active: true },
  { label: 'Latest' },
  { label: 'Product' },
  { label: 'Design System' },
  { label: 'Marketing' },
  { label: 'Other' },
];

const fewTabs = [
  { label: 'All', active: true },
  { label: 'Active' },
  { label: 'Archived' },
];

const meta: Meta<typeof TabBar> = {
  title: 'Navigation/tab-bar',
  component: TabBar,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'tab', 'box'],
    },
    onColor: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof TabBar>;

// ─── Text Variant (default) ─────────────────────────────────────

/**
 * Default text variant — plain labels with brand color for active tab.
 */
export const Text: Story = {
  args: {
    variant: 'text',
    items: sampleTabs,
  },
};

// ─── Tab Variant ────────────────────────────────────────────────

/**
 * Tab variant — underline indicator. Active tab gets brand-primary
 * bottom border, inactive tabs get a subtle primary border.
 */
export const Tab: Story = {
  args: {
    variant: 'tab',
    items: sampleTabs,
  },
};

// ─── Box Variant ────────────────────────────────────────────────

/**
 * Box variant — active tab fills with brand color, inactive tabs
 * have a bordered white background.
 */
export const Box: Story = {
  args: {
    variant: 'box',
    items: sampleTabs,
  },
};

// ─── On Color (Text) ───────────────────────────────────────────

/**
 * Text variant on a dark brand background. Uses `onColor` to switch
 * to on-color-dark tokens for legibility.
 */
export const TextOnColor: Story = {
  decorators: [
    (Story) => (
      <div style={{
        backgroundColor: 'var(--background-brand-primary)',
        padding: 'var(--padding-xl)',
        borderRadius: 'var(--border-radius-md)',
      }}>
        <Story />
      </div>
    ),
  ],
  args: {
    variant: 'text',
    onColor: true,
    items: sampleTabs,
  },
};

// ─── On Color (Tab) ────────────────────────────────────────────

/**
 * Tab variant on a dark brand background with on-color-dark borders.
 */
export const TabOnColor: Story = {
  decorators: [
    (Story) => (
      <div style={{
        backgroundColor: 'var(--background-brand-primary)',
        padding: 'var(--padding-xl)',
        borderRadius: 'var(--border-radius-md)',
      }}>
        <Story />
      </div>
    ),
  ],
  args: {
    variant: 'tab',
    onColor: true,
    items: sampleTabs,
  },
};

// ─── Few Tabs ───────────────────────────────────────────────────

/**
 * Fewer items — each variant adapts to content width.
 */
export const FewTabs: Story = {
  args: {
    variant: 'text',
    items: fewTabs,
  },
};

// ─── No Active ──────────────────────────────────────────────────

/**
 * No active tab — all tabs show in secondary/inactive state.
 */
export const NoActive: Story = {
  args: {
    variant: 'tab',
    items: [
      { label: 'Overview' },
      { label: 'Billing' },
      { label: 'Security' },
    ],
  },
};

// ─── All Variants ───────────────────────────────────────────────

/**
 * Side-by-side comparison of all three variants.
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--padding-xl)' }}>
      <div>
        <p style={{
          fontFamily: 'var(--font-family-label)',
          fontSize: 'var(--label-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--gap-sm)',
        }}>
          Text
        </p>
        <TabBar variant="text" items={sampleTabs} />
      </div>
      <div>
        <p style={{
          fontFamily: 'var(--font-family-label)',
          fontSize: 'var(--label-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--gap-sm)',
        }}>
          Tab
        </p>
        <TabBar variant="tab" items={sampleTabs} />
      </div>
      <div>
        <p style={{
          fontFamily: 'var(--font-family-label)',
          fontSize: 'var(--label-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--gap-sm)',
        }}>
          Box
        </p>
        <TabBar variant="box" items={sampleTabs} />
      </div>
      <div style={{
        backgroundColor: 'var(--background-brand-primary)',
        padding: 'var(--padding-xl)',
        borderRadius: 'var(--border-radius-md)',
      }}>
        <p style={{
          fontFamily: 'var(--font-family-label)',
          fontSize: 'var(--label-sm)',
          color: 'var(--text-on-color-dark)',
          marginBottom: 'var(--gap-sm)',
          opacity: 0.6,
        }}>
          Text — on color
        </p>
        <TabBar variant="text" onColor items={sampleTabs} />
      </div>
      <div style={{
        backgroundColor: 'var(--background-brand-primary)',
        padding: 'var(--padding-xl)',
        borderRadius: 'var(--border-radius-md)',
      }}>
        <p style={{
          fontFamily: 'var(--font-family-label)',
          fontSize: 'var(--label-sm)',
          color: 'var(--text-on-color-dark)',
          marginBottom: 'var(--gap-sm)',
          opacity: 0.6,
        }}>
          Tab — on color
        </p>
        <TabBar variant="tab" onColor items={sampleTabs} />
      </div>
    </div>
  ),
};
