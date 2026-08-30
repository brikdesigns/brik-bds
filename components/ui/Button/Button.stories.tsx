import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, fn } from 'storybook/test';
import { Button } from './Button';
// Same helper the contrast gate uses (scripts/validate-themes.js), so a story
// assertion and the token-level gate can never disagree on the arithmetic.
import { contrastRatio } from '../../../scripts/lib/wcag.mjs';

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
        'negative',
        'positive',
      ],
      description:
        'Brand hierarchy: `primary` → `outline` → `secondary` → `ghost`. ' +
        '`inverse` for inverse surfaces; `on-color` for brand-primary surfaces. ' +
        'System valence: `negative` / `positive`.',
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

const Plus = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z" />
  </svg>
);

const Close = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
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
   ICON-ONLY — Q4 irreducible. Icon-only mode can't be reached from the
   Playground because `icon` is a ReactNode (`control: false`), so this
   dedicated story is how you exercise it. It's a single args-driven
   instance: switch variant / size / disabled / loading from Controls.
   (variant, href, disabled etc. are Controls on Default per ADR-010 —
   they don't earn their own stories.)
   ═══════════════════════════════════════════════════════════════ */

/**
 * Icon-only mode. The discriminated union enforces `label` (screen-reader
 * announcement) and forbids `children`; the icon span is `aria-hidden`. Icon
 * buttons share the same variant + size scale as text buttons — flip `variant`
 * and `size` in the Controls panel.
 *
 * @summary Icon-only Button — variant + size switchable via Controls
 */
export const IconOnly: Story = {
  args: {
    icon: <Plus />,
    label: 'Add item',
    variant: 'primary',
    size: 'md',
  },
};

/* ═══════════════════════════════════════════════════════════════
   INTERACTION TESTS — play-only, off-sidebar + off-MCP (['!manifest']).
   AsLink and Disabled render identically to Controls-reachable states
   (anchor mode via `href`, disabled via `disabled`), so per the
   story-shape standard (Rules 3 + 5 / Q5) they aren't visual stories —
   they're assertions guarding branches a snapshot can't distinguish.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Anchor branch of the discriminated union — setting `href` renders `<a href>`
 * instead of `<button>`: visually identical, semantically a link. Reachable
 * from the Playground via the `href` Control; this guards that the branch
 * actually emits an anchor with the href.
 *
 * @summary Verifies the `href` branch renders an `<a>`
 */
export const InteractionTestAsLink: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { variant: 'primary', href: '#', children: 'Get started' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Get started' });

    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '#');
    // Anchor branch renders <a>, not <button> — no Control snapshot can show this.
    await expect(link.tagName).toBe('A');
  },
};

/**
 * Disabled regression guards. `disabled` is a boolean Control on every variant,
 * so this exists for the assertions, not as a gallery: (1) a disabled ghost
 * icon-button stays transparent — a disabled fill would render a solid gray
 * block (#1579); (2) a filled disabled button keeps its label legible against
 * the disabled fill (≥3:1 — #1571).
 *
 * @summary Guards disabled ghost transparency + fill legibility
 */
export const InteractionTestDisabled: Story = {
  tags: ['!manifest', 'interaction-test'],
  render: () => (
    <Row>
      <Button variant="primary" disabled>
        Primary
      </Button>
      <Button variant="ghost" icon={<Close />} label="Close" disabled />
    </Row>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ghostIcon = canvas.getByRole('button', { name: 'Close' });

    await expect(ghostIcon).toBeDisabled();
    // Disabled ghost must not paint a solid fill — background stays transparent.
    const bg = getComputedStyle(ghostIcon).backgroundColor;
    await expect(['rgba(0, 0, 0, 0)', 'transparent']).toContain(bg);

    // A filled disabled Button must not paint its label in its own background
    // colour. The Figma source shipped --text-disabled and --background-disabled
    // as the same grayscale step, so this rendered at 1.00:1 — a grey blob with
    // no visible text (#1571). Threshold is 3:1, not 4.5: WCAG 1.4.3 exempts
    // inactive components, so the bar is legibility, not conformance.
    // Source of truth for the pairing is tokens/contrast-pairings.json +
    // `npm run contrast-gate`; this is the rendered smoke guard.
    const filled = canvas.getByRole('button', { name: 'Primary' });
    const filledStyle = getComputedStyle(filled);
    await expect(
      contrastRatio(filledStyle.color, filledStyle.backgroundColor),
    ).toBeGreaterThanOrEqual(3);
  },
};
