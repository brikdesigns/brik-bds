import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { GhlForm } from './GhlForm';
import { GHL_FORM_EMBED_SRC } from './ghlEmbed';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof GhlForm> = {
  title: 'Forms/ghl-form',
  component: GhlForm,
  tags: ['surface-web'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    formId: {
      control: 'text',
      description: "The GHL form's id — the `id` in the form's embed code.",
    },
    formName: {
      control: 'text',
      description:
        "The form's name. Becomes the iframe `title`, which a screen reader announces for the frame. A blank value falls back to `Form`.",
    },
    height: {
      control: { type: 'number', min: 0, step: 10 },
      description:
        "Height in px from the embed code's `data-height`, reserved as `min-height` so the section does not collapse before GHL sizes the frame.",
    },
    lazy: {
      control: 'boolean',
      description:
        'Opt-in. Omits `src` and emits the URL as `data-src`; the consumer sets `frame.src = frame.dataset.src` when the form is first shown. Default false.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof GhlForm>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. Controls work.

   GhlForm is a single-appearance component (ADR-010 matrix): the form's
   fields are drawn inside GHL's frame, so there is no BDS visual axis to
   vary — only which form (`formId`), what it is called (`formName`), and the
   height reserved for it.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    formId: 'rvGeUFEFytjrjxr7XiDE',
    formName: 'Contact Us',
    height: 838,
  },
};

/* ═══════════════════════════════════════════════════════════════
   INTERACTION TEST — play-only (Q5). Hidden from the sidebar + MCP.
   ═══════════════════════════════════════════════════════════════ */

/**
 * The iframe is a named frame, and the GHL embed script is on the page once.
 * @summary Iframe renders with a title; embed script loads once
 */
export const InteractionTestIframeTitle: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    formId: 'rvGeUFEFytjrjxr7XiDE',
    formName: 'Contact Us',
    height: 838,
  },
  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector('iframe');
    await expect(frame).not.toBeNull();
    const title = frame?.getAttribute('title') ?? '';
    await expect(title.trim()).not.toBe('');
    await expect(title).toBe('Contact Us');
    await expect(frame?.getAttribute('src')).toBe(
      'https://link.brikdesigns.com/widget/form/rvGeUFEFytjrjxr7XiDE',
    );
    await expect(
      document.querySelectorAll(`script[src="${GHL_FORM_EMBED_SRC}"]`).length,
    ).toBe(1);
  },
};

/**
 * Opt-in `lazy`: no `src`, the URL waits on `data-src` until the consumer
 * shows the form and copies it across.
 * @summary lazy omits src and carries the URL on data-src
 */
export const InteractionTestLazy: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    formId: 'rvGeUFEFytjrjxr7XiDE',
    formName: 'Contact Us',
    height: 838,
    lazy: true,
  },
  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector('iframe');
    await expect(frame).not.toBeNull();
    await expect(frame?.hasAttribute('src')).toBe(false);
    await expect(frame?.getAttribute('data-src')).toBe(
      'https://link.brikdesigns.com/widget/form/rvGeUFEFytjrjxr7XiDE',
    );
    await expect(frame?.getAttribute('title')).toBe('Contact Us');
  },
};
