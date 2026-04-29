import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

/**
 * Spinner — animated rotating loader for indeterminate progress. Two sizes:
 * `sm` (16px) for inline use, `lg` (48px) for full-container loading states.
 * @summary Animated rotating loader
 */
const meta: Meta<typeof Spinner> = {
  title: 'Components/Indicator/spinner',
  component: Spinner,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { size: 'sm' },
};

/** Small (16px) — inline use, button loading states.
 *  @summary Small spinner */
export const Small: Story = {
  args: { size: 'sm' },
};

/** Large (48px) — full-container loading, modal placeholders.
 *  @summary Large spinner */
export const Large: Story = {
  args: { size: 'lg' },
};
