import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Row } from './Row';
import { Icon } from '../Icon';
import { Button } from '../Button';

/**
 * Row — one horizontal line of items that never wraps. A named
 * `Stack orientation="horizontal"`; use Cluster when items should wrap.
 * @summary One horizontal line of items that never wraps
 */
const meta: Meta<typeof Row> = {
  title: 'Layouts/row',
  component: Row,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    gap: { control: 'select', options: ['none', 'tiny', 'xs', 'sm', 'md', 'lg', 'xl', 'huge'] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    justify: {
      control: 'select',
      options: [undefined, 'start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    as: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Row>;

/**
 * An icon beside its label.
 * @summary Icon beside a label
 */
export const Default: Story = {
  args: { gap: 'sm', align: 'center' },
  render: (args) => (
    <Row {...args}>
      <Icon icon="ph:map-pin" />
      <span>Denver, CO</span>
    </Row>
  ),
};

/**
 * A title with a trailing action — `justify="between"` pushes the action
 * to the far edge.
 * @summary Title with a trailing action
 */
export const TrailingAction: Story = {
  args: { gap: 'md', align: 'center', justify: 'between' },
  render: (args) => (
    <Row {...args}>
      <h3 style={{ margin: 0 }}>Invoices</h3>
      <Button variant="primary" size="sm">
        New invoice
      </Button>
    </Row>
  ),
};

/**
 * Asserts the contract that separates Row from Cluster: Row lays out on
 * one horizontal line and never wraps, even when its container is too
 * narrow for its items.
 * @summary Interaction test — Row never wraps
 */
export const InteractionTestNoWrap: Story = {
  tags: ['!manifest', 'interaction-test'],
  render: () => (
    <div style={{ width: 120 }}>
      <Row data-testid="row">
        <span>one</span>
        <span>two</span>
        <span>three</span>
        <span>four</span>
      </Row>
    </div>
  ),
  play: async ({ canvas }) => {
    const row = canvas.getByTestId('row');
    const style = getComputedStyle(row);
    await expect(style.flexDirection).toBe('row');
    await expect(style.flexWrap).toBe('nowrap');
  },
};
