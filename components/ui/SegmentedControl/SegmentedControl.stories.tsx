import React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentedControl } from './SegmentedControl';

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

/** Interactive wrapper — manages selected value state */
function InteractiveSegmentedControl({
  items,
  size,
  fullWidth,
  disabled,
  defaultValue,
}: {
  items: { label: string; value?: string; disabled?: boolean }[];
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  defaultValue?: string;
}) {
  const firstValue = items[0]?.value ?? items[0]?.label ?? '';
  const [value, setValue] = useState(defaultValue ?? firstValue);

  return (
    <SegmentedControl
      items={items}
      value={value}
      onChange={setValue}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
    />
  );
}

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/Control/segmented-control',
  component: SegmentedControl,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    items: [
      { label: 'Grid', value: 'grid' },
      { label: 'List', value: 'list' },
    ],
    value: 'grid',
    size: 'md',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, disabled, full-width, many segments
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => {
    const items = [
      { label: 'Active', value: 'active' },
      { label: 'Archived', value: 'archived' },
      { label: 'All', value: 'all' },
    ];

    return (
      <Stack>
        {/* Sizes */}
        <div>
          <SectionLabel>Small</SectionLabel>
          <InteractiveSegmentedControl items={items} size="sm" />
        </div>
        <div>
          <SectionLabel>Medium (default)</SectionLabel>
          <InteractiveSegmentedControl items={items} size="md" />
        </div>
        <div>
          <SectionLabel>Large</SectionLabel>
          <InteractiveSegmentedControl items={items} size="lg" />
        </div>

        {/* Full width */}
        <div>
          <SectionLabel>Full width</SectionLabel>
          <div style={{ width: 400 }}>
            <InteractiveSegmentedControl
              fullWidth
              items={[
                { label: 'Monthly', value: 'monthly' },
                { label: 'Yearly', value: 'yearly' },
              ]}
            />
          </div>
        </div>

        {/* Disabled states */}
        <div>
          <SectionLabel>Individual segment disabled</SectionLabel>
          <InteractiveSegmentedControl
            items={[
              { label: 'Published', value: 'published' },
              { label: 'Draft', value: 'draft' },
              { label: 'Archived', value: 'archived', disabled: true },
            ]}
          />
        </div>
        <div>
          <SectionLabel>Fully disabled</SectionLabel>
          <InteractiveSegmentedControl
            disabled
            items={[
              { label: 'Grid', value: 'grid' },
              { label: 'List', value: 'list' },
            ]}
          />
        </div>

        {/* Many segments */}
        <div>
          <SectionLabel>Many segments</SectionLabel>
          <InteractiveSegmentedControl
            items={[
              { label: 'All', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Paused', value: 'paused' },
              { label: 'Draft', value: 'draft' },
              { label: 'Archived', value: 'archived' },
            ]}
          />
        </div>
      </Stack>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Real-world usage
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => {
    function ViewSwitcher() {
      const [view, setView] = useState('grid');
      return (
        <div>
          <SectionLabel>View switcher</SectionLabel>
          <SegmentedControl
            items={[
              { label: 'Grid', value: 'grid' },
              { label: 'List', value: 'list' },
            ]}
            value={view}
            onChange={setView}
            size="sm"
          />
        </div>
      );
    }

    function PricingToggle() {
      const [plan, setPlan] = useState('monthly');
      return (
        <div>
          <SectionLabel>Pricing toggle</SectionLabel>
          <div style={{ width: 320 }}>
            <SegmentedControl
              items={[
                { label: 'Monthly', value: 'monthly' },
                { label: 'Yearly', value: 'yearly' },
              ]}
              value={plan}
              onChange={setPlan}
              fullWidth
            />
          </div>
        </div>
      );
    }

    function DateRange() {
      const [range, setRange] = useState('week');
      return (
        <div>
          <SectionLabel>Date range selector</SectionLabel>
          <SegmentedControl
            items={[
              { label: 'Day', value: 'day' },
              { label: 'Week', value: 'week' },
              { label: 'Month', value: 'month' },
              { label: 'Year', value: 'year' },
            ]}
            value={range}
            onChange={setRange}
          />
        </div>
      );
    }

    return (
      <Stack>
        <ViewSwitcher />
        <PricingToggle />
        <DateRange />
      </Stack>
    );
  },
};
