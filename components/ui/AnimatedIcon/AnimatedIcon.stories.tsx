import type { Meta, StoryObj } from '@storybook/react-vite';
import { AnimatedIcon } from './AnimatedIcon';
import fadeSquare from './_examples/fade-square.json';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof AnimatedIcon> = {
  title: 'Assets/animated-icon',
  component: AnimatedIcon,
  // no-visual: lottie canvases animate via JS — the visual gate's CSS freeze
  // can't pause them, so they never yield a stable screenshot (ADR-026).
  tags: ['surface-shared', 'no-visual'],
  parameters: { layout: 'centered' },
  argTypes: {
    src: {
      control: false,
      description:
        'The animation: parsed Lottie JSON, or a path/URL to fetch it from. Source from [useanimations.com](https://useanimations.com) or your app\'s `src/animations/` directory, then `import x from "@/animations/x.json"` and pass as `src={x}`. Stories ship a minimal fade-square example.',
    },
    size: {
      control: { type: 'number', min: 16, max: 128, step: 4 },
      description: 'Pixel size (width = height). 4-point grid increments.',
    },
    trigger: {
      control: 'inline-radio',
      options: ['loop', 'hover', 'click', 'once'],
      description:
        '`loop` autoplays continuously. `hover` plays while pointer is over the icon. `click` replays from the start on each click. `once` plays a single cycle on mount.',
    },
    loop: {
      control: 'boolean',
      description: 'Force loop on/off. When provided, overrides the trigger\'s default loop behavior (`loop` trigger loops; others play once).',
    },
    label: {
      control: 'text',
      description: 'Accessible label. When provided, the wrapping `<span>` gets `role="img"` + `aria-label`. Omit for purely decorative icons (renders `role="presentation"`).',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnimatedIcon>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 §3. Args-driven
   interactive AnimatedIcon. `trigger` is a Control (Q2) — at-rest
   snapshots are visually identical across trigger modes, so per
   ADR-010 the trigger axis lives in Controls, not separate stories.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Lottie wrapper — trigger, size, loop via Controls */
export const Default: Story = {
  args: {
    src: fadeSquare,
    size: 64,
    trigger: 'loop',
    label: 'Animated icon',
  },
};
