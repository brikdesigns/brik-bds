import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, fn } from 'storybook/test';
import { TabBar } from './TabBar';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof TabBar> = {
  title: 'Sections/tab-bar',
  component: TabBar,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    items: {
      control: false,
      description:
        'Tab items — each renders as a `button[role="tab"]`. Set `active`, `disabled`, `onClick`, ' +
        'and optionally `dot` (boolean or `DotStatus`) for an attention-cue indicator.',
    },
    variant: {
      control: 'select',
      options: ['text', 'text-underline', 'tab', 'box'],
      description:
        '`text` (default) = plain labels, no indicator. `text-underline` = text + brand-color underline ' +
        'below the active tab. `tab` = bottom-border bar with brand-color underline. `box` = filled ' +
        'background for active, bordered for inactive.',
    },
    onColor: {
      control: 'boolean',
      description: 'On-color mode — switches text/border to on-color-dark tokens for brand/dark backgrounds.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TabBar>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    variant: 'tab',
    items: [
      { label: 'Overview', active: true },
      { label: 'Billing', dot: true },
      { label: 'Security' },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   VARIANTS — one story per style (Q3 semantic starting points)
   ═══════════════════════════════════════════════════════════════ */

/** @summary Plain labels with brand color for the active tab; no indicator */
export const Text: Story = {
  args: {
    variant: 'text',
    items: [
      { label: 'All', active: true },
      { label: 'Active' },
      { label: 'Archived' },
    ],
  },
};

/** @summary Text color behavior plus a brand-color underline below the active tab */
export const TextUnderline: Story = {
  args: {
    variant: 'text-underline',
    items: [
      { label: 'All', active: true },
      { label: 'Active' },
      { label: 'Archived' },
    ],
  },
};

/** @summary Bottom-border bar with a brand-color underline over the baseline */
export const Tab: Story = {
  args: {
    variant: 'tab',
    items: [
      { label: 'Overview', active: true },
      { label: 'Billing', dot: true },
      { label: 'Feedback', dot: 'warning' },
      { label: 'Security' },
    ],
  },
};

/** @summary Filled background for the active tab, bordered for inactive */
export const Box: Story = {
  args: {
    variant: 'box',
    items: [
      { label: 'All', active: true },
      { label: 'Active' },
      { label: 'Draft' },
      { label: 'Archived' },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   WITH CONTROLLED TABS — Q4 irreducible: clicking a tab updates
   which tab is active, which args alone can't express
   ═══════════════════════════════════════════════════════════════ */

/** @summary Clicking a tab updates the active tab and its content */
export const WithControlledTabs: Story = {
  render: () => {
    function SettingsPage() {
      const [activeIndex, setActiveIndex] = useState(0);
      const tabs = ['General', 'Billing', 'Team', 'Security'];

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
    }

    return <SettingsPage />;
  },
};

/* ═══════════════════════════════════════════════════════════════
   INTERACTION TEST — Q5 play-only, hidden from MCP discovery
   ═══════════════════════════════════════════════════════════════ */

const tabClickHandler = fn();

/** @summary Verifies clicking a tab fires its onClick handler */
export const InteractionTest: Story = {
  tags: ['!manifest'],
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
