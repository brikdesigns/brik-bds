import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within, fn } from 'storybook/test';
import { Switch } from './Switch';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Switch> = {
  title: 'Components/switch',
  component: Switch,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    label: { control: 'text' },
    size: {
      control: 'radio',
      options: ['lg', 'md', 'sm'],
      description: '`lg` — 56x32 (feature toggles). `md` — 32x18 (forms). `sm` — 28x16 (compact panels).',
    },
    variant: {
      control: 'radio',
      options: ['default', 'accent-knob'],
      description:
        '`default` — track carries the on/off state. `accent-knob` — track stays neutral gray; the knob carries state instead.',
    },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

/* ═══════════════════════════════════════════════════════════════
   1. DEFAULT — args-driven sandbox. Controls work.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    label: 'Enable feature',
    size: 'lg',
    onChange: fn(),
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Q3 semantic starting points
   ═══════════════════════════════════════════════════════════════ */

/**
 * Accent-knob variant — the track stays a neutral gray in both states and the
 * knob carries state (brand-fill when on, muted-gray when off). Used where a
 * subtler track reads better, e.g. an inline theme toggle.
 * @summary Neutral track; the knob carries on/off state
 */
export const AccentKnob: Story = {
  args: {
    label: 'Dark mode',
    variant: 'accent-knob',
    size: 'lg',
    checked: true,
    onChange: fn(),
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. INTERACTION TESTS — play-only, hidden from MCP discovery
   ═══════════════════════════════════════════════════════════════ */

/**
 * Label typography scales with size + uses label-family, matching the
 * form-input family (TextInput / Select / TextArea) — #409. Default lg → label-lg (18px).
 * @summary Verifies label typography + click fires onChange
 */
export const InteractionTestLabelTypography: Story = {
  tags: ['!manifest'],
  args: { label: 'Enable feature', size: 'lg', onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // The Switch's input is visually hidden (opacity:0/width:0 — standard a11y
    // pattern so the track+knob UI is what users see), so toBeVisible() never
    // passes on it. getByRole('switch') itself asserts it's in the DOM.
    const toggle = canvas.getByRole('switch');

    const label = canvas.getByText('Enable feature');
    await expect(label).toHaveClass('bds-switch__label--lg');
    await expect(getComputedStyle(label).fontSize).toBe('18px');

    await expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    await waitFor(() => expect(args.onChange).toHaveBeenCalledTimes(1));
  },
};

/**
 * Interaction test: disabled switch blocks toggle
 * @summary Verifies a disabled switch blocks clicks
 */
export const InteractionTestDisabledBlocksToggle: Story = {
  tags: ['!manifest'],
  args: { label: 'Locked setting', size: 'lg', disabled: true, onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');

    await expect(toggle).toBeDisabled();
    await userEvent.click(toggle);
    // Event handlers can fire on a micro-tick; wait a frame before asserting negative.
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
