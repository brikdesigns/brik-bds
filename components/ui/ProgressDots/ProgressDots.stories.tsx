import React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressDots } from './ProgressDots';
import { Button } from '../Button';

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
  <div style={{ display: 'flex', flexDirection: 'column', gap, alignItems: 'center' }}>{children}</div>
);

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof ProgressDots> = {
  title: 'Navigation/Stepper/progress-dots',
  component: ProgressDots,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ProgressDots>;

export default meta;
type Story = StoryObj<typeof ProgressDots>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    count: 4,
    activeStep: 1,
    size: 'md',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, step positions, linear mode
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Sizes</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <ProgressDots count={5} activeStep={2} size="sm" />
          <ProgressDots count={5} activeStep={2} size="md" />
        </Stack>
      </div>

      <div>
        <SectionLabel>Step positions</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <ProgressDots count={4} activeStep={0} />
          <ProgressDots count={4} activeStep={1} />
          <ProgressDots count={4} activeStep={2} />
          <ProgressDots count={4} activeStep={3} />
        </Stack>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Interactive wizard + linear mode
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => {
    function DotsPatterns() {
      const [freeStep, setFreeStep] = useState(0);
      const [linearStep, setLinearStep] = useState(2);
      const count = 5;

      return (
        <Stack>
          <div>
            <SectionLabel>Interactive wizard</SectionLabel>
            <Stack gap="var(--gap-md)">
              <ProgressDots
                count={count}
                activeStep={freeStep}
                onDotClick={setFreeStep}
              />
              <div style={{ display: 'flex', gap: 'var(--gap-md)' }}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFreeStep(Math.max(0, freeStep - 1))}
                  disabled={freeStep === 0}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  onClick={() => setFreeStep(Math.min(count - 1, freeStep + 1))}
                  disabled={freeStep >= count - 1}
                >
                  Next
                </Button>
              </div>
            </Stack>
          </div>

          <div>
            <SectionLabel>Linear mode (back only)</SectionLabel>
            <Stack gap="var(--gap-md)">
              <ProgressDots
                count={4}
                activeStep={linearStep}
                linear
                onDotClick={setLinearStep}
              />
              <p style={{
                fontSize: 'var(--body-sm)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-family-body)',
              }}>
                Step {linearStep + 1} of 4 — can only go back
              </p>
            </Stack>
          </div>
        </Stack>
      );
    }
    return <DotsPatterns />;
  },
};
