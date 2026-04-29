import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentedControl } from './SegmentedControl';

/**
 * SegmentedControl — single-select toggle group with the active segment
 * highlighted. Use for view switchers, density toggles, and tab-like state.
 * @summary Single-select toggle group
 */
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

const statusItems = [
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
  { label: 'All', value: 'all' },
];

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
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

/** All three sizes side-by-side. ADR-006 axis-gallery exception.
 *  @summary All sizes rendered together */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
      <SegmentedControl items={statusItems} value="active" onChange={() => {}} size="sm" />
      <SegmentedControl items={statusItems} value="active" onChange={() => {}} size="md" />
      <SegmentedControl items={statusItems} value="active" onChange={() => {}} size="lg" />
    </div>
  ),
};

/** Full-width — segments stretch to fill the parent. Common for in-row toggles.
 *  @summary Full-width segmented control */
export const FullWidth: Story = {
  args: {
    items: [
      { label: 'Monthly', value: 'monthly' },
      { label: 'Yearly', value: 'yearly' },
    ],
    value: 'monthly',
    fullWidth: true,
  },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
};

/** Per-item disabled — individual segments can be locked. Useful when one
 *  option is gated behind a permission or feature flag.
 *  @summary One disabled segment */
export const SegmentDisabled: Story = {
  args: {
    items: [
      { label: 'Published', value: 'published' },
      { label: 'Draft', value: 'draft' },
      { label: 'Archived', value: 'archived', disabled: true },
    ],
    value: 'published',
  },
};

/** Fully disabled — entire control is non-interactive.
 *  @summary Fully disabled segmented control */
export const Disabled: Story = {
  args: {
    items: [
      { label: 'Grid', value: 'grid' },
      { label: 'List', value: 'list' },
    ],
    value: 'grid',
    disabled: true,
  },
};

/** Interactive — `useState` drives the selected value. Render is required for
 *  the controlled-state demo.
 *  @summary Interactive controlled segmented control */
export const Interactive: Story = {
  render: () => {
    const Demo = () => {
      const [view, setView] = useState('grid');
      return (
        <SegmentedControl
          items={[
            { label: 'Grid', value: 'grid' },
            { label: 'List', value: 'list' },
            { label: 'Cards', value: 'cards' },
          ]}
          value={view}
          onChange={setView}
        />
      );
    };
    return <Demo />;
  },
};
