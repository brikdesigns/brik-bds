import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stepper } from './Stepper';

/**
 * Stepper — numeric input with increment/decrement buttons. Bounded by `min`/`max`,
 * stepped by `step`. Use for quantity pickers, item counts, and similar small
 * numeric controls. Not to be confused with `ProgressStepper` (multi-step wizard).
 * @summary Numeric input with +/- buttons
 */
const meta: Meta<typeof Stepper> = {
  title: 'Components/Control/stepper',
  component: Stepper,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-xl)', alignItems: 'center' }}>{children}</div>
);

/** Args-driven sandbox — wraps with `useState` so +/- works.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { min: 0, max: 10, size: 'md', value: 1, onChange: () => {} },
  render: (args) => {
    const Demo = () => {
      const [value, setValue] = useState(args.value ?? 1);
      return <Stepper {...args} value={value} onChange={setValue} />;
    };
    return <Demo />;
  },
};

/** All three sizes side-by-side. ADR-006 axis-gallery exception.
 *  @summary All sizes rendered together */
export const Sizes: Story = {
  args: { value: 1, onChange: () => {} },
  render: () => {
    const Demo = () => {
      const [sm, setSm] = useState(3);
      const [md, setMd] = useState(5);
      const [lg, setLg] = useState(7);
      return (
        <Row>
          <Stepper value={sm} onChange={setSm} size="sm" min={0} max={10} />
          <Stepper value={md} onChange={setMd} size="md" min={0} max={10} />
          <Stepper value={lg} onChange={setLg} size="lg" min={0} max={10} />
        </Row>
      );
    };
    return <Demo />;
  },
};

/** Bounded range — `min` and `max` constrain the value. The +/- buttons
 *  disable at the bounds.
 *  @summary Stepper with bounded range */
export const Bounded: Story = {
  args: { value: 1, min: 1, max: 5, onChange: () => {} },
  render: (args) => {
    const Demo = () => {
      const [value, setValue] = useState(args.value ?? 1);
      return <Stepper {...args} value={value} onChange={setValue} />;
    };
    return <Demo />;
  },
};

/** Custom step — `step` adjusts the increment.
 *  @summary Stepper with custom step */
export const CustomStep: Story = {
  args: { value: 50, min: 0, max: 500, step: 10, onChange: () => {} },
  render: (args) => {
    const Demo = () => {
      const [value, setValue] = useState(args.value ?? 50);
      return <Stepper {...args} value={value} onChange={setValue} />;
    };
    return <Demo />;
  },
};

/** Disabled — non-interactive.
 *  @summary Disabled stepper */
export const Disabled: Story = {
  args: { value: 3, disabled: true, onChange: () => {} },
};
