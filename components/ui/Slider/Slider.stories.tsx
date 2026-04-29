import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './Slider';

/**
 * Slider — controlled numeric range input with optional value display.
 * Three sizes (`sm`/`md`/`lg`); `showValue` toggles the inline value readout.
 * @summary Numeric range slider with size variants
 */
const meta: Meta<typeof Slider> = {
  title: 'Components/Control/slider',
  component: Slider,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    showValue: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Args-driven sandbox — wraps with `useState` so dragging works.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    label: 'Volume',
    showValue: true,
    min: 0,
    max: 100,
    size: 'md',
    value: 50,
  },
  render: (args) => {
    const Demo = () => {
      const [value, setValue] = useState(args.value ?? 50);
      return <Slider {...args} value={value} onChange={setValue} />;
    };
    return <Demo />;
  },
};

/** All three sizes side-by-side. ADR-006 axis-gallery exception.
 *  @summary All sizes rendered together */
export const Sizes: Story = {
  args: { label: 'Sizes' },
  render: () => {
    const Demo = () => {
      const [sm, setSm] = useState(30);
      const [md, setMd] = useState(50);
      const [lg, setLg] = useState(70);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
          <Slider label="Small" size="sm" value={sm} onChange={setSm} showValue />
          <Slider label="Medium" size="md" value={md} onChange={setMd} showValue />
          <Slider label="Large" size="lg" value={lg} onChange={setLg} showValue />
        </div>
      );
    };
    return <Demo />;
  },
};

/** Custom range — `min`, `max`, `step` configure the value domain.
 *  @summary Slider with custom range and step */
export const CustomRange: Story = {
  args: { label: 'Price range', min: 10, max: 200, step: 5, showValue: true, value: 25 },
  render: (args) => {
    const Demo = () => {
      const [value, setValue] = useState(args.value ?? 25);
      return <Slider {...args} value={value} onChange={setValue} />;
    };
    return <Demo />;
  },
};

/** Disabled — non-interactive. Value still displays.
 *  @summary Disabled slider */
export const Disabled: Story = {
  args: { label: 'Disabled', value: 40, disabled: true, showValue: true },
};
