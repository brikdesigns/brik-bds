import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCrown,
  faBullhorn,
  faMobileScreen,
  faGear,
  faChalkboardUser,
  faCopy,
  faGlobe,
} from '@fortawesome/free-solid-svg-icons';
import { FilterButton } from './FilterButton';

const meta = {
  title: 'Components/filter-button',
  component: FilterButton,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Default label text when no option is selected',
    },
    value: {
      control: 'text',
      description: 'Currently selected option ID',
    },
  },
} satisfies Meta<typeof FilterButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const categoryOptions = [
  { id: 'brand', label: 'Brand design', icon: <FontAwesomeIcon icon={faCrown} /> },
  { id: 'marketing', label: 'Marketing design', icon: <FontAwesomeIcon icon={faBullhorn} /> },
  { id: 'product', label: 'Product design', icon: <FontAwesomeIcon icon={faMobileScreen} /> },
  { id: 'service', label: 'Service design', icon: <FontAwesomeIcon icon={faGear} /> },
  { id: 'information', label: 'Information design', icon: <FontAwesomeIcon icon={faChalkboardUser} /> },
  { id: 'templates', label: 'Templates', icon: <FontAwesomeIcon icon={faCopy} /> },
];

const regionOptions = [
  { id: 'na', label: 'North America', icon: <FontAwesomeIcon icon={faGlobe} /> },
  { id: 'eu', label: 'Europe', icon: <FontAwesomeIcon icon={faGlobe} /> },
  { id: 'apac', label: 'Asia Pacific', icon: <FontAwesomeIcon icon={faGlobe} /> },
];

const tagOptions = [
  { id: 'new', label: 'New' },
  { id: 'popular', label: 'Popular' },
  { id: 'featured', label: 'Featured' },
  { id: 'archived', label: 'Archived' },
];

/**
 * Default filter button — click to open dropdown, select to activate
 */
export const Default: Story = {
  args: {
    label: 'Category',
    options: categoryOptions,
  },
};

/**
 * Filter button with a pre-selected value (active state)
 */
export const WithValue: Story = {
  args: {
    label: 'Category',
    options: categoryOptions,
    value: 'brand',
  },
};

/**
 * Text-only options without icons
 */
export const TextOnly: Story = {
  args: {
    label: 'Status',
    options: tagOptions,
  },
};

/**
 * Interactive example with state management
 */
export const Interactive: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [value, setValue] = useState<string | undefined>();

<FilterButton
  label="Category"
  options={categoryOptions}
  value={value}
  onChange={setValue}
/>`,
      },
    },
  },
  render: function InteractiveFilter() {
    const [value, setValue] = useState<string | undefined>();
    return (
      <FilterButton
        label="Category"
        options={categoryOptions}
        value={value}
        onChange={setValue}
      />
    );
  },
  args: {
    label: 'Category',
    options: categoryOptions,
  },
};

/**
 * Multiple filter buttons in a toolbar layout
 */
export const FilterBar: Story = {
  parameters: {
    docs: {
      source: {
        code: `<div style={{ display: 'flex', gap: 'var(--_space---gap--md)' }}>
  <FilterButton label="Category" options={categories} value={cat} onChange={setCat} />
  <FilterButton label="Region" options={regions} value={reg} onChange={setReg} />
  <FilterButton label="Status" options={statuses} value={stat} onChange={setStat} />
</div>`,
      },
    },
  },
  render: function FilterBarExample() {
    const [cat, setCat] = useState<string | undefined>();
    const [reg, setReg] = useState<string | undefined>();
    const [tag, setTag] = useState<string | undefined>();
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--_space---gap--md)' }}>
        <FilterButton label="Category" options={categoryOptions} value={cat} onChange={setCat} />
        <FilterButton label="Region" options={regionOptions} value={reg} onChange={setReg} />
        <FilterButton label="Status" options={tagOptions} value={tag} onChange={setTag} />
      </div>
    );
  },
  args: {
    label: 'Category',
    options: categoryOptions,
  },
};
