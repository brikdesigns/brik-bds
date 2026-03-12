import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaintBrush, faBullhorn, faCircleInfo, faCube, faCog } from '@fortawesome/free-solid-svg-icons';
import { MultiSelect } from './MultiSelect';

const meta = {
  title: 'Components/Form/select',
  component: MultiSelect,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const serviceOptions = [
  { label: 'Brand Design', value: 'brand', icon: <FontAwesomeIcon icon={faPaintBrush} /> },
  { label: 'Marketing', value: 'marketing', icon: <FontAwesomeIcon icon={faBullhorn} /> },
  { label: 'Information Design', value: 'information', icon: <FontAwesomeIcon icon={faCircleInfo} /> },
  { label: 'Product Design', value: 'product', icon: <FontAwesomeIcon icon={faCube} /> },
  { label: 'Service Design', value: 'service', icon: <FontAwesomeIcon icon={faCog} /> },
];

const skillOptions = [
  { label: 'React', value: 'react' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Next.js', value: 'nextjs' },
  { label: 'Tailwind CSS', value: 'tailwind' },
  { label: 'Figma', value: 'figma' },
  { label: 'Node.js', value: 'nodejs' },
  { label: 'PostgreSQL', value: 'postgres' },
  { label: 'GraphQL', value: 'graphql' },
];

/**
 * Multi-select with Tag chips — pick multiple options from the dropdown.
 * Selected items appear as removable Tags below the select.
 */
export const MultiSelectDefault: Story = {
  name: 'Multi-select',
  args: { options: serviceOptions },
  render: () => {
    const [values, setValues] = useState<string[]>([]);
    return (
      <div style={{ maxWidth: '480px' }}>
        <MultiSelect
          label="Service lines"
          placeholder="Select service lines..."
          options={serviceOptions}
          value={values}
          onChange={setValues}
        />
      </div>
    );
  },
};

/**
 * Multi-select with some options pre-selected.
 */
export const MultiSelectPreSelected: Story = {
  name: 'Multi-select (pre-selected)',
  args: { options: serviceOptions },
  render: () => {
    const [values, setValues] = useState<string[]>(['brand', 'product']);
    return (
      <div style={{ maxWidth: '480px' }}>
        <MultiSelect
          label="Service lines"
          placeholder="Select service lines..."
          options={serviceOptions}
          value={values}
          onChange={setValues}
        />
      </div>
    );
  },
};

/**
 * Multi-select with many options — tags wrap naturally.
 */
export const MultiSelectManyOptions: Story = {
  name: 'Multi-select (many options)',
  args: { options: skillOptions },
  render: () => {
    const [values, setValues] = useState<string[]>(['react', 'typescript', 'nextjs']);
    return (
      <div style={{ maxWidth: '480px' }}>
        <MultiSelect
          label="Skills"
          placeholder="Add skills..."
          options={skillOptions}
          value={values}
          onChange={setValues}
          helperText="Select all that apply"
        />
      </div>
    );
  },
};

/**
 * Multi-select sizes — sm, md, lg matching other form components.
 */
export const MultiSelectSizes: Story = {
  name: 'Multi-select sizes',
  args: { options: serviceOptions },
  render: () => {
    const [smValues, setSmValues] = useState<string[]>(['brand']);
    const [mdValues, setMdValues] = useState<string[]>(['brand', 'marketing']);
    const [lgValues, setLgValues] = useState<string[]>(['brand', 'marketing', 'product']);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--padding-xl)', maxWidth: '480px' }}>
        <MultiSelect
          label="Small"
          size="sm"
          placeholder="Select..."
          options={serviceOptions}
          value={smValues}
          onChange={setSmValues}
        />
        <MultiSelect
          label="Medium (default)"
          size="md"
          placeholder="Select..."
          options={serviceOptions}
          value={mdValues}
          onChange={setMdValues}
        />
        <MultiSelect
          label="Large"
          size="lg"
          placeholder="Select..."
          options={serviceOptions}
          value={lgValues}
          onChange={setLgValues}
        />
      </div>
    );
  },
};

/**
 * Disabled multi-select — tags are visible but not removable.
 */
export const MultiSelectDisabled: Story = {
  name: 'Multi-select (disabled)',
  args: { options: serviceOptions },
  render: () => (
    <div style={{ maxWidth: '480px' }}>
      <MultiSelect
        label="Service lines"
        placeholder="Select..."
        options={serviceOptions}
        value={['brand', 'marketing']}
        disabled
      />
    </div>
  ),
};

/**
 * Multi-select with error validation.
 */
export const MultiSelectWithError: Story = {
  name: 'Multi-select (error)',
  args: { options: serviceOptions },
  render: () => {
    const [values, setValues] = useState<string[]>([]);
    return (
      <div style={{ maxWidth: '480px' }}>
        <MultiSelect
          label="Required services"
          placeholder="Select at least one..."
          options={serviceOptions}
          value={values}
          onChange={setValues}
          error={values.length === 0 ? 'Please select at least one service' : undefined}
        />
      </div>
    );
  },
};
