import { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './ProgressBar';

/**
 * ProgressBar — linear progress indicator from 0-100. Rendered with
 * `role="progressbar"` for assistive tech.
 * @summary Linear progress indicator (0-100)
 */
const meta: Meta<typeof ProgressBar> = {
  title: 'Components/Feedback/progress-bar',
  component: ProgressBar,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

/** Args-driven sandbox. Use the value range slider to scrub progress.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    value: 35,
    label: 'Progress',
  },
};

/** Empty state (0%). Confirms the bar renders with no fill.
 *  @summary Empty progress bar */
export const Empty: Story = {
  args: { value: 0, label: 'Not started' },
};

/** Complete state (100%). Confirms the bar fills to its track.
 *  @summary Completed progress bar */
export const Complete: Story = {
  args: { value: 100, label: 'Complete' },
};

/** Animated progress — uses `useEffect` to drive the value, so `render` is required.
 *  Demonstrates the bar handling continuous updates without re-mount jitter.
 *  @summary Animated 0-100 loop */
export const Animated: Story = {
  render: () => {
    const Animator = () => {
      const [progress, setProgress] = useState(0);
      useEffect(() => {
        const timer = setInterval(() => {
          setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
        }, 50);
        return () => clearInterval(timer);
      }, []);
      return <ProgressBar value={progress} label="Loading" />;
    };
    return <Animator />;
  },
};
