import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text for the checkbox',
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
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default checkbox with label
 */
export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
};

/**
 * Checked checkbox
 */
export const Checked: Story = {
  args: {
    label: 'Subscribe to newsletter',
    checked: true,
  },
};

/**
 * Disabled checkbox
 */
export const Disabled: Story = {
  args: {
    label: 'Disabled option',
    disabled: true,
  },
};

/**
 * Disabled and checked
 */
export const DisabledChecked: Story = {
  args: {
    label: 'Disabled but checked',
    disabled: true,
    checked: true,
  },
};

/**
 * Multiple checkboxes in a group
 */
export const Group: Story = {
  args: { label: 'Hero section' },
  parameters: {
    docs: {
      source: {
        code: `<Checkbox label="Hero section" />
<Checkbox label="1-Column layout" />
<Checkbox label="2-Column layout" defaultChecked />
<Checkbox label="3-Column layout" />
<Checkbox label="CTA section" defaultChecked />
<Checkbox label="Navigation bar" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--md)' }}>
      <Checkbox label="Hero section" />
      <Checkbox label="1-Column layout" />
      <Checkbox label="2-Column layout" defaultChecked />
      <Checkbox label="3-Column layout" />
      <Checkbox label="CTA section" defaultChecked />
      <Checkbox label="Navigation bar" />
    </div>
  ),
};
