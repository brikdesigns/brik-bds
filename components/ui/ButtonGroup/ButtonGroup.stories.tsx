import type { Meta, StoryObj } from '@storybook/react-vite';
import { ButtonGroup } from './ButtonGroup';
import { Button } from '../Button';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/Action/button-group',
  component: ButtonGroup,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    fullWidth: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
    </ButtonGroup>
  ),
};

export const WithThreeButtons: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="primary">Save</Button>
      <Button variant="outline">Preview</Button>
      <Button variant="ghost">Cancel</Button>
    </ButtonGroup>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="primary" fullWidth>Sign up</Button>
      <Button variant="outline" fullWidth>Log in</Button>
    </ButtonGroup>
  ),
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
  },
  render: (args) => (
    <div style={{ width: 400 }}>
      <ButtonGroup {...args}>
        <Button variant="primary" fullWidth>Confirm</Button>
        <Button variant="secondary" fullWidth>Cancel</Button>
      </ButtonGroup>
    </div>
  ),
};

export const SmallButtons: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="primary" size="sm">Accept</Button>
      <Button variant="ghost" size="sm">Decline</Button>
    </ButtonGroup>
  ),
};
