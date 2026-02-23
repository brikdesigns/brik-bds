import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from './Radio';

const meta = {
  title: 'Components/radio',
  component: Radio,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text for the radio button',
    },
    name: {
      control: 'text',
      description: 'Radio group name (required for grouping)',
    },
    value: {
      control: 'text',
      description: 'Value of this radio option',
    },
    checked: {
      control: 'boolean',
      description: 'Checked state (controlled)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default radio button
 */
export const Default: Story = {
  args: {
    label: 'Option 1',
    name: 'example',
    value: 'option1',
  },
};

/**
 * Checked radio button
 */
export const Checked: Story = {
  args: {
    label: 'Selected option',
    name: 'example',
    value: 'selected',
    checked: true,
  },
};

/**
 * Disabled radio button
 */
export const Disabled: Story = {
  args: {
    label: 'Disabled option',
    name: 'example',
    value: 'disabled',
    disabled: true,
  },
};

/**
 * Disabled and checked
 */
export const DisabledChecked: Story = {
  args: {
    label: 'Disabled but selected',
    name: 'example',
    value: 'disabled-selected',
    disabled: true,
    checked: true,
  },
};

/**
 * Radio group - Plan selection
 */
export const PlanSelection: Story = {
  args: { label: 'Basic Plan - $9/month', name: 'plan', value: 'basic' },
  parameters: {
    docs: {
      source: {
        code: `<Radio name="plan" value="basic" label="Basic Plan - $9/month" />
<Radio name="plan" value="pro" label="Pro Plan - $29/month" defaultChecked />
<Radio name="plan" value="enterprise" label="Enterprise - Custom pricing" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--md)' }}>
      <Radio name="plan" value="basic" label="Basic Plan - $9/month" />
      <Radio name="plan" value="pro" label="Pro Plan - $29/month" defaultChecked />
      <Radio name="plan" value="enterprise" label="Enterprise - Custom pricing" />
    </div>
  ),
};

/**
 * Radio group - Theme selection
 */
export const ThemeSelection: Story = {
  args: { label: 'Theme 1', name: 'theme', value: 'theme1' },
  parameters: {
    docs: {
      source: {
        code: `<Radio name="theme" value="theme1" label="Theme 1" />
<Radio name="theme" value="theme2" label="Theme 2" />
<Radio name="theme" value="theme3" label="Theme 3" defaultChecked />
<Radio name="theme" value="theme4" label="Theme 4" />
<Radio name="theme" value="theme5" label="Theme 5" />
<Radio name="theme" value="theme6" label="Theme 6" />
<Radio name="theme" value="theme7" label="Theme 7" />
<Radio name="theme" value="theme8" label="Theme 8" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--md)' }}>
      <Radio name="theme" value="theme1" label="Theme 1" />
      <Radio name="theme" value="theme2" label="Theme 2" />
      <Radio name="theme" value="theme3" label="Theme 3" defaultChecked />
      <Radio name="theme" value="theme4" label="Theme 4" />
      <Radio name="theme" value="theme5" label="Theme 5" />
      <Radio name="theme" value="theme6" label="Theme 6" />
      <Radio name="theme" value="theme7" label="Theme 7" />
      <Radio name="theme" value="theme8" label="Theme 8" />
    </div>
  ),
};
