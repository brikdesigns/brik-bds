import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TabBar } from './TabBar';

const tabLabels = ['Active', 'Latest', 'Product', 'Design System', 'Marketing', 'Other'];
const fewLabels = ['All', 'Active', 'Archived'];

/** Interactive wrapper — clicking a tab makes it active */
function InteractiveTabBar({
  variant,
  onColor,
  labels = tabLabels,
  disabledIndices = [],
}: {
  variant?: 'text' | 'tab' | 'box';
  onColor?: boolean;
  labels?: string[];
  disabledIndices?: number[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <TabBar
      variant={variant}
      onColor={onColor}
      items={labels.map((label, i) => ({
        label,
        active: i === activeIndex,
        disabled: disabledIndices.includes(i),
        onClick: () => setActiveIndex(i),
      }))}
    />
  );
}

const meta: Meta<typeof TabBar> = {
  title: 'Navigation/Secondary/tab-bar',
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
 * Click tabs to switch. Hover and press states visible on interaction.
 */
export const Text: Story = {
  render: () => <InteractiveTabBar variant="text" />,
};

// ─── Tab Variant ────────────────────────────────────────────────

/**
 * Tab variant — underline indicator. Active tab gets brand-primary
 * bottom border. Click to switch tabs.
 */
export const Tab: Story = {
  render: () => <InteractiveTabBar variant="tab" />,
};

// ─── Box Variant ────────────────────────────────────────────────

/**
 * Box variant — active tab fills with brand color, inactive tabs
 * have a bordered white background. Click to switch.
 */
export const Box: Story = {
  render: () => <InteractiveTabBar variant="box" />,
};

// ─── Disabled Tabs ──────────────────────────────────────────────

/**
 * Tabs can be individually disabled. Disabled tabs show reduced opacity
 * and cannot be clicked.
 */
export const WithDisabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--padding-xl)' }}>
      <div>
        <p style={{
          fontFamily: 'var(--font-family-label)',
          fontSize: 'var(--label-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--gap-sm)',
        }}>
          Text — "Marketing" and "Other" disabled
        </p>
        <InteractiveTabBar variant="text" disabledIndices={[4, 5]} />
      </div>
      <div>
        <p style={{
          fontFamily: 'var(--font-family-label)',
          fontSize: 'var(--label-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--gap-sm)',
        }}>
          Tab — "Marketing" and "Other" disabled
        </p>
        <InteractiveTabBar variant="tab" disabledIndices={[4, 5]} />
      </div>
      <div>
        <p style={{
          fontFamily: 'var(--font-family-label)',
          fontSize: 'var(--label-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--gap-sm)',
        }}>
          Box — "Marketing" and "Other" disabled
        </p>
        <InteractiveTabBar variant="box" disabledIndices={[4, 5]} />
      </div>
    </div>
  ),
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
  render: () => <InteractiveTabBar variant="text" onColor />,
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
  render: () => <InteractiveTabBar variant="tab" onColor />,
};

// ─── Few Tabs ───────────────────────────────────────────────────

/**
 * Fewer items — each variant adapts to content width.
 */
export const FewTabs: Story = {
  render: () => <InteractiveTabBar variant="text" labels={fewLabels} />,
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
 * Side-by-side comparison of all three variants — all interactive.
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
        <InteractiveTabBar variant="text" />
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
        <InteractiveTabBar variant="tab" />
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
        <InteractiveTabBar variant="box" />
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
        <InteractiveTabBar variant="text" onColor />
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
        <InteractiveTabBar variant="tab" onColor />
      </div>
    </div>
  ),
};
