import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, fn } from 'storybook/test';
import { TabBar } from './TabBar';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof TabBar> = {
  title: 'Navigation/tab-bar',
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
    overflow: {
      control: 'select',
      options: ['wrap', 'scroll'],
      description:
        '`wrap` (default) flows tabs that outgrow the rail onto a new row. `scroll` keeps one row and scrolls ' +
        'it sideways — use it where a second row would push the page down, e.g. below the tablet breakpoint.',
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

/**
 * Args-driven sandbox. Shows the default `variant: 'text'` (plain labels, brand
 * color for the active tab, no indicator) — switch `variant` in Controls.
 *
 * @summary Interactive playground for prop tweaking
 */
export const Default: Story = {
  args: {
    variant: 'text',
    items: [
      { label: 'Overview', active: true },
      { label: 'Billing', dot: true },
      { label: 'Security' },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   VARIANTS — one story per non-default style (Q3 semantic starting
   points). `text` is the default, shown in `Default` above.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Text color behavior plus a brand-color underline below the
 * active tab.
 * @summary Text color plus underline below active tab
 */
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

/** @summary Bottom-border bar with underline over the baseline */
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
   SCROLLABLE — Q3 starting point: tabs that outgrow their container
   scroll sideways instead of wrapping onto a second row
   ═══════════════════════════════════════════════════════════════ */

const overflowingTabs = [
  { label: 'Overview', active: true },
  { label: 'Billing', dot: true },
  { label: 'Team members' },
  { label: 'Integrations' },
  { label: 'Notifications' },
  { label: 'Security' },
  { label: 'Audit log' },
  { label: 'Danger zone' },
];

/**
 * `overflow: 'scroll'` keeps the rail on one row and scrolls it horizontally
 * when the tabs outgrow their container — the right choice below the tablet
 * breakpoint, where a wrapped rail pushes the page body down. The story pins
 * the container to a phone width so the overflow is visible; the active
 * indicator and any focus ring stay un-clipped.
 * @summary Tabs scroll horizontally instead of wrapping
 */
export const Scrollable: Story = {
  args: {
    variant: 'tab',
    overflow: 'scroll',
    items: overflowingTabs,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 'var(--bds-content-width-text-xs)' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const bar = canvasElement.querySelector('.bds-tab-bar') as HTMLElement;
    const style = getComputedStyle(bar);
    // Scrolls sideways, never wraps.
    await expect(style.overflowX).toBe('auto');
    await expect(style.flexWrap).toBe('nowrap');
    await expect(bar.scrollWidth).toBeGreaterThan(bar.clientWidth);
    // One row: every tab shares a top edge.
    const tops = new Set(
      Array.from(bar.querySelectorAll('[role="tab"]')).map((t) => Math.round(t.getBoundingClientRect().top)),
    );
    await expect(tops.size).toBe(1);
    // The last tab is reachable by scrolling the rail.
    bar.scrollLeft = bar.scrollWidth;
    await expect(bar.scrollLeft).toBeGreaterThan(0);
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
          <div style={{ borderBottom: 'var(--bds-border-width-md) solid var(--bds-border-secondary)' }}>
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
            padding: 'var(--bds-padding-lg)',
            fontFamily: 'var(--bds-font-family-body)',
            fontSize: 'var(--bds-body-md)',
            color: 'var(--bds-text-secondary)',
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
  tags: ['!manifest', 'interaction-test'],
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
