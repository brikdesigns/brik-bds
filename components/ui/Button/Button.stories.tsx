import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, fn } from 'storybook/test';
import { Button } from './Button';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Button> = {
  title: 'Components/button',
  component: Button,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    children: {
      control: 'text',
      description:
        'Button label content (text-button mode). Accepts ReactNode for inline composition. Forbidden when `icon` is set.',
    },
    variant: {
      control: 'select',
      options: [
        'primary',
        'outline',
        'secondary',
        'ghost',
        'inverse',
        'on-color',
        'destructive',
        'positive',
        'danger',
        'danger-outline',
        'danger-ghost',
      ],
      description:
        'Brand hierarchy: `primary` → `outline` → `secondary` → `ghost`. ' +
        '`inverse` for inverse surfaces; `on-color` for brand-primary surfaces. ' +
        'System: `destructive`, `positive`. Legacy aliases (`danger`, `danger-outline`, `danger-ghost`) are TS-valid but prefer `destructive`.',
    },
    size: {
      control: 'select',
      options: ['tiny', 'sm', 'md', 'lg', 'xl'],
      description: 'Size token on the 4-point grid. Default `md`.',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch to fill the container width.',
    },
    disabled: {
      control: 'boolean',
      description:
        'Locks the button — non-interactive, muted appearance, blocks `onClick`. Button-mode only (anchors lack native disabled).',
    },
    loading: {
      control: 'boolean',
      description: 'Async-pending state — spinner replaces label, width preserved, click blocked.',
    },
    selected: {
      control: 'boolean',
      description:
        'Selected state modifier — layered on top of `variant`. Use for active filters / segmented control selections.',
    },
    iconBefore: {
      control: false,
      description: 'Optional leading icon (text-button mode only).',
    },
    iconAfter: {
      control: false,
      description: 'Optional trailing icon (text-button mode only).',
    },
    icon: {
      control: false,
      description:
        'Icon-only mode marker — when set, `children` / `iconBefore` / `iconAfter` are forbidden and `label` becomes required.',
    },
    label: {
      control: 'text',
      description:
        'Accessible label. Required when `icon` is set (icon-only mode); optional override for text buttons.',
    },
    href: {
      control: 'text',
      description: 'Render as `<a href>` for navigation. When omitted, renders as `<button>`.',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler. Not invoked when `disabled` or `loading`.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/* ─── Inline SVG icons (story-only) ───────────────────────────── */

const ArrowRight = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8.354 1.646a.5.5 0 0 0-.708.708L12.793 7.5H2a.5.5 0 0 0 0 1h10.793l-5.147 5.146a.5.5 0 0 0 .708.708l6-6a.5.5 0 0 0 0-.708l-6-6z" />
  </svg>
);

const Plus = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z" />
  </svg>
);

const Download = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.1a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-2.1a.5.5 0 0 1 1 0v2.1a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5v-2.1a.5.5 0 0 1 .5-.5z" />
    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
  </svg>
);

const Close = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
  </svg>
);

const Trash = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H5.5l1-1h3l1 1h2a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
  </svg>
);

/* ─── Layout helpers (story-only) ─────────────────────────────── */

const Row = ({ children, gap = 'var(--padding-sm)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', gap, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 Q5. Args-driven
   interactive Button, all props exposed as Controls (incl. icon /
   href to flip the discriminated-union modes from the panel).
   The play function verifies click → onClick fires.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive Button — text, icon, or link via Controls */
export const Default: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Button',
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Button' });

    await expect(button).toBeVisible();
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/* ═══════════════════════════════════════════════════════════════
   MODES — discriminated-union showcase stories (Q4 irreducible)
   Per ADR-010 framework: variant is a Control, not separate stories.
   Button variants are pure hierarchy/color — no semantic role / icon /
   context differences — so the Q-tree collapses to Controls. Mirrors
   Carbon's Button (single `Default` with `kind` Control).
   ═══════════════════════════════════════════════════════════════ */

/**
 * Icon-only mode. The discriminated union enforces `label` as required
 * (screen-reader announcement). Icon buttons share the same variant scale
 * and size scale as text buttons — only the content shape differs.
 *
 * @summary Icon-only Button — same variant + size scale as text mode
 */
export const IconOnly: Story = {
  name: 'IconOnly',
  parameters: {
    docs: {
      description: {
        story:
          'Q4 irreducible — visual reference for the icon-only discriminated-union branch. `label` is required for screen-reader announcement; the icon span is `aria-hidden`.',
      },
    },
  },
  render: () => (
    <Row>
      <Button variant="primary" icon={<Plus />} label="Add item" />
      <Button variant="outline" icon={<Download />} label="Download" />
      <Button variant="secondary" icon={<Plus />} label="Add" />
      <Button variant="ghost" icon={<Close />} label="Close" />
      <Button variant="destructive" icon={<Trash />} label="Delete" />
      <Button variant="positive" icon={<Plus />} label="Approve" />
    </Row>
  ),
};

/**
 * Anchor-mode rendering. When `href` is set, Button renders as `<a>` instead
 * of `<button>` — same visual styling, semantically a link.
 *
 * @summary Button as anchor — render as `<a href>` for navigation
 */
export const AsLink: Story = {
  name: 'AsLink',
  parameters: {
    docs: {
      description: {
        story:
          'Q4 irreducible — visual reference for the anchor discriminated-union branch. Use for actions that navigate to a URL; the rendered DOM is `<a href>`.',
      },
    },
  },
  render: () => (
    <Row>
      <Button variant="primary" href="#">
        Get started
      </Button>
      <Button variant="outline" href="#">
        Documentation
      </Button>
      <Button variant="ghost" href="#" iconBefore={<Download />}>
        Download PDF
      </Button>
      <Button variant="primary" href="#" iconAfter={<ArrowRight />}>
        Continue
      </Button>
    </Row>
  ),
};
