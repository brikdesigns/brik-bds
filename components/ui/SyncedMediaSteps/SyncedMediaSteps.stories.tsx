import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect } from 'storybook/test';
import { SyncedMediaSteps } from './SyncedMediaSteps';

/* ─── Fixture ─────────────────────────────────────────────────── */

/** Flat token-coloured panel — stands in for real media without a network fetch. */
const MediaPlaceholder = ({ label, hue }: { label: string; hue: string }) => (
  <div
    style={{
      display: 'grid',
      placeItems: 'center',
      background: hue,
      fontFamily: 'var(--font-family-label)',
      fontSize: 'var(--label-lg)',
      fontWeight: 'var(--font-weight-semibold)',
      color: 'var(--text-primary)',
    }}
  >
    {label}
  </div>
);

const steps = [
  {
    id: 'scope',
    title: 'Scope the work',
    description:
      'We map the surfaces, name the constraints, and agree what ships in the first release before anyone opens an editor.',
    media: <MediaPlaceholder label="Scope" hue="var(--surface-secondary)" />,
  },
  {
    id: 'design',
    title: 'Design the system',
    description:
      'Tokens, then components, then pages — so the second page costs a fraction of the first.',
    media: <MediaPlaceholder label="Design" hue="var(--surface-muted)" />,
  },
  {
    id: 'build',
    title: 'Build and hand over',
    description:
      'Shipped on your stack, with the design system documented so your team can extend it without us.',
    media: <MediaPlaceholder label="Build" hue="var(--surface-accent)" />,
  },
];

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof SyncedMediaSteps> = {
  title: 'Containers/synced-media-steps',
  component: SyncedMediaSteps,
  tags: ['surface-shared'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    steps: {
      control: false,
      description:
        'Ordered steps — each supplies its own `id`, `title`, optional `description`, and `media`.',
    },
    activeStep: {
      control: false,
      description: 'Controlled active step id. Pair with `onActiveStepChange`.',
    },
    onActiveStepChange: {
      control: false,
      description: 'Called with the next step id on click or auto-advance.',
    },
    defaultActiveStep: {
      control: 'text',
      description: 'Initial active step id when uncontrolled. Defaults to the first step.',
    },
    autoplay: {
      control: 'boolean',
      description: 'Auto-advance while in view. Always off under `prefers-reduced-motion: reduce`.',
    },
    interval: {
      control: 'text',
      description:
        'Dwell time per step — CSS duration; number is treated as ms. Overrides `--bds-synced-media-steps-interval`.',
    },
    pauseOnHover: {
      control: 'boolean',
      description: 'Pause auto-advance on pointer hover. Focus always pauses.',
    },
    mediaPosition: {
      control: 'inline-radio',
      options: ['start', 'end'],
      description: 'Which side the media panel sits on.',
    },
    showStepNumbers: {
      control: 'boolean',
      description: 'Render the 1-based step number ahead of each title.',
    },
    showCountdown: {
      control: 'boolean',
      description:
        'Show the per-step countdown dwell cue on the active step. The advance timer is unaffected.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SyncedMediaSteps>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. Controls work.

   Single-appearance component (ADR-010 matrix): `mediaPosition` is a
   listed placement axis (Rule 5 — Control + MDX demo, never a story),
   `autoplay` / `pauseOnHover` / `showStepNumbers` / `showCountdown` are
   boolean toggles (Q2 — Controls only), `interval` and `defaultActiveStep` are tuning
   values rather than semantic starting points, and reduced motion is a
   toolbar-global axis (Q1). No value clears the Q3 bar, so this file
   ships `Default` plus one Q5 interaction test.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    steps,
    autoplay: true,
    pauseOnHover: true,
    mediaPosition: 'end',
    showStepNumbers: true,
    showCountdown: true,
  },
};

/* ═══════════════════════════════════════════════════════════════
   Q5 — interaction assertions. Out of MCP discovery and the sidebar.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Asserts the click-to-override contract and the accordion ARIA wiring:
 * real `<button>` triggers, `aria-expanded` tracking the active step, and
 * `onActiveStepChange` firing with the clicked id.
 *
 * @summary Click selects a step and reports the change
 */
export const InteractionTestStepSelection: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    steps,
    // Autoplay off so the assertions race nothing.
    autoplay: false,
    onActiveStepChange: fn(),
  },
  play: async ({ canvas, args }) => {
    const first = canvas.getByRole('button', { name: /Scope the work/ });
    const third = canvas.getByRole('button', { name: /Build and hand over/ });

    // First step is active on mount.
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(third).toHaveAttribute('aria-expanded', 'false');

    third.click();

    await expect(args.onActiveStepChange).toHaveBeenCalledWith('build');
    await expect(third).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
  },
};
