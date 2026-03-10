import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ProgressStepper, type ProgressStep } from './ProgressStepper';

const meta: Meta<typeof ProgressStepper> = {
  title: 'Navigation/Stepper/progress-stepper',
  component: ProgressStepper,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ProgressStepper>;

const proposalSteps: ProgressStep[] = [
  { label: 'Scope of project' },
  { label: 'Project timeline' },
  { label: 'Fee summary' },
];

const onboardingSteps: ProgressStep[] = [
  { label: 'Account setup', description: 'Create your account and set a password' },
  { label: 'Company details', description: 'Tell us about your business' },
  { label: 'Service selection', description: 'Choose your services' },
  { label: 'Review & confirm', description: 'Review your selections' },
];

export const Default: Story = {
  args: {
    steps: proposalSteps,
    activeStep: 1,
  },
};

export const WithDescriptions: Story = {
  args: {
    steps: onboardingSteps,
    activeStep: 1,
  },
};

export const FirstStep: Story = {
  args: {
    steps: proposalSteps,
    activeStep: 0,
  },
};

export const LastStep: Story = {
  args: {
    steps: proposalSteps,
    activeStep: 2,
  },
};

export const AllComplete: Story = {
  args: {
    steps: proposalSteps,
    activeStep: 3,
  },
};

export const SmallSize: Story = {
  args: {
    steps: proposalSteps,
    activeStep: 1,
    size: 'sm',
  },
};

/**
 * Linear mode prevents skipping ahead. Only completed steps are clickable.
 * The user must advance via a primary CTA (Next button).
 */
export const LinearMode = () => {
  const [active, setActive] = useState(1);

  return (
    <div style={{ display: 'flex', gap: 'var(--space-1000)' }}>{/* bds-lint-ignore — 40px, no gap token */}
      <ProgressStepper
        steps={onboardingSteps}
        activeStep={active}
        linear
        onStepClick={setActive}
        style={{ width: '260px' }}
      />
      <div style={{ flex: 1 }}>
        <h2 style={{ margin: '0 0 var(--gap-md)' }}>{onboardingSteps[active]?.label ?? 'Complete'}</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 var(--gap-xs)' }}>
          {active < onboardingSteps.length
            ? onboardingSteps[active].description
            : 'All steps completed!'}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--body-sm)', margin: '0 0 var(--gap-xl)' }}>
          Try clicking an upcoming step — only completed steps are navigable.
        </p>
        <div style={{ display: 'flex', gap: 'var(--gap-md)' }}>
          <button
            onClick={() => setActive(Math.max(0, active - 1))}
            disabled={active === 0}
          >
            Previous
          </button>
          <button
            onClick={() => setActive(Math.min(onboardingSteps.length, active + 1))}
            disabled={active >= onboardingSteps.length}
            style={{ backgroundColor: 'var(--background-brand-primary)', color: 'var(--text-inverse)', border: 'none', padding: 'var(--padding-tiny) var(--padding-md)', borderRadius: 'var(--border-radius-md)', cursor: 'pointer' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Non-linear mode (default) allows free navigation to any step.
 */
export const Interactive = () => {
  const [active, setActive] = useState(0);

  return (
    <div style={{ display: 'flex', gap: 'var(--space-1000)' }}>{/* bds-lint-ignore — 40px, no gap token */}
      <ProgressStepper
        steps={onboardingSteps}
        activeStep={active}
        onStepClick={setActive}
        style={{ width: '260px' }}
      />
      <div style={{ flex: 1 }}>
        <h2 style={{ margin: '0 0 var(--gap-md)' }}>{onboardingSteps[active]?.label ?? 'Complete'}</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          {active < onboardingSteps.length
            ? onboardingSteps[active].description
            : 'All steps completed!'}
        </p>
        <div style={{ marginTop: 'var(--padding-lg)', display: 'flex', gap: 'var(--gap-md)' }}>
          <button
            onClick={() => setActive(Math.max(0, active - 1))}
            disabled={active === 0}
          >
            Previous
          </button>
          <button
            onClick={() => setActive(Math.min(onboardingSteps.length, active + 1))}
            disabled={active >= onboardingSteps.length}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
