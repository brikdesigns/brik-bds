import type { Meta, StoryObj } from '@storybook/react-vite';
import { AnimatedIcon } from './AnimatedIcon';
import fadeSquare from './_examples/fade-square.json';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof AnimatedIcon> = {
  title: 'Foundation/Assets/animated-icon',
  component: AnimatedIcon,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    animationData: {
      control: false,
      description:
        'Lottie JSON object. Source from [useanimations.com](https://useanimations.com) or your app\'s `src/animations/` directory, then `import x from "@/animations/x.json"` and pass as `animationData={x}`. Stories ship a minimal fade-square example.',
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

/** @summary Interactive Lottie wrapper — trigger, size, loop via Controls */
export const Default: Story = {
  args: {
    animationData: fadeSquare,
    size: 64,
    trigger: 'loop',
    label: 'Animated icon',
  },
};

/* ═══════════════════════════════════════════════════════════════
   SETUP — Q4 irreducible-render-mode story. Documents the Lottie
   sourcing workflow (where animation JSON comes from) because that
   convention isn't visible from the prop API alone. Mirrors the
   Icons.stories.tsx Setup pattern.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Sourcing Lottie animations + import flow */
export const Setup: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'AnimatedIcon is a wrapper — BDS does not ship a curated catalog of animations. Source them per project and import as JSON.',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-lg)',
        maxWidth: 640,
        fontFamily: 'var(--font-family-body)',
        color: 'var(--text-primary)',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'var(--font-family-label)',
            fontSize: 'var(--body-xs)' /* bds-lint-ignore */,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            marginBottom: 'var(--gap-sm)',
          }}
        >
          Step 1 — Source the animation
        </div>
        <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          Browse <a href="https://useanimations.com" target="_blank" rel="noopener noreferrer">useanimations.com</a> (free + premium tier),{' '}
          <a href="https://lottiefiles.com" target="_blank" rel="noopener noreferrer">lottiefiles.com</a> (community catalog), or your design team's
          After Effects → Bodymovin export. Download the Lottie JSON file (NOT the lottie player widget).
        </p>
      </div>

      <div>
        <div
          style={{
            fontFamily: 'var(--font-family-label)',
            fontSize: 'var(--body-xs)' /* bds-lint-ignore */,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            marginBottom: 'var(--gap-sm)',
          }}
        >
          Step 2 — Store and import
        </div>
        <p style={{ margin: 0, marginBottom: 'var(--gap-sm)', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          Save under your app's <code>src/animations/</code> directory. Vite + TypeScript resolve JSON imports natively.
        </p>
        <pre
          style={{
            margin: 0,
            padding: 'var(--padding-md)',
            background: 'var(--surface-secondary)',
            borderRadius: 'var(--border-radius-md)',
            fontFamily: 'var(--font-family-system, monospace)',
            fontSize: 'var(--body-sm)' /* bds-lint-ignore */,
            color: 'var(--text-primary)',
            overflow: 'auto',
          }}
        >{`import checkmark from '@/animations/checkmark.json';
import { AnimatedIcon } from '@brikdesigns/bds';

<AnimatedIcon
  animationData={checkmark}
  trigger="once"
  size={32}
  label="Completed"
/>`}</pre>
      </div>

      <div>
        <div
          style={{
            fontFamily: 'var(--font-family-label)',
            fontSize: 'var(--body-xs)' /* bds-lint-ignore */,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            marginBottom: 'var(--gap-sm)',
          }}
        >
          Step 3 — Pick a trigger
        </div>
        <ul style={{ margin: 0, paddingLeft: 'var(--padding-lg)', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          <li><code>loop</code> — continuous decorative motion (page-corner icons, loading states paired with Spinner)</li>
          <li><code>hover</code> — discoverable interaction hint (nav-item icons, card hover states)</li>
          <li><code>click</code> — feedback on activation (button confirmation, toggle response)</li>
          <li><code>once</code> — entrance moment on mount (toast appearance, empty-state illustration)</li>
        </ul>
      </div>

      <div
        style={{
          padding: 'var(--padding-md)',
          background: 'var(--surface-secondary)',
          borderRadius: 'var(--border-radius-md)',
          color: 'var(--text-secondary)',
          fontSize: 'var(--body-sm)' /* bds-lint-ignore */,
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: 'var(--text-primary)' }}>Note:</strong>{' '}
        <code>lottie-react</code> respects <code>prefers-reduced-motion</code> when <code>autoplay</code> is{' '}
        <code>false</code>. AnimatedIcon sets autoplay only for <code>loop</code> + <code>once</code> triggers;
        <code>hover</code> + <code>click</code> are user-initiated, so motion-sensitive users hit them deliberately.
      </div>
    </div>
  ),
};
