import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ProgressStepper, type ProgressStep } from './ProgressStepper';

const meta: Meta<typeof ProgressStepper> = {
  title: 'Navigation/Stepper/progress-stepper',
  component: ProgressStepper,
  tags: ['surface-product'],
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

/** @summary Default rendering */
export const Default: Story = {
  args: {
    steps: proposalSteps,
    activeStep: 1,
  },
};

/** @summary With descriptions */
export const WithDescriptions: Story = {
  args: {
    steps: onboardingSteps,
    activeStep: 1,
  },
};

/** @summary First step */
export const FirstStep: Story = {
  args: {
    steps: proposalSteps,
    activeStep: 0,
  },
};

/** @summary Last step */
export const LastStep: Story = {
  args: {
    steps: proposalSteps,
    activeStep: 2,
  },
};

/** @summary All complete */
export const AllComplete: Story = {
  args: {
    steps: proposalSteps,
    activeStep: 3,
  },
};

/** @summary Small size */
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
 * Compact horizontal dot indicator. Use on mobile, in carousels, or as a
 * minimal alternative when label text is redundant with the page heading.
 *
 * @summary Dots variant
 */
export const DotsVariant: Story = {
  args: {
    variant: 'dots',
    count: 5,
    activeStep: 2,
  },
};

/**
 * Dots variant honors the same `linear` mode as the steps variant —
 * only completed dots are clickable.
 */
export const DotsLinear = () => {
  const [active, setActive] = useState(2);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)', alignItems: 'center' }}>
      <ProgressStepper
        variant="dots"
        count={5}
        activeStep={active}
        linear
        onStepClick={setActive}
      />
      <p style={{ fontSize: 'var(--body-sm)', color: 'var(--text-muted)', margin: 0 }}>
        Step {active + 1} of 5 — only completed dots are clickable.
      </p>
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
