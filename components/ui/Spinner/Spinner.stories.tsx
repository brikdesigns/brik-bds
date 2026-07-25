import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/spinner',
  component: Spinner,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'lg'],
      description: 'Diameter: `sm` (16px — inline / button loading) or `lg` (48px — container / full-page).',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: { size: 'sm' },
};
