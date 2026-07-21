import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Skeleton> = {
  title: 'Components/skeleton',
  component: Skeleton,
  tags: ['surface-shared'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
      description: 'Shape: `text` (line), `circular` (avatar/icon), or `rectangular` (image/card block).',
    },
    width: { control: 'text', description: 'CSS width value or number of px.' },
    height: { control: 'text', description: 'CSS height value or number of px.' },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

/* ─── Default ─────────────────────────────────────────────────── */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    variant: 'text',
    width: '200px',
  },
};
