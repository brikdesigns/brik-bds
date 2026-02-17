import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/progress-bar',
  component: ProgressBar,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value (0-100)',
    },
    label: {
      control: 'text',
      description: 'Accessible label for screen readers',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    value: 35,
    label: 'Progress',
  },
};

export const Empty: Story = {
  args: {
    value: 0,
    label: 'Not started',
  },
};

export const Half: Story = {
  args: {
    value: 50,
    label: 'Halfway complete',
  },
};

export const Complete: Story = {
  args: {
    value: 100,
    label: 'Complete',
  },
};

export const Animated: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [progress, setProgress] = useState(0);

useEffect(() => {
  const timer = setInterval(() => {
    setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
  }, 50);
  return () => clearInterval(timer);
}, []);

<ProgressBar value={progress} label="Loading" />`,
      },
    },
  },
  render: () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 50);
      return () => clearInterval(timer);
    }, []);

    return (
      <div style={{ width: '400px' }}>
        <ProgressBar value={progress} label="Loading" />
        <p
          style={{
            fontFamily: 'var(--_typography---font-family--body)',
            fontSize: 'var(--_typography---body--sm)',
            color: 'var(--_color---text--secondary)',
            marginTop: '8px',
          }}
        >
          {progress}%
        </p>
      </div>
    );
  },
};

export const Steps: Story = {
  parameters: {
    docs: {
      source: {
        code: `<p>Step 2 of 5</p>
<ProgressBar value={40} label="Step 2 of 5" />`,
      },
    },
  },
  render: () => {
    const steps = [
      { label: 'Account', complete: true },
      { label: 'Profile', complete: true },
      { label: 'Preferences', complete: false },
      { label: 'Review', complete: false },
      { label: 'Confirm', complete: false },
    ];
    const completedCount = steps.filter((s) => s.complete).length;
    const progress = (completedCount / steps.length) * 100;

    return (
      <div style={{ width: '400px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--_typography---font-family--body)',
            fontSize: 'var(--_typography---body--sm)',
            color: 'var(--_color---text--secondary)',
            marginBottom: '8px',
          }}
        >
          <span>
            Step {completedCount} of {steps.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <ProgressBar
          value={progress}
          label={`Step ${completedCount} of ${steps.length}`}
        />
      </div>
    );
  },
};
