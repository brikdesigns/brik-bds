import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilterToggle } from './FilterToggle';

/**
 * FilterToggle — single-state on/off pill for filter bars. Pairs with
 * `FilterButton` (single-select dropdown). Use when the filter is a binary
 * predicate, not a list selection.
 * @summary On/off pill toggle for filter bars
 */
const meta = {
  title: 'Components/Action/filter-toggle',
  component: FilterToggle,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 120, padding: 'var(--padding-lg)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilterToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-lg)', alignItems: 'flex-start' }}>{children}</div>
);

/** Args-driven sandbox — wraps in `useState` so the toggle is interactive.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { label: 'Show archived', active: false, onToggle: () => {}, size: 'md' },
  render: (args) => {
    const Toggle = () => {
      const [active, setActive] = useState(args.active);
      return (
        <FilterToggle
          {...args}
          active={active}
          onToggle={() => setActive((prev) => !prev)}
        />
      );
    };
    return <Toggle />;
  },
};

/** Inactive state — default off appearance.
 *  @summary Inactive toggle */
export const Inactive: Story = {
  args: { label: 'Show archived', active: false, onToggle: () => {} },
};

/** Active state — brand-color highlight when on.
 *  @summary Active toggle */
export const Active: Story = {
  args: { label: 'Show archived', active: true, onToggle: () => {} },
};

/** All three sizes side-by-side. ADR-006 axis-gallery exception.
 *  @summary All sizes rendered together */
export const Sizes: Story = {
  args: { label: 'Sizes', active: false, onToggle: () => {} },
  render: () => (
    <Row>
      <FilterToggle label="Small" active={false} onToggle={() => {}} size="sm" />
      <FilterToggle label="Medium" active={false} onToggle={() => {}} size="md" />
      <FilterToggle label="Large" active={false} onToggle={() => {}} size="lg" />
    </Row>
  ),
};
