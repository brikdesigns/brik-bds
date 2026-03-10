import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentedControl } from './SegmentedControl';

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

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/Control/segmented-control',
  component: SegmentedControl,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Expand to fill container width',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all segments',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

// ─── Default ────────────────────────────────────────────────────

/**
 * Default segmented control with two options. Click to toggle.
 */
export const Default: Story = {
  render: () => (
    <InteractiveSegmentedControl
      items={[
        { label: 'Grid', value: 'grid' },
        { label: 'List', value: 'list' },
      ]}
    />
  ),
};

// ─── Three Segments ─────────────────────────────────────────────

/**
 * Three-segment control for view switching.
 */
export const ThreeSegments: Story = {
  render: () => (
    <InteractiveSegmentedControl
      items={[
        { label: 'Day', value: 'day' },
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' },
      ]}
    />
  ),
};

// ─── Sizes ──────────────────────────────────────────────────────

/**
 * All three sizes compared side by side.
 */
export const Sizes: Story = {
  render: () => {
    const items = [
      { label: 'Active', value: 'active' },
      { label: 'Archived', value: 'archived' },
      { label: 'All', value: 'all' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--padding-xl)', alignItems: 'flex-start' }}>
        <div>
          <p style={{
            fontFamily: 'var(--font-family-label)',
            fontSize: 'var(--label-sm)',
            color: 'var(--text-muted)',
            marginBottom: 'var(--gap-sm)',
          }}>
            Small
          </p>
          <InteractiveSegmentedControl items={items} size="sm" />
        </div>
        <div>
          <p style={{
            fontFamily: 'var(--font-family-label)',
            fontSize: 'var(--label-sm)',
            color: 'var(--text-muted)',
            marginBottom: 'var(--gap-sm)',
          }}>
            Medium (default)
          </p>
          <InteractiveSegmentedControl items={items} size="md" />
        </div>
        <div>
          <p style={{
            fontFamily: 'var(--font-family-label)',
            fontSize: 'var(--label-sm)',
            color: 'var(--text-muted)',
            marginBottom: 'var(--gap-sm)',
          }}>
            Large
          </p>
          <InteractiveSegmentedControl items={items} size="lg" />
        </div>
      </div>
    );
  },
};

// ─── Full Width ─────────────────────────────────────────────────

/**
 * Full-width mode — segments expand equally to fill the container.
 */
export const FullWidth: Story = {
  render: () => (
    <div style={{ width: '400px' }}>
      <InteractiveSegmentedControl
        fullWidth
        items={[
          { label: 'Monthly', value: 'monthly' },
          { label: 'Yearly', value: 'yearly' },
        ]}
      />
    </div>
  ),
};

// ─── Disabled Segments ──────────────────────────────────────────

/**
 * Individual segments can be disabled while others remain interactive.
 */
export const WithDisabled: Story = {
  render: () => (
    <InteractiveSegmentedControl
      items={[
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
        { label: 'Archived', value: 'archived', disabled: true },
      ]}
    />
  ),
};

// ─── Fully Disabled ─────────────────────────────────────────────

/**
 * Entire control disabled — no segments are interactive.
 */
export const FullyDisabled: Story = {
  render: () => (
    <InteractiveSegmentedControl
      disabled
      items={[
        { label: 'Grid', value: 'grid' },
        { label: 'List', value: 'list' },
      ]}
    />
  ),
};

// ─── Many Segments ──────────────────────────────────────────────

/**
 * Handles many items gracefully. Content determines width.
 */
export const ManySegments: Story = {
  render: () => (
    <InteractiveSegmentedControl
      items={[
        { label: 'All', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Draft', value: 'draft' },
        { label: 'Archived', value: 'archived' },
      ]}
    />
  ),
};
