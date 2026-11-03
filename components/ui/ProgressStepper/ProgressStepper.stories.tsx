import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { ProgressStepper, type ProgressStep } from './ProgressStepper';
import { Button } from '../Button';

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
      description: '`steps` (default) — labeled list with numbered circles. `dots` — compact horizontal dot row.',
    },
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      description: 'Layout of the `steps` variant — `vertical` (default, sidebars) or `horizontal` (wizard headers). `steps` variant only.',
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

const wizardSteps: ProgressStep[] = [
  { label: 'Details' },
  { label: 'Services' },
  { label: 'Review' },
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
      <div style={{ display: 'flex', gap: 'var(--bds-space-1000)' }}>{/* bds-lint-ignore — 40px, no gap token */}
        <ProgressStepper
          steps={steps}
          size={args.size}
          linear={args.linear}
          activeStep={active}
          onStepClick={setActive}
          style={{ width: '260px' }}
        />
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 var(--bds-gap-md)' }}>{steps[active]?.label ?? 'Complete'}</h2>
          <p style={{ color: 'var(--bds-text-secondary)', margin: '0 0 var(--bds-gap-xl)' }}>
            {active < steps.length
              ? steps[active].description
              : 'All steps completed!'}
          </p>
          <div style={{ display: 'flex', gap: 'var(--bds-gap-md)' }}>
            <Button
              variant="secondary"
              onClick={() => setActive(Math.max(0, active - 1))}
              disabled={active === 0}
            >
              Previous
            </Button>
            <Button
              variant="primary"
              onClick={() => setActive(Math.min(steps.length, active + 1))}
              disabled={active >= steps.length}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  },
};

/**
 * `orientation="horizontal"` above full-width content — the wizard-header
 * layout: numbered circles, a check on complete steps, connector lines between
 * steps, labels beside the circles. Same `activeStep` / `linear` /
 * `onStepClick` model as vertical. Scrolls inside its own container on narrow
 * viewports.
 *
 * @summary Horizontal 3-step wizard header with Back/Continue
 */
export const WizardHeader: Story = {
  args: {
    linear: true,
  },
  argTypes: {
    activeStep: { table: { disable: true } },
    variant: { table: { disable: true } },
    orientation: { table: { disable: true } },
    count: { table: { disable: true } },
  },
  render: (args) => {
    const [active, setActive] = useState(0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bds-gap-xl)', width: 'min(40rem, 90vw)' }}>
        <ProgressStepper
          steps={wizardSteps}
          orientation="horizontal"
          size={args.size}
          linear={args.linear}
          activeStep={active}
          onStepClick={setActive}
        />
        <div>
          <h2 style={{ margin: '0 0 var(--bds-gap-md)' }}>{wizardSteps[active]?.label ?? 'Complete'}</h2>
          <div style={{ display: 'flex', gap: 'var(--bds-gap-md)' }}>
            <Button
              variant="secondary"
              onClick={() => setActive(Math.max(0, active - 1))}
              disabled={active === 0}
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={() => setActive(Math.min(wizardSteps.length, active + 1))}
              disabled={active >= wizardSteps.length}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   INTERACTION TEST — play-only, hidden from MCP discovery
   ═══════════════════════════════════════════════════════════════ */

/**
 * Each clickable step is a hand-rolled `role="button"` div whose `onKeyDown`
 * fires `onStepClick` on Enter/Space — there is no native button, so keyboard
 * operability lives entirely in that handler. Assert it so the path can't
 * silently regress (WCAG 2.1.1). `activeStep={2}` makes step 1 complete →
 * clickable.
 * @summary Enter on a step fires onStepClick
 */
export const InteractionTestKeyboardActivation: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    steps: onboardingSteps,
    activeStep: 2,
    onStepClick: fn(),
  },
  play: async ({ args, canvas }) => {
    const step = canvas.getByRole('button', { name: 'Go to step 1: Account setup' });
    step.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onStepClick).toHaveBeenCalledWith(0);
  },
};

/**
 * The horizontal layout must behave like vertical: `aria-current="step"` on
 * the active step, completed steps are keyboard-operable buttons that fire
 * `onStepClick`, and in `linear` mode upcoming steps are not.
 * @summary Horizontal steps — aria-current, click-back, linear lock
 */
export const InteractionTestHorizontalNavigation: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    steps: wizardSteps,
    orientation: 'horizontal',
    activeStep: 1,
    linear: true,
    onStepClick: fn(),
  },
  play: async ({ args, canvas }) => {
    await expect(canvas.getByRole('list')).toHaveClass('bds-progress-stepper--orientation-horizontal');
    const items = canvas.getAllByRole('listitem');
    await expect(items[1]).toHaveAttribute('aria-current', 'step');
    await expect(items[0]).not.toHaveAttribute('aria-current');

    await expect(canvas.queryByRole('button', { name: /Go to step 3/ })).toBeNull();

    const back = canvas.getByRole('button', { name: 'Go to step 1: Details' });
    back.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onStepClick).toHaveBeenCalledWith(0);
  },
};
