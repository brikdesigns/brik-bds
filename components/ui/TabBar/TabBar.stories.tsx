import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, fn } from 'storybook/test';
import { TabBar } from './TabBar';

/**
 * TabBar — horizontal tab navigation. Three visual variants (`text` /
 * `tab` / `box`) and an `onColor` mode for use over branded surfaces.
 * @summary Horizontal tab navigation
 */
const meta: Meta<typeof TabBar> = {
  title: 'Components/Navigation/tab-bar',
  component: TabBar,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['text', 'tab', 'box'] },
    onColor: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof TabBar>;

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

const tabClickHandler = fn();

/** Args-driven sandbox. Includes an interaction test that clicks the second tab.
 *  @summary Live playground with interaction test */
export const Playground: Story = {
  args: {
    variant: 'tab',
    items: [
      { label: 'Overview', active: true, onClick: tabClickHandler },
      { label: 'Billing', onClick: tabClickHandler },
      { label: 'Security', onClick: tabClickHandler },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole('tab');
    await expect(tabs).toHaveLength(3);
    await expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(tabs[1]);
    await expect(tabClickHandler).toHaveBeenCalled();
  },
};

/* ─── Variant axis ───────────────────────────────────────────── */

/** Text variant — minimal, underline-only.
 *  @summary Text variant */
export const Text: Story = {
  render: () => <InteractiveTabBar variant="text" />,
};

/** Tab variant — bordered tabs with active-tab connector.
 *  @summary Tab variant */
export const Tab: Story = {
  render: () => <InteractiveTabBar variant="tab" />,
};

/** Box variant — pill/box-shaped active state. Used for filter rows.
 *  @summary Box variant */
export const Box: Story = {
  render: () => <InteractiveTabBar variant="box" />,
};

/* ─── On-color modes ─────────────────────────────────────────── */

/** Text variant on a brand surface — `onColor` adapts text/border to the
 *  brand-primary background.
 *  @summary Text on-color */
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

/** Tab variant on a brand surface.
 *  @summary Tab on-color */
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

/* ─── Content shapes ─────────────────────────────────────────── */

/** Disabled tabs — `disabled: true` on individual items locks them out of
 *  navigation while still rendering the label.
 *  @summary TabBar with disabled tabs */
export const WithDisabledTabs: Story = {
  render: () => <InteractiveTabBar variant="tab" disabledIndices={[4, 5]} />,
};

/** Few tabs — confirms layout when the row has only 2-3 items.
 *  @summary Few-tab TabBar */
export const FewTabs: Story = {
  render: () => <InteractiveTabBar variant="text" labels={fewLabels} />,
};

/* ─── Composition ────────────────────────────────────────────── */

/** Settings-page navigation — `tab` variant with content area below.
 *  @summary Settings-page tab navigation */
export const SettingsPage: Story = {
  render: () => {
    const Demo = () => {
      const [activeIndex, setActiveIndex] = useState(0);
      const tabs = ['General', 'Billing', 'Team', 'Integrations', 'Security'];
      return (
        <div>
          <div style={{ borderBottom: 'var(--border-width-md) solid var(--border-secondary)' }}>
            <TabBar
              variant="tab"
              items={tabs.map((label, i) => ({
                label,
                active: i === activeIndex,
                onClick: () => setActiveIndex(i),
              }))}
            />
          </div>
          <div style={{
            padding: 'var(--padding-lg)',
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--body-md)',
            color: 'var(--text-secondary)',
          }}>
            Content for "{tabs[activeIndex]}" tab
          </div>
        </div>
      );
    };
    return <Demo />;
  },
};
