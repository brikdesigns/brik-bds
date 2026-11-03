import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Foundation/On-Color',
  tags: ['surface-shared'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The on-color family over fills it does not own — brand fills, dark sections, photos. Each solid step (`--bds-text-on-color-*`, `--bds-border-on-color-*`) has one muted step composed from it with `color-mix()` (ADR-046): muted text at 70%, hairlines at 12%. Muted text is not for the brand fill — white is already 3.78:1 there, so use solid white.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/* ─── Deterministic photo stand-in (story-only) ──────────────────
   The repo carries no photography, and the visual gate must not hit the
   network. An inline SVG with light and dark regions gives the property
   that matters for a translucent step: the luminance under it varies. */

const PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5a6a"/><stop offset="1" stop-color="#1c2129"/></linearGradient><radialGradient id="g" cx="0.8" cy="0.2" r="0.6"><stop offset="0" stop-color="#8a7a5c"/><stop offset="1" stop-color="#8a7a5c" stop-opacity="0"/></radialGradient></defs><rect width="480" height="320" fill="url(#s)"/><rect width="480" height="320" fill="url(#g)"/><path d="M0 250 L120 190 L220 230 L340 170 L480 220 L480 320 L0 320 Z" fill="#14181d"/></svg>`,
)}`;

/* ─── Helpers ─────────────────────────────────────────────────── */

type Family = 'dark' | 'light';

const Sample = ({ family }: { family: Family }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bds-gap-sm)' }}>
    <p
      style={{
        margin: 0,
        fontFamily: 'var(--bds-font-family-heading)',
        fontSize: 'var(--bds-heading-sm)',
        color: `var(--bds-text-on-color-${family})`,
      }}
    >
      Solid on-color heading
    </p>
    <hr
      style={{
        margin: 0,
        border: 0,
        borderTop: `1px solid var(--bds-border-on-color-${family}-muted)`,
      }}
    />
    <p
      data-step={`text-on-color-${family}-muted`}
      style={{
        margin: 0,
        fontFamily: 'var(--bds-font-family-body)',
        fontSize: 'var(--bds-body-sm)',
        color: `var(--bds-text-on-color-${family}-muted)`,
      }}
    >
      Muted on-color body copy — the secondary line under a heading.
    </p>
    <div
      data-step={`border-on-color-${family}-muted`}
      style={{
        border: `1px solid var(--bds-border-on-color-${family}-muted)`,
        borderRadius: 'var(--bds-border-radius-md)',
        padding: 'var(--bds-padding-sm)',
        fontFamily: 'var(--bds-font-family-body)',
        fontSize: 'var(--bds-body-sm)',
        color: `var(--bds-text-on-color-${family})`,
      }}
    >
      Hairline-bordered box
    </div>
  </div>
);

const Panel = ({
  label,
  background,
  children,
}: {
  label: string;
  background: string;
  children: React.ReactNode;
}) => (
  <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--bds-gap-xs)' }}>
    <div
      style={{
        background,
        backgroundSize: 'cover',
        borderRadius: 'var(--bds-border-radius-md)',
        padding: 'var(--bds-padding-lg)',
        minHeight: 200,
      }}
    >
      {children}
    </div>
    <figcaption
      style={{
        fontFamily: 'var(--bds-font-family-body)',
        fontSize: 'var(--bds-body-xs)',
        color: 'var(--bds-text-secondary)',
      }}
    >
      {label}
    </figcaption>
  </figure>
);

/* ─── Stories ─────────────────────────────────────────────────── */

/**
 * Each muted step over a brand fill, a dark surface, a photo and a light tint.
 * @summary Muted on-color steps over four backdrops
 */
export const OverBackdrops: Story = {
  render: () => (
    <div
      style={{
        padding: 'var(--bds-padding-xl)',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 'var(--bds-gap-lg)',
      }}
    >
      <Panel
        label="Brand fill — hairline only; body copy stays solid white (ADR-015)"
        background="var(--bds-surface-brand-primary)"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bds-gap-sm)' }}>
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--bds-font-family-heading)',
              fontSize: 'var(--bds-heading-sm)',
              color: 'var(--bds-text-on-color-dark)',
            }}
          >
            Solid on-color heading
          </p>
          <hr style={{ margin: 0, border: 0, borderTop: '1px solid var(--bds-border-on-color-dark-muted)' }} />
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--bds-font-family-body)',
              fontSize: 'var(--bds-body-sm)',
              color: 'var(--bds-text-on-color-dark)',
            }}
          >
            Body copy on the brand fill uses the solid step.
          </p>
        </div>
      </Panel>
      <Panel label="Dark surface — --bds-surface-inverse" background="var(--bds-surface-inverse)">
        <Sample family="dark" />
      </Panel>
      <Panel label="Photo — light and dark regions under one step" background={`url("${PHOTO}") center / cover`}>
        <Sample family="dark" />
      </Panel>
      <Panel label="Light tint — the light family, --bds-surface-accent-purple" background="var(--bds-surface-accent-purple)">
        <Sample family="light" />
      </Panel>
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   INTERACTION TEST — ADR-010 Q5. Each muted step is its solid parent
   at a fixed alpha (ADR-046): text 70%, hairline 12%. Reads the alpha
   off the computed colour, so a changed ratio or a step that stopped
   composing from its parent fails here.
   ═══════════════════════════════════════════════════════════════ */

const alphaOf = (color: string) => {
  const m = color.match(/\/\s*([\d.]+)\s*\)$/) ?? color.match(/rgba\([^)]*,\s*([\d.]+)\s*\)$/);
  return m ? Number(m[1]) : 1;
};

/**
 * The muted text step is 70% and the hairline 12% of their parent.
 * @summary Muted steps hold their alpha
 */
export const InteractionTestMutedAlpha: Story = {
  tags: ['!manifest', 'interaction-test'],
  render: () => (
    <div style={{ background: 'var(--bds-surface-inverse)', padding: 'var(--bds-padding-lg)' }}>
      <Sample family="dark" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const text = canvasElement.querySelector<HTMLElement>('[data-step="text-on-color-dark-muted"]')!;
    const box = canvasElement.querySelector<HTMLElement>('[data-step="border-on-color-dark-muted"]')!;
    await expect(alphaOf(getComputedStyle(text).color)).toBeCloseTo(0.7, 2);
    await expect(alphaOf(getComputedStyle(box).borderTopColor)).toBeCloseTo(0.12, 2);
  },
};
