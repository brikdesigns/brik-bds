import React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, fn } from 'storybook/test';
import { TabBar } from './TabBar';

/* ─── Layout Helpers (story-only) ─────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{
    fontFamily: 'var(--font-family-label)',
    fontSize: 'var(--body-xs)', // bds-lint-ignore
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 'var(--gap-md)',
    color: 'var(--text-muted)',
  }}>
    {children}
  </div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ─── Shared Data ─────────────────────────────────────────────── */

const tabLabels = ['Active', 'Latest', 'Product', 'Design System', 'Marketing', 'Other'];
const fewLabels = ['All', 'Active', 'Archived'];

/** Interactive wrapper — clicking a tab makes it active */
function InteractiveTabBar({
  variant,
  onColor,
  labels = tabLabels,
  disabledIndices = [],
}: {
  variant?: 'text' | 'text-underline' | 'tab' | 'box';
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

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof TabBar> = {
  title: 'Navigation/Secondary/tab-bar',
  component: TabBar,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['text', 'text-underline', 'tab', 'box'] },
    onColor: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof TabBar>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

const tabClickHandler = fn();

/** @summary Interactive playground for prop tweaking */
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

    // Click second tab
    await userEvent.click(tabs[1]);
    await expect(tabClickHandler).toHaveBeenCalled();
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — All variants, on-color, disabled, few tabs
   ═══════════════════════════════════════════════════════════════ */

/** @summary All variants side by side */
export const Variants: Story = {
  render: () => (
    <Stack>
      {/* All four variants */}
      <div>
        <SectionLabel>Text</SectionLabel>
        <InteractiveTabBar variant="text" />
      </div>

      <div>
        <SectionLabel>Text — underline</SectionLabel>
        <InteractiveTabBar variant="text-underline" />
      </div>

      <div>
        <SectionLabel>Tab</SectionLabel>
        <InteractiveTabBar variant="tab" />
      </div>

      <div>
        <SectionLabel>Box</SectionLabel>
        <InteractiveTabBar variant="box" />
      </div>

      {/* On color */}
      <div style={{
        backgroundColor: 'var(--background-brand-primary)',
        padding: 'var(--padding-xl)',
        borderRadius: 'var(--border-radius-md)',
      }}>
        <SectionLabel>Text — on color</SectionLabel>
        <InteractiveTabBar variant="text" onColor />
      </div>

      <div style={{
        backgroundColor: 'var(--background-brand-primary)',
        padding: 'var(--padding-xl)',
        borderRadius: 'var(--border-radius-md)',
      }}>
        <SectionLabel>Text underline — on color</SectionLabel>
        <InteractiveTabBar variant="text-underline" onColor />
      </div>

      <div style={{
        backgroundColor: 'var(--background-brand-primary)',
        padding: 'var(--padding-xl)',
        borderRadius: 'var(--border-radius-md)',
      }}>
        <SectionLabel>Tab — on color</SectionLabel>
        <InteractiveTabBar variant="tab" onColor />
      </div>

      {/* Disabled tabs */}
      <div>
        <SectionLabel>Disabled — "Marketing" and "Other"</SectionLabel>
        <InteractiveTabBar variant="tab" disabledIndices={[4, 5]} />
      </div>

      {/* Few tabs */}
      <div>
        <SectionLabel>Few tabs</SectionLabel>
        <InteractiveTabBar variant="text" labels={fewLabels} />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Page header with tab navigation
   ═══════════════════════════════════════════════════════════════ */

/** @summary Common usage patterns */
export const Patterns: Story = {
  render: () => {
    function SettingsPage() {
      const [activeIndex, setActiveIndex] = useState(0);
      const tabs = ['General', 'Billing', 'Team', 'Integrations', 'Security'];

      return (
        <div>
          <SectionLabel>Settings page navigation</SectionLabel>
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
    }

    function FilterTabs() {
      const [activeIndex, setActiveIndex] = useState(0);
      const filters = ['All', 'Active', 'Draft', 'Archived'];

      return (
        <div>
          <SectionLabel>Content filter</SectionLabel>
          <TabBar
            variant="box"
            items={filters.map((label, i) => ({
              label,
              active: i === activeIndex,
              onClick: () => setActiveIndex(i),
            }))}
          />
        </div>
      );
    }

    return (
      <Stack>
        <SettingsPage />
        <FilterTabs />
      </Stack>
    );
  },
};
