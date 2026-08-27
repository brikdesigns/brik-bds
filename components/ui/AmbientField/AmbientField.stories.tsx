import type { Meta, StoryObj } from '@storybook/react-vite';
import { ZIndexMediaBand } from '../ZIndexMediaBand';
import { AmbientField } from './AmbientField';
import driftField from './_examples/drift-field.json';

/* ─── Fixtures ────────────────────────────────────────────────── */

/**
 * Full-bleed wrapper. The preview decorator centers every canvas story in a
 * flex container ([preview.tsx](../../../.storybook/preview.tsx) `withTheme`),
 * so a band left bare shrinks to fit-content and stops reading as a page band.
 */
const FullWidth = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '100%' }}>{children}</div>
);

/** Section body, so the field is judged the way it ships — behind content. */
const BandContent = ({ label = 'How we work' }: { label?: string }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--gap-md)',
      padding: 'var(--space-2400) var(--space-800)',
      textAlign: 'center',
    }}
  >
    <h2
      style={{
        margin: 0,
        fontFamily: 'var(--font-family-heading)',
        fontSize: 'var(--heading-lg)',
        color: 'var(--text-primary)',
      }}
    >
      {label}
    </h2>
    <p
      style={{
        margin: 0,
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--body-md)',
        color: 'var(--text-secondary)',
      }}
    >
      The field drifts behind this text and never competes with it.
    </p>
  </div>
);

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof AmbientField> = {
  title: 'Containers/ambient-field',
  component: AmbientField,
  // no-visual: every story here is JS-driven motion — a looping Lottie or a
  // rAF particle field — which is the exact case the visual gate carves out
  // (.storybook/vitest.visual.setup.ts:75). Its freeze CSS sets
  // `animation-play-state: paused`, which cannot stop lottie-web or a canvas
  // loop, so `toMatchScreenshot`'s stable-frame detection chases moving pixels
  // until it times out. Confirmed on PR #2085 before the tag: all four stories
  // failed with "Matcher did not succeed in time".
  //
  // The behaviour that actually matters here is asserted instead of
  // photographed — AmbientField.reduced-motion.browser.test.ts checks the
  // poster frame on painted pixels, which is stronger than a baseline would be.
  tags: ['surface-shared', 'no-visual'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Premium-tier ambient motion field: the decorative layer only (`absolute; inset: 0; z-index: 1`, `aria-hidden`, non-interactive). Slots into `ZIndexMediaBand`’s `graphic`, which owns the stacking context. Under `prefers-reduced-motion: reduce` it freezes to a static poster frame rather than disappearing — Lottie holds frame 0, the canvas paints once and schedules no rAF.',
      },
    },
  },
  argTypes: {
    src: {
      control: false,
      description:
        'Lottie source (`mode="lottie"`). Omit to fall back to `--bds-bg-field-src`, the per-client swap path.',
    },
    mode: {
      control: 'inline-radio',
      options: ['lottie', 'canvas'],
      description:
        'How the field is drawn. `canvas` is only worth its cost when the brief needs a physical feel.',
    },
    particleCount: {
      control: { type: 'range', min: 8, max: 160, step: 8 },
      description: 'Particle count for `mode="canvas"`. Cost is linear.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AmbientField>;

/* ═══════════════════════════════════════════════════════════════
   Default is the args-driven sandbox; `mode` and `particleCount` are
   listed axes, so they read as Controls there (ADR-010 matrix Q2).
   The rest are irreducible renders (Q4): Canvas needs its own dwell to
   show drift, SrcFromToken needs a theme-level custom-property override
   with the prop left off, and Tinted needs a second token set. Theme is
   a toolbar global (Q1), so light/dark is exercised by the theme
   switcher rather than duplicated per story.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    mode: 'lottie',
    src: driftField,
    particleCount: 48,
  },
  render: (args) => (
    <FullWidth>
      <ZIndexMediaBand as="section" graphic={<AmbientField {...args} />}>
        <BandContent />
      </ZIndexMediaBand>
    </FullWidth>
  ),
};

/** @summary 2D-canvas particle field for a physical feel */
export const Canvas: Story = {
  args: { mode: 'canvas', particleCount: 64 },
  render: (args) => (
    <FullWidth>
      <ZIndexMediaBand as="section" graphic={<AmbientField {...args} />}>
        <BandContent label="Particle field" />
      </ZIndexMediaBand>
    </FullWidth>
  ),
};

/** @summary Field sourced from a client theme token, `src` prop left off */
export const SrcFromToken: Story = {
  args: { mode: 'lottie' },
  render: (args) => (
    <FullWidth>
      <ZIndexMediaBand
        as="section"
        graphic={
          <AmbientField
            {...args}
            style={
              {
                // The per-client swap path: a theme sets this custom property
                // and every field on the page picks up that client's loop.
                // A data: URL stands in for the client-hosted file a real theme
                // would point at.
                '--bds-bg-field-src': `url("data:application/json;base64,${btoa(
                  JSON.stringify(driftField),
                )}")`,
              } as React.CSSProperties
            }
          />
        }
      >
        <BandContent label="Themed field" />
      </ZIndexMediaBand>
    </FullWidth>
  ),
};

/** @summary Tint wash holding contrast for the content above it */
export const Tinted: Story = {
  args: { mode: 'lottie', src: driftField },
  render: (args) => (
    <FullWidth>
      <ZIndexMediaBand
        as="section"
        graphic={
          <AmbientField
            {...args}
            style={
              {
                // Theme-correct wash: the page surface, made translucent.
                // An OPAQUE tint would hide the field completely rather than
                // hold contrast over it — the value has to carry alpha.
                '--bds-bg-field-tint':
                  'color-mix(in srgb, var(--surface-primary) 65%, transparent)',
                '--bds-bg-field-opacity': '0.85',
              } as React.CSSProperties
            }
          />
        }
      >
        <BandContent label="Tinted field" />
      </ZIndexMediaBand>
    </FullWidth>
  ),
};
