import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { FilterButton } from './FilterButton';

/**
 * FilterButton — single-select dropdown trigger for filter bars. Clicking opens
 * a popover with options; selecting a value highlights the trigger.
 * @summary Single-select filter dropdown trigger
 */
const meta = {
  title: 'Components/Action/filter-button',
  component: FilterButton,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 360, padding: 'var(--padding-lg)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilterButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const categoryOptions = [
  { id: 'brand', label: 'Brand design', icon: <Icon icon="ph:crown" /> },
  { id: 'marketing', label: 'Marketing design', icon: <Icon icon="ph:megaphone" /> },
  { id: 'product', label: 'Product design', icon: <Icon icon="ph:device-mobile" /> },
  { id: 'service', label: 'Back office design', icon: <Icon icon="ph:gear" /> },
  { id: 'information', label: 'Information design', icon: <Icon icon="ph:chalkboard-teacher" /> },
  { id: 'templates', label: 'Templates', icon: <Icon icon="ph:copy" /> },
];

const tagOptions = [
  { id: 'new', label: 'New' },
  { id: 'popular', label: 'Popular' },
  { id: 'featured', label: 'Featured' },
  { id: 'archived', label: 'Archived' },
];

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-lg)', alignItems: 'flex-start' }}>{children}</div>
);

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { label: 'Category', options: categoryOptions, size: 'md' },
};

/** All three sizes side-by-side. ADR-006 axis-gallery exception.
 *  @summary All sizes rendered together */
export const Sizes: Story = {
  args: { label: 'Category', options: categoryOptions },
  render: () => (
    <Row>
      <FilterButton label="Small" options={categoryOptions} size="sm" />
      <FilterButton label="Medium" options={categoryOptions} size="md" />
      <FilterButton label="Large" options={categoryOptions} size="lg" />
    </Row>
  ),
};

/** Active state — `value` is set, trigger highlights with the brand color.
 *  @summary Filter button with active selection */
export const Active: Story = {
  args: { label: 'Category', options: categoryOptions, value: 'brand' },
};

/** Text-only options — no icons, simpler list.
 *  @summary Filter button with text-only options */
export const TextOnlyOptions: Story = {
  args: { label: 'Status', options: tagOptions },
};

/** Interactive — `useState` drives the value. Render is required for the
 *  controlled-state demo.
 *  @summary Interactive controlled filter button */
export const Interactive: Story = {
  args: { label: 'Category', options: categoryOptions },
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<string | undefined>();
      return (
        <FilterButton
          label="Category"
          options={categoryOptions}
          value={value}
          onChange={setValue}
        />
      );
    };
    return <Demo />;
  },
};
