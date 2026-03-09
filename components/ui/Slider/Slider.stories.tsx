import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './Slider';

const meta: Meta<typeof Slider> = {
  title: 'Components/Control/slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

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
  },
};

export const Sizes: Story = {
  render: () => {
    const [sm, setSm] = useState(30);
    const [md, setMd] = useState(50);
    const [lg, setLg] = useState(70);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', width: 320 }}>
        <Slider label="Small" size="sm" value={sm} onChange={setSm} showValue />
        <Slider label="Medium" size="md" value={md} onChange={setMd} showValue />
        <Slider label="Large" size="lg" value={lg} onChange={setLg} showValue />
      </div>
    );
  },
};

export const CustomRange: Story = {
  render: () => {
    const [value, setValue] = useState(25);
    return (
      <div style={{ width: 320 }}>
        <Slider
          label="Price range"
          value={value}
          onChange={setValue}
          min={10}
          max={200}
          step={5}
          showValue
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Slider label="Disabled" value={40} disabled showValue />
    </div>
  ),
};
