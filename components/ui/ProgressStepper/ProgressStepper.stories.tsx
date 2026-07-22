import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressStepper, type ProgressStep } from './ProgressStepper';

const meta: Meta<typeof ProgressStepper> = {
  title: 'Components/progress-stepper',
  component: ProgressStepper,
  tags: ['surface-product'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['steps', 'dots'],
      description: '`steps` (default) — vertical labeled list with numbered circles. `dots` — compact horizontal dot row.',
    },
    steps: {
      control: false,
      description: 'Step definitions (`label` + optional `description`) — `steps` variant only.',
    },
    count: {
      control: { type: 'number', min: 1 },
      description: 'Total number of dots — `dots` variant only.',
    },
    activeStep: {
      control: { type: 'number', min: 0 },
      description: 'Zero-indexed active step',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size variant',
    },
    linear: {
      control: 'boolean',
      description: 'When true, only completed steps are clickable — upcoming steps are muted and non-interactive.',
    },
    onStepClick: {
      action: 'stepClicked',
      description: 'Callback when a step is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressStepper>;

const onboardingSteps: ProgressStep[] = [
  { label: 'Account setup', description: 'Create your account and set a password' },
  { label: 'Company details', description: 'Tell us about your business' },
  { label: 'Service selection', description: 'Choose your services' },
  { label: 'Review & confirm', description: 'Review your selections' },
];

/* ─── Default ─────────────────────────────────────────────────── */

/** @summary Interactive labeled stepper — steps/activeStep via Controls */
export const Default: Story = {
  args: {
    steps: onboardingSteps,
    activeStep: 1,
  },
};

/* ─── Variants — one story per distinct semantic variant (Q3) ────── */

/**
 * `variant="dots"` swaps the labeled circles for a compact horizontal dot
 * row — no labels, `role="tablist"` instead of `role="list"`. Use for
 * mobile carousels and minimal flows.
 *
 * @summary Dots variant — compact horizontal dot row
 */
export const Dots: Story = {
  args: {
    variant: 'dots',
    count: 5,
    activeStep: 2,
  },
  argTypes: {
    steps: { table: { disable: true } },
  },
};

/* ─── Irreducible composition (Q4) ────────────────────────────── */

/**
 * `onStepClick` + component-owned `activeStep` state — the only way to show
 * real click-to-navigate behavior. Toggle `linear` via Controls to compare
 * free navigation against completed-steps-only navigation.
 *
 * @summary Controlled step navigation with Next/Previous
 */
export const WithStepNavigation: Story = {
  args: {
    steps: onboardingSteps,
    linear: true,
  },
  argTypes: {
    activeStep: { table: { disable: true } },
    variant: { table: { disable: true } },
    count: { table: { disable: true } },
  },
  render: (args) => {
    const steps = onboardingSteps;
    const [active, setActive] = useState(0);

    return (
      <div style={{ display: 'flex', gap: 'var(--space-1000)' }}>{/* bds-lint-ignore — 40px, no gap token */}
        <ProgressStepper
          steps={steps}
          size={args.size}
          linear={args.linear}
          activeStep={active}
          onStepClick={setActive}
          style={{ width: '260px' }}
        />
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 var(--gap-md)' }}>{steps[active]?.label ?? 'Complete'}</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 var(--gap-xl)' }}>
            {active < steps.length
              ? steps[active].description
              : 'All steps completed!'}
          </p>
          <div style={{ display: 'flex', gap: 'var(--gap-md)' }}>
            <button
              onClick={() => setActive(Math.max(0, active - 1))}
              disabled={active === 0}
            >
              Previous
            </button>
            <button
              onClick={() => setActive(Math.min(steps.length, active + 1))}
              disabled={active >= steps.length}
              style={{ backgroundColor: 'var(--background-brand-primary)', color: 'var(--text-inverse)', border: 'none', padding: 'var(--padding-tiny) var(--padding-md)', borderRadius: 'var(--border-radius-md)', cursor: 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  },
};
