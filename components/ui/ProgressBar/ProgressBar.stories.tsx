import React from 'react';
import { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './ProgressBar';

/* ─── Layout Helpers (story-only) ─────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{
    fontFamily: 'var(--font-family-label)',
    fontSize: 'var(--body-xs)', // bds-lint-ignore
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 'var(--gap-md)',
    color: 'var(--text-muted)',
  }}>
    {children}
  </div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/Feedback/progress-bar',
  component: ProgressBar,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    value: 35,
    label: 'Progress',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Empty, partial, complete
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Empty (0%)</SectionLabel>
        <ProgressBar value={0} label="Not started" />
      </div>
      <div>
        <SectionLabel>Partial (35%)</SectionLabel>
        <ProgressBar value={35} label="In progress" />
      </div>
      <div>
        <SectionLabel>Half (50%)</SectionLabel>
        <ProgressBar value={50} label="Halfway" />
      </div>
      <div>
        <SectionLabel>Complete (100%)</SectionLabel>
        <ProgressBar value={100} label="Complete" />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Animated loading + step progress
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => {
    function ProgressPatterns() {
      const [progress, setProgress] = useState(0);

      useEffect(() => {
        const timer = setInterval(() => {
          setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
        }, 50);
        return () => clearInterval(timer);
      }, []);

      const steps = [
        { label: 'Account', complete: true },
        { label: 'Profile', complete: true },
        { label: 'Preferences', complete: false },
        { label: 'Review', complete: false },
        { label: 'Confirm', complete: false },
      ];
      const completedCount = steps.filter((s) => s.complete).length;
      const stepProgress = (completedCount / steps.length) * 100;

      return (
        <Stack>
          <div>
            <SectionLabel>Animated loading</SectionLabel>
            <ProgressBar value={progress} label="Loading" />
            <p style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--body-sm)',
              color: 'var(--text-secondary)',
              marginTop: 'var(--gap-md)',
            }}>
              {progress}%
            </p>
          </div>

          <div>
            <SectionLabel>Multi-step form</SectionLabel>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--body-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--gap-md)',
            }}>
              <span>Step {completedCount} of {steps.length}</span>
              <span>{Math.round(stepProgress)}%</span>
            </div>
            <ProgressBar value={stepProgress} label={`Step ${completedCount} of ${steps.length}`} />
          </div>
        </Stack>
      );
    }
    return <ProgressPatterns />;
  },
};
