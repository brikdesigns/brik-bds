import type { Meta, StoryObj } from '@storybook/react';
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
      options: ['sm', 'md', 'lg'],
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
 * Default select with placeholder
 */
export const Default: Story = {
  args: {
    placeholder: 'Select one...',
    options: basicOptions,
  },
};

/**
 * Select with a leading icon
 */
export const WithIcon: Story = {
  args: {
    placeholder: 'Select company...',
    options: [
      { label: 'Acme Corp', value: 'acme' },
      { label: 'Globex Inc', value: 'globex' },
      { label: 'Initech', value: 'initech' },
    ],
    icon: <FontAwesomeIcon icon={faBuilding} />,
  },
};

/**
 * Small select with icon
 */
export const SmallWithIcon: Story = {
  args: {
    placeholder: 'Select user...',
    options: [
      { label: 'Alice Johnson', value: 'alice' },
      { label: 'Bob Smith', value: 'bob' },
      { label: 'Carol White', value: 'carol' },
    ],
    size: 'sm',
    icon: <FontAwesomeIcon icon={faUser} />,
  },
};

/**
 * Select with label and icon
 */
export const WithLabelAndIcon: Story = {
  args: {
    label: 'Company',
    placeholder: 'Select company...',
    options: [
      { label: 'Acme Corp', value: 'acme' },
      { label: 'Globex Inc', value: 'globex' },
      { label: 'Initech', value: 'initech' },
    ],
    icon: <FontAwesomeIcon icon={faBuilding} />,
    fullWidth: true,
  },
};

/**
 * Select with default value
 */
export const WithDefaultValue: Story = {
  args: {
    placeholder: 'Select one...',
    options: basicOptions,
    defaultValue: 'second',
  },
};

/**
 * Disabled select
 */
export const Disabled: Story = {
  args: {
    placeholder: 'Select one...',
    options: basicOptions,
    disabled: true,
  },
};

/**
 * Select with error state
 */
export const WithError: Story = {
  args: {
    label: 'Region',
    placeholder: 'Select region...',
    options: [
      { label: 'North America', value: 'na' },
      { label: 'Europe', value: 'eu' },
      { label: 'Asia Pacific', value: 'apac' },
    ],
    error: 'Please select a region',
    icon: <FontAwesomeIcon icon={faGlobe} />,
    fullWidth: true,
  },
};

/**
 * All three sizes compared
 */
export const AllSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Select size="sm" placeholder="Small" options={options} icon={<FontAwesomeIcon icon={faTag} />} />
<Select size="md" placeholder="Medium" options={options} icon={<FontAwesomeIcon icon={faTag} />} />
<Select size="lg" placeholder="Large" options={options} icon={<FontAwesomeIcon icon={faTag} />} />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---lg)', minWidth: '300px' }}>
      <Select size="sm" placeholder="Small" options={basicOptions} icon={<FontAwesomeIcon icon={faTag} />} fullWidth />
      <Select size="md" placeholder="Medium" options={basicOptions} icon={<FontAwesomeIcon icon={faTag} />} fullWidth />
      <Select size="lg" placeholder="Large" options={basicOptions} icon={<FontAwesomeIcon icon={faTag} />} fullWidth />
    </div>
  ),
  args: {
    options: basicOptions,
  },
};

/**
 * Multiple selects in a form
 */
export const FormExample: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Select label="Country" placeholder="Select country..." options={countries} icon={<FontAwesomeIcon icon={faGlobe} />} />
<Select label="Industry" placeholder="Select industry..." options={industries} icon={<FontAwesomeIcon icon={faBuilding} />} />`,
      },
    },
  },
  render: () => (
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
        fullWidth
      />
    </div>
  ),
  args: {
    options: basicOptions,
  },
};
