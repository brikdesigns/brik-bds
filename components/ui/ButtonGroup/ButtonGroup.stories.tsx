import type { Meta, StoryObj } from '@storybook/react-vite';
import { ButtonGroup } from './ButtonGroup';
import { Button } from '../Button';

/**
 * ButtonGroup — horizontal or vertical cluster of `<Button>` elements with
 * locked spacing. Replaces ad-hoc flex containers when grouping actions.
 * @summary Cluster of Buttons with locked spacing
 */
const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/Action/button-group',
  component: ButtonGroup,
  parameters: { layout: 'centered' },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
    </ButtonGroup>
  ),
};

/** Default horizontal orientation — most common shape.
 *  @summary Horizontal button group */
export const Horizontal: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="primary">Save</Button>
      <Button variant="outline">Preview</Button>
      <Button variant="ghost">Cancel</Button>
    </ButtonGroup>
  ),
};

/** Vertical orientation — stacked buttons, often used for auth screens.
 *  @summary Vertical button group */
export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="primary" fullWidth>Sign up</Button>
      <Button variant="outline" fullWidth>Log in</Button>
    </ButtonGroup>
  ),
};

/** Full-width — children stretch to the container width. Common in form footers.
 *  @summary Full-width button group */
export const FullWidth: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <ButtonGroup fullWidth>
        <Button variant="primary" fullWidth>Confirm</Button>
        <Button variant="secondary" fullWidth>Cancel</Button>
      </ButtonGroup>
    </div>
  ),
};
