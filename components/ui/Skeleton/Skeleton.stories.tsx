import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

/**
 * Skeleton — animated placeholder for loading content. Three shape variants:
 * `text`, `circular`, `rectangular`.
 * @summary Loading placeholder with shape variants
 */
const meta: Meta<typeof Skeleton> = {
  title: 'Components/Indicator/skeleton',
  component: Skeleton,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['text', 'circular', 'rectangular'] },
    width: { control: 'text' },
    height: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { variant: 'text', width: '200px' },
};

/** Text variant — a single line. Pair multiple lines for paragraph placeholders.
 *  @summary Text skeleton */
export const Text: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)', maxWidth: '400px' }}>
      <Skeleton variant="text" />
      <Skeleton variant="text" width="85%" />
      <Skeleton variant="text" width="70%" />
    </div>
  ),
};

/** Circular variant — for avatar placeholders.
 *  @summary Circular skeleton */
export const Circular: Story = {
  args: { variant: 'circular', width: 48, height: 48 },
};

/** Rectangular variant — for image, card, or block placeholders.
 *  @summary Rectangular skeleton */
export const Rectangular: Story = {
  args: { variant: 'rectangular', width: '300px', height: '180px' },
};
