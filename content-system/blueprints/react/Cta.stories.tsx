import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';

import type { BlueprintProps } from '../astro/types';
import { Cta } from './Cta';
import { baseClientFacts, baseTheme } from './_fixtures';

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
    align: { control: 'inline-radio', options: ['center', 'left'], description: 'Default-layout placement (structure axis, ADR-039). `center` default; `left` emits `bds-cta--align-left`. Moot for `split`.' },
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
 * Replaces the legacy `cta_centered`.
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
 * Distinct meaningful state: the "do the thing" + "hedge / talk first"
 * pair the single-`cta` legacy contract couldn't express. The secondary
 * renders after the primary at a lower emphasis.
 *
 * @summary Primary + secondary action (brik-bds#590)
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
 * Distinct meaningful state: `align="left"` flushes the default single-column
 * CTA to the start (structure axis, ADR-039), for closing sections that read
 * better left-aligned than centred.
 *
 * @summary Align-left — flush-start single-column CTA
 */
export const AlignLeft: Story = {
  args: {
    ...Default.args,
    sectionKey: 'cta-align-left',
    align: 'left',
  },
};

/**
 * Distinct meaningful state: `layout="split"` flips to the two-column
 * grid on the primary surface with an `aside` (here, contact methods).
 * Replaces the legacy `cta_split_contact`.
 *
 * @summary Split — two-column copy + contact aside
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
 * instead of navigating. Renders identically to `Default` — the only
 * difference is button-vs-link semantics, so this is a play-only assertion
 * (matrix Rule 3 / Q5), not a browseable state.
 *
 * @summary Action CTA renders a button, not a link
 */
export const InteractionTestActionCta: Story = {
  tags: ['!manifest', 'interaction-test'],
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

/* ─── Dispatched (section-driven) ──────────────────────────────────
 *
 * The same block, driven by a `BlueprintSection` instead of composed props —
 * what `BlueprintDispatcher` renders for the `cta_centered` and
 * `cta_split_contact` keys (#2352). The `layout` + `blueprintKey` args are the
 * ones the dispatcher registry passes.
 */

const centeredSection: BlueprintProps['section'] = {
  sectionKey: 'cta-dark-centered-default',
  sectionType: 'cta',
  heading: 'Ready to get started?',
  subheading: null,
  body: 'A closing prompt that earns the click — short, action-oriented, and specific to what the visitor gets after they tap the CTA.',
  cta: { label: 'Get in touch', url: '#contact' },
  visualNotes: {
    blueprintKey: 'cta_centered',
    moodKeywords: ['bold'],
    layoutBlueprint: 'cta_centered',
    imageOpportunity: null,
    illustrationOpportunity: null,
  },
  items: [],
};

const splitContactSection: BlueprintProps['section'] = {
  sectionKey: 'cta-split-contact-default',
  sectionType: 'cta',
  heading: 'Talk to a real person',
  subheading: null,
  body: 'Prefer to reach out directly? Call or email and someone on the team gets back to you the same day.',
  cta: { label: 'Start a project', url: '#start' },
  visualNotes: {
    blueprintKey: 'cta_split_contact',
    moodKeywords: ['approachable'],
    layoutBlueprint: 'cta_split_contact',
    imageOpportunity: null,
    illustrationOpportunity: null,
  },
  items: [],
};

const contactFacts: BlueprintProps['clientFacts'] = {
  ...baseClientFacts,
  phone: '(555) 123-4567',
  email: 'hello@acme.test',
};

/** @summary Dispatched centered — heading, body, primary CTA */
export const DispatchedCentered: Story = {
  args: {
    section: centeredSection,
    clientFacts: baseClientFacts,
    theme: baseTheme,
    layout: 'default',
    blueprintKey: 'cta_centered',
  },
};

/** @summary Dispatched centered — heading + CTA only, no supporting body */
export const DispatchedCenteredNoBody: Story = {
  args: {
    ...DispatchedCentered.args,
    section: { ...centeredSection, sectionKey: 'cta-dark-centered-no-body', body: null },
  },
};

/**
 * A section whose `cta` carries `onClick` (no `url`) maps onto the primary
 * action, so the dispatched path renders the same `<button>` as the composed
 * one. Renders identically to the link CTA; the button-vs-link assertion is the
 * play-only `InteractionTestDispatchedActionCta`.
 *
 * @summary Dispatched centered — action CTA (#941)
 */
export const DispatchedCenteredActionCta: Story = {
  args: {
    ...DispatchedCentered.args,
    section: {
      ...centeredSection,
      sectionKey: 'cta-dark-centered-action',
      cta: { label: 'Open contact form', onClick: actionCtaClick },
    },
  },
};

/** @summary Dispatched split — message + phone/email contacts */
export const DispatchedSplit: Story = {
  args: {
    section: splitContactSection,
    clientFacts: contactFacts,
    theme: baseTheme,
    layout: 'split',
    blueprintKey: 'cta_split_contact',
  },
};

/**
 * When a required contact fact is null at runtime, the method renders a
 * `data-content-needed` stub in place of the link (CI grep on `dist/` blocks
 * publish on the stub), matching the Astro twin.
 *
 * @summary Dispatched split — missing phone, content-needed stub
 */
export const DispatchedSplitMissingPhone: Story = {
  args: {
    ...DispatchedSplit.args,
    section: { ...splitContactSection, sectionKey: 'cta-split-contact-missing-phone' },
    clientFacts: { ...contactFacts, phone: null },
  },
};

/**
 * Play-only (matrix Rule 3 / Q5): a dispatched action CTA is a real
 * `<button>`, not an `<a>`.
 *
 * @summary Dispatched action CTA renders a button, not a link
 */
export const InteractionTestDispatchedActionCta: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: DispatchedCenteredActionCta.args,
  play: async ({ canvas }) => {
    const cta = canvas.getByRole('button', { name: 'Open contact form' });
    await userEvent.click(cta);
    await expect(actionCtaClick).toHaveBeenCalled();
  },
};
