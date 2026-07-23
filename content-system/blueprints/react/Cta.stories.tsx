import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { Cta } from './Cta';

const actionCtaClick = fn();

const meta: Meta<typeof Cta> = {
  title: 'Blueprints/cta',
  component: Cta,
  tags: ['surface-web'],
  argTypes: {
    sectionKey: { control: 'text', description: 'Unique section key — drives element ids.' },
    title: { control: 'text', description: 'Closing-CTA heading.' },
    body: { control: 'text', description: 'Supporting prompt copy.' },
    layout: { control: 'inline-radio', options: ['default', 'split'], description: '`default` single-column inverse surface; `split` two-column copy + aside.' },
    primaryCta: { control: false, description: 'Primary action `{ label, url }` or `{ label, onClick }` (onClick renders a button).' },
    secondaryCta: { control: false, description: 'Optional lower-emphasis secondary action.' },
    aside: { control: false, description: 'Aside node for `layout="split"` (e.g. contact methods).' },
  },
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
 * The workhorse shape: heading + body + one primary action, centered.
 * Replaces the legacy `cta_dark_centered`.
 *
 * @summary Single-column closing CTA on the inverse surface
 */
export const Default: Story = {
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
    ...Default.args,
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
 * Exercises the `BlueprintCta` action shape (brik-bds#941): the primitive
 * emits real button semantics so the CTA can open a modal or fire analytics
 * instead of navigating. Inspect the element — it is a button, not a link.
 *
 * @summary Action CTA renders a button, not a link
 */
export const ActionCta: Story = {
  args: {
    ...Default.args,
    sectionKey: 'cta-action',
    primaryCta: { label: 'Open contact form', onClick: actionCtaClick },
  },
  play: async ({ canvas }) => {
    // An action CTA renders a real <button>, not an <a>.
    const cta = canvas.getByRole('button', { name: 'Open contact form' });
    await userEvent.click(cta);
    await expect(actionCtaClick).toHaveBeenCalled();
  },
};
