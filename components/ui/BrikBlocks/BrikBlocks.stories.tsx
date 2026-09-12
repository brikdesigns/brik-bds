import type { Meta, StoryObj } from '@storybook/react-vite';
import { BrikBlocks } from './BrikBlocks';

const meta: Meta<typeof BrikBlocks> = {
  title: 'Assets/brik-blocks',
  component: BrikBlocks,
  tags: ['surface-shared'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Decorative square-motif primitive — the "brik" mark from the /about redesign. 24×24px squares, 8px gap, tinted light/dark/poppy in the order given.',
      },
    },
  },
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
    cells: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof BrikBlocks>;

/** @summary Vertical 3-cell run, light/dark/light */
export const Default: Story = {
  args: { orientation: 'vertical', cells: ['light', 'dark', 'light'] },
};

/** @summary Vertical 3-cell run with a poppy accent cell */
export const VerticalWithPoppy: Story = {
  args: { orientation: 'vertical', cells: ['light', 'poppy', 'dark'] },
};

/** @summary Horizontal 3-cell run with a poppy accent cell */
export const HorizontalWithPoppy: Story = {
  args: { orientation: 'horizontal', cells: ['dark', 'poppy', 'light'] },
};

/** @summary A single poppy cell */
export const SinglePoppy: Story = {
  args: { cells: ['poppy'] },
};
