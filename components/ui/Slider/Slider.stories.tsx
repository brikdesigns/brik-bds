import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './Slider';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Slider> = {
  title: 'Components/slider',
  component: Slider,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    label: { control: 'text', description: 'Optional label rendered above the track.' },
    value: {
      control: false,
      description: 'Current value (controlled). Pair with `onChange` — uncontrolled callers use `defaultValue`.',
    },
    defaultValue: { control: 'number', description: 'Default value (uncontrolled).' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '`sm` — 4px track, 16px thumb. `md` — 6px track, 20px thumb (default). `lg` — 8px track, 24px thumb.',
    },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    showValue: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onChange: { control: false, description: 'Change handler, called with the new numeric value.' },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   1. DEFAULT — args-driven sandbox. Controls work.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState(50);
    return (
      <div style={{ width: 320 }}>
        <Slider {...args} value={value} onChange={setValue} />
      </div>
    );
  },
  args: {
    label: 'Volume',
    showValue: true,
    min: 0,
    max: 100,
    size: 'md',
  },
};
