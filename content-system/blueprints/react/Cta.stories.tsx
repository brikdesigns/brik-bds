import type { Meta, StoryObj } from '@storybook/react-vite';

import { Cta } from './Cta';

const meta: Meta<typeof Cta> = {
  title: 'Blueprints/cta',
  component: Cta,
  tags: ['surface-web'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The `bds-cta` closing-CTA section primitive (brik-bds#582). Replaces the ADR-008-banned `bp-cta-dark-centered` (`--dark` = theme, `--centered` = alignment — both lie when re-themed). The structural truth: a single-column closing CTA (`bds-cta`, default) or a two-column copy-plus-aside variant (`bds-cta--split`). Supports a primary + optional secondary action (brik-bds#590). The default surface is inverse and `--split` retints to the primary surface via the `--bds-cta-bg` hook — neither theme is named in a class.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Cta>;

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * @summary Default — single-column closing CTA on the inverse surface.
 *
 * The workhorse shape: heading + body + one primary action, centered.
 * Replaces the legacy `cta_dark_centered`.
 */
export const Playground: Story = {
  args: {
    sectionKey: 'cta-default',
    title: 'Ready to get started?',
    body: 'A closing prompt that earns the click — short, action-oriented, and specific to what the visitor gets after they tap the CTA.',
    primaryCta: { label: 'Get in touch', url: '#contact' },
  },
};

/**
 * @summary Primary + secondary action (brik-bds#590).
 *
 * Distinct meaningful state: the "do the thing" + "hedge / talk first"
 * pair the single-`cta` legacy contract couldn't express. The secondary
 * renders after the primary at a lower emphasis.
 */
export const WithSecondaryAction: Story = {
  args: {
    ...Playground.args,
    sectionKey: 'cta-two-actions',
    primaryCta: { label: 'Get started', url: '#start' },
    secondaryCta: { label: "Let's talk", url: '#contact' },
  },
};

/**
 * @summary Split — two-column copy + contact aside (`bds-cta--split`).
 *
 * Distinct meaningful state: `layout="split"` flips to the two-column
 * grid on the primary surface with an `aside` (here, contact methods).
 * Replaces the legacy `cta_split_contact`.
 */
export const Split: Story = {
  args: {
    sectionKey: 'cta-split',
    layout: 'split',
    title: 'Talk to a real person',
    body: 'Prefer to reach out directly? Call or email and someone on the team gets back to you the same day.',
    primaryCta: { label: 'Start a project', url: '#start' },
    aside: (
      <>
        <a href="tel:+15551234567" className="bds-cta__method">
          <span className="bds-cta__method-label">Call</span>
          <span className="bds-cta__method-value">(555) 123-4567</span>
        </a>
        <a href="mailto:hello@example.com" className="bds-cta__method">
          <span className="bds-cta__method-label">Email</span>
          <span className="bds-cta__method-value">hello@example.com</span>
        </a>
      </>
    ),
  },
};

/**
 * @summary Action CTA — an `onClick` CTA renders a `<button>`, not an `<a>`.
 *
 * Exercises the `BlueprintCta` action shape (brik-bds#941): the primitive
 * emits real button semantics so the CTA can open a modal or fire analytics
 * instead of navigating. Inspect the element — it is a button, not a link.
 */
export const ActionCta: Story = {
  args: {
    ...Playground.args,
    sectionKey: 'cta-action',
    primaryCta: { label: 'Open contact form', onClick: () => {} },
  },
};
