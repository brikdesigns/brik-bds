import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ProgressDots } from './ProgressDots';

const meta: Meta<typeof ProgressDots> = {
  title: 'Navigation/Stepper/progress-dots',
  component: ProgressDots,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ProgressDots>;

export const Default: Story = {
  args: {
    count: 4,
    activeStep: 1,
  },
};

export const FirstStep: Story = {
  args: {
    count: 3,
    activeStep: 0,
  },
};

export const LastStep: Story = {
  args: {
    count: 3,
    activeStep: 2,
  },
};

export const SmallSize: Story = {
  args: {
    count: 5,
    activeStep: 2,
    size: 'sm',
  },
};

export const LinearMode: Story = {
  args: {
    count: 4,
    activeStep: 2,
    linear: true,
  },
  render: (args) => {
    const [active, setActive] = useState(args.activeStep);
    return (
      <div>
        <ProgressDots
          {...args}
          activeStep={active}
          onDotClick={setActive}
        />
        <p style={{ textAlign: 'center', marginTop: 'var(--gap-lg)', fontSize: 'var(--body-sm)', color: 'var(--text-secondary)' }}>
          Step {active + 1} of {args.count} — can only go back
        </p>
      </div>
    );
  },
};

export const Interactive = () => {
  const [active, setActive] = useState(0);
  const count = 4;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--gap-xl)' }}>
      <ProgressDots
        count={count}
        activeStep={active}
        onDotClick={setActive}
      />
      <div style={{ display: 'flex', gap: 'var(--gap-md)' }}>
        <button onClick={() => setActive(Math.max(0, active - 1))} disabled={active === 0}>
          Previous
        </button>
        <button onClick={() => setActive(Math.min(count - 1, active + 1))} disabled={active >= count - 1}>
          Next
        </button>
      </div>
    </div>
  );
};
