import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faUser, faGlobe, faTag } from '@fortawesome/free-solid-svg-icons';
import { Select } from './Select';

const meta = {
  title: 'Components/select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size variant',
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicOptions = [
  { label: 'First choice', value: 'first' },
  { label: 'Second choice', value: 'second' },
  { label: 'Third choice', value: 'third' },
];

/**
 * Custom select with BDS Menu-style dropdown.
 * Full keyboard navigation (arrows, Enter, Escape, type-ahead).
 * Dark mode support via CSS variable tokens.
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div style={{ minWidth: '280px' }}>
        <Select
          placeholder="Select one..."
          options={basicOptions}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          fullWidth
        />
      </div>
    );
  },
  args: {
    placeholder: 'Select one...',
    options: basicOptions,
  },
};

/**
 * Select with a leading icon
 */
export const WithIcon: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div style={{ minWidth: '280px' }}>
        <Select
          placeholder="Select company..."
          options={[
            { label: 'Acme Corp', value: 'acme' },
            { label: 'Globex Inc', value: 'globex' },
            { label: 'Initech', value: 'initech' },
          ]}
          icon={<FontAwesomeIcon icon={faBuilding} />}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          fullWidth
        />
      </div>
    );
  },
  args: {
    options: [],
  },
};

/**
 * Small size with icon
 */
export const SmallWithIcon: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div style={{ minWidth: '280px' }}>
        <Select
          placeholder="Select user..."
          options={[
            { label: 'Alice Johnson', value: 'alice' },
            { label: 'Bob Smith', value: 'bob' },
            { label: 'Carol White', value: 'carol' },
          ]}
          size="sm"
          icon={<FontAwesomeIcon icon={faUser} />}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          fullWidth
        />
      </div>
    );
  },
  args: {
    options: [],
  },
};

/**
 * With label, icon, and full width
 */
export const WithLabelAndIcon: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div style={{ minWidth: '300px' }}>
        <Select
          label="Company"
          placeholder="Select company..."
          options={[
            { label: 'Acme Corp', value: 'acme' },
            { label: 'Globex Inc', value: 'globex' },
            { label: 'Initech', value: 'initech' },
          ]}
          icon={<FontAwesomeIcon icon={faBuilding} />}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          fullWidth
        />
      </div>
    );
  },
  args: {
    options: [],
  },
};

/**
 * Uncontrolled with default value
 */
export const WithDefaultValue: Story = {
  args: {
    placeholder: 'Select one...',
    options: basicOptions,
    defaultValue: 'second',
  },
  decorators: [(Story) => <div style={{ minWidth: '280px' }}><Story /></div>],
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    placeholder: 'Select one...',
    options: basicOptions,
    disabled: true,
  },
  decorators: [(Story) => <div style={{ minWidth: '280px' }}><Story /></div>],
};

/**
 * Error state with label
 */
export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div style={{ minWidth: '300px' }}>
        <Select
          label="Region"
          placeholder="Select region..."
          options={[
            { label: 'North America', value: 'na' },
            { label: 'Europe', value: 'eu' },
            { label: 'Asia Pacific', value: 'apac' },
          ]}
          error="Please select a region"
          icon={<FontAwesomeIcon icon={faGlobe} />}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          fullWidth
        />
      </div>
    );
  },
  args: {
    options: [],
  },
};

/**
 * With disabled options
 */
export const DisabledOptions: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div style={{ minWidth: '280px' }}>
        <Select
          label="Plan"
          placeholder="Select a plan..."
          options={[
            { label: 'Free', value: 'free' },
            { label: 'Starter', value: 'starter' },
            { label: 'Pro', value: 'pro' },
            { label: 'Enterprise (coming soon)', value: 'enterprise', disabled: true },
          ]}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          fullWidth
        />
      </div>
    );
  },
  args: {
    options: [],
  },
};

/**
 * Both sizes compared
 */
export const AllSizes: Story = {
  render: () => {
    const [sm, setSm] = useState('');
    const [md, setMd] = useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---lg)', minWidth: '300px' }}>
        <Select
          size="sm"
          label="Small"
          placeholder="Small select"
          options={basicOptions}
          icon={<FontAwesomeIcon icon={faTag} />}
          value={sm}
          onChange={(e) => setSm(e.target.value)}
          fullWidth
        />
        <Select
          size="md"
          label="Medium (default)"
          placeholder="Medium select"
          options={basicOptions}
          icon={<FontAwesomeIcon icon={faTag} />}
          value={md}
          onChange={(e) => setMd(e.target.value)}
          fullWidth
        />
      </div>
    );
  },
  args: {
    options: basicOptions,
  },
};

/**
 * Long option list with scroll
 */
export const LongList: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const states = [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
      'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
      'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
      'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    ].map(s => ({ label: s, value: s.toLowerCase().replace(/\s/g, '-') }));

    return (
      <div style={{ minWidth: '300px' }}>
        <Select
          label="State"
          placeholder="Select a state..."
          options={states}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          fullWidth
        />
      </div>
    );
  },
  args: {
    options: [],
  },
};

/**
 * Form layout with multiple selects
 */
export const FormExample: Story = {
  render: () => {
    const [country, setCountry] = useState('');
    const [industry, setIndustry] = useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---lg)', minWidth: '300px' }}>
        <Select
          label="Country"
          placeholder="Select country..."
          options={[
            { label: 'United States', value: 'us' },
            { label: 'Canada', value: 'ca' },
            { label: 'United Kingdom', value: 'uk' },
            { label: 'Australia', value: 'au' },
          ]}
          icon={<FontAwesomeIcon icon={faGlobe} />}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          fullWidth
        />
        <Select
          label="Industry"
          placeholder="Select industry..."
          options={[
            { label: 'Technology', value: 'tech' },
            { label: 'Healthcare', value: 'healthcare' },
            { label: 'Finance', value: 'finance' },
            { label: 'Education', value: 'education' },
            { label: 'Other', value: 'other' },
          ]}
          icon={<FontAwesomeIcon icon={faBuilding} />}
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          fullWidth
        />
      </div>
    );
  },
  args: {
    options: [],
  },
};
