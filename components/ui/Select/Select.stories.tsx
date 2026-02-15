import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta = {
  title: 'Components/Select',
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
 * Select with disabled options
 */
export const WithDisabledOptions: Story = {
  args: {
    placeholder: 'Select one...',
    options: [
      { label: 'Available option', value: 'available' },
      { label: 'Disabled option', value: 'disabled', disabled: true },
      { label: 'Another available', value: 'available2' },
    ],
  },
};

/**
 * Plan selection dropdown
 */
export const PlanSelection: Story = {
  args: {
    placeholder: 'Choose your plan...',
    options: [
      { label: 'Basic - $9/month', value: 'basic' },
      { label: 'Pro - $29/month', value: 'pro' },
      { label: 'Enterprise - Custom', value: 'enterprise' },
    ],
  },
};

/**
 * Theme selection dropdown
 */
export const ThemeSelection: Story = {
  args: {
    placeholder: 'Select theme...',
    options: [
      { label: 'Theme 1', value: 'theme1' },
      { label: 'Theme 2', value: 'theme2' },
      { label: 'Theme 3', value: 'theme3' },
      { label: 'Theme 4', value: 'theme4' },
      { label: 'Theme 5', value: 'theme5' },
      { label: 'Theme 6', value: 'theme6' },
      { label: 'Theme 7', value: 'theme7' },
      { label: 'Theme 8', value: 'theme8' },
    ],
    defaultValue: 'theme3',
  },
};

/**
 * Multiple selects in a form
 */
export const FormExample: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--lg)', minWidth: '300px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--sm)' }}>
        <label style={{
          fontFamily: 'var(--_typography---font-family--label)',
          fontSize: 'var(--_typography---label--md-base)',
          fontWeight: 'var(--font-weight--semi-bold)',
        }}>
          Country
        </label>
        <Select
          placeholder="Select country..."
          options={[
            { label: 'United States', value: 'us' },
            { label: 'Canada', value: 'ca' },
            { label: 'United Kingdom', value: 'uk' },
            { label: 'Australia', value: 'au' },
          ]}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--sm)' }}>
        <label style={{
          fontFamily: 'var(--_typography---font-family--label)',
          fontSize: 'var(--_typography---label--md-base)',
          fontWeight: 'var(--font-weight--semi-bold)',
        }}>
          Industry
        </label>
        <Select
          placeholder="Select industry..."
          options={[
            { label: 'Technology', value: 'tech' },
            { label: 'Healthcare', value: 'healthcare' },
            { label: 'Finance', value: 'finance' },
            { label: 'Education', value: 'education' },
            { label: 'Other', value: 'other' },
          ]}
        />
      </div>
    </div>
  ),
};
