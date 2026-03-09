import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stepper } from './Stepper';

const meta: Meta<typeof Stepper> = {
  title: 'Components/Control/stepper',
  component: Stepper,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState(1);
    return <Stepper {...args} value={value} onChange={setValue} />;
  },
  args: {
    min: 0,
    max: 10,
  },
};

export const Sizes: Story = {
  render: () => {
    const [sm, setSm] = useState(3);
    const [md, setMd] = useState(5);
    const [lg, setLg] = useState(7);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)', alignItems: 'center' }}>
        <Stepper value={sm} onChange={setSm} size="sm" min={0} max={10} />
        <Stepper value={md} onChange={setMd} size="md" min={0} max={10} />
        <Stepper value={lg} onChange={setLg} size="lg" min={0} max={10} />
      </div>
    );
  },
};

export const WithBounds: Story = {
  render: () => {
    const [value, setValue] = useState(1);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)', alignItems: 'center' }}>
        <Stepper value={value} onChange={setValue} min={1} max={5} />
        <span style={{
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--body-sm)',
          color: 'var(--text-secondary)',
        }}>
          Range: 1 — 5
        </span>
      </div>
    );
  },
};

export const CustomStep: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)', alignItems: 'center' }}>
        <Stepper value={value} onChange={setValue} step={5} min={0} max={100} size="lg" />
        <span style={{
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--body-sm)',
          color: 'var(--text-secondary)',
        }}>
          Step: 5
        </span>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => <Stepper value={3} onChange={() => {}} disabled />,
};
