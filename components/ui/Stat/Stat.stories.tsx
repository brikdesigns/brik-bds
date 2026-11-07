import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Stat } from './Stat';

/**
 * Stat — a figure and what it counts, as one unbordered Block.
 * Arrange several with Grid or Cluster; wrap in Card for a surface.
 * @summary A figure and what it counts — value, label, detail
 */
const meta: Meta<typeof Stat> = {
  title: 'Content/stat',
  component: Stat,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    value: { control: 'text' },
    label: { control: 'text' },
    detail: { control: 'text' },
    order: {
      control: 'select',
      options: ['value-first', 'label-first'],
      description: 'Which slot reads first. DOM order follows visual order.',
    },
    size: { control: 'select', options: ['lg', 'xl', '2xl'] },
    onColor: {
      control: { type: 'boolean' },
      description:
        'Swaps the text slots to `--bds-text-on-color-dark` for a Stat on a filled brand/dark surface.',
    },
    as: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Stat>;

/**
 * Value first, label under it — the stats-band shape.
 * @summary Value over its label, with a detail line
 */
export const Default: Story = {
  args: {
    value: '4.9',
    label: 'Average rating',
    detail: 'From 412 reviews',
    order: 'value-first',
    size: 'xl',
  },
};

/**
 * Label first, value under it — the dashboard tile shape (the same order
 * `Card layout="metric"` uses inside its bordered surface).
 * @summary Label over its value — dashboard shape
 */
export const LabelFirst: Story = {
  args: {
    value: '$12,480',
    label: 'Outstanding balance',
    detail: '3 invoices overdue',
    order: 'label-first',
    size: 'lg',
  },
};

/**
 * On a filled brand band — all three text slots switch to
 * `--bds-text-on-color-dark`.
 * @summary On a filled brand band — on-color text
 */
export const OnColor: Story = {
  args: { value: '24', label: 'Years in practice', onColor: true },
  render: (args) => (
    <div style={{ padding: 'var(--bds-padding-lg)', background: 'var(--bds-surface-brand-primary)' }}>
      <Stat {...args} />
    </div>
  ),
};

/**
 * Asserts DOM order follows visual order: with `order="label-first"` the
 * label is the first child, so a screen reader hears the pair in the same
 * order a sighted reader sees it.
 * @summary Interaction test — DOM order matches visual order
 */
export const InteractionTestOrder: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { value: '98%', label: 'On-time rate', order: 'label-first' },
  play: async ({ canvasElement }) => {
    const stat = canvasElement.querySelector('.bds-stat');
    await expect(stat).not.toBeNull();
    const [first, second] = [...(stat as HTMLElement).children];
    await expect(first).toHaveClass('bds-stat__label');
    await expect(second).toHaveClass('bds-stat__value');
  },
};
