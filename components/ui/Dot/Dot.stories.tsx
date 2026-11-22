import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dot } from './Dot';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Dot> = {
  title: 'Components/dot',
  component: Dot,
  tags: ['surface-shared'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['positive', 'warning', 'negative', 'info', 'neutral'],
      description: 'Valence: `positive` green, `warning` yellow, `negative` red, `info` blue, `neutral` gray.',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    pulse: {
      control: 'boolean',
      description: 'Pulse animation — use for active/running states.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dot>;

/* ─── Default ─────────────────────────────────────────────────── */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    tone: 'neutral',
    size: 'md',
  },
};
