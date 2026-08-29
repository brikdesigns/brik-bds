import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { RadioGroup } from './RadioGroup';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/radio-group',
  component: RadioGroup,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    options: {
      control: 'object',
      description: 'Options in render order. Each is `{ label, value, disabled? }`.',
    },
    value: {
      control: 'text',
      description: 'Controlled selected value — matches one option\'s `value`. Pair with `onChange`.',
    },
    defaultValue: {
      control: 'text',
      description: 'Initial selection for uncontrolled use.',
    },
    onChange: { control: false, description: 'Called with the newly selected value.' },
    name: {
      control: 'text',
      description: 'Shared native radio `name` (drives exclusivity + roving focus). Auto-generated when omitted.',
    },
    legend: {
      control: 'text',
      description: 'Accessible group label rendered as a `<legend>`. Omit to label via `aria-label`.',
    },
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      description: 'Stack direction. `vertical` (default) stacks top-to-bottom; `horizontal` lays options inline.',
    },
    disabled: { control: 'boolean', description: 'Disable every option in the group.' },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. `orientation` is a Control (axis,
   ADR-010 Rule 5), not a per-orientation story. Uncontrolled via
   `defaultValue` so clicking works without a render wrapper.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    legend: 'Plan',
    defaultValue: 'pro',
    orientation: 'vertical',
    options: [
      { label: 'Basic Plan — $9/month', value: 'basic' },
      { label: 'Pro Plan — $29/month', value: 'pro' },
      { label: 'Enterprise — Custom pricing', value: 'enterprise' },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   INTERACTION TEST — play-only, hidden from MCP + sidebar. Proves
   the browser-native contract: click selects one, arrows rove
   selection within a single tab stop, exclusivity holds.
   ═══════════════════════════════════════════════════════════════ */

/**
 * @summary Verifies single-select + native roving focus
 */
export const InteractionTestSingleSelect: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    legend: 'Size',
    defaultValue: 'sm',
    options: [
      { label: 'Small', value: 'sm' },
      { label: 'Medium', value: 'md' },
      { label: 'Large', value: 'lg' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sm = canvas.getByLabelText('Small') as HTMLInputElement;
    const md = canvas.getByLabelText('Medium') as HTMLInputElement;

    await expect(sm).toBeChecked();

    // The native input is visually hidden (pointer-events: none) — the label is
    // the click target, exactly as a user interacts. Clicking it moves selection.
    await userEvent.click(canvas.getByText('Medium'));
    await expect(md).toBeChecked();
    await expect(sm).not.toBeChecked();

    // ArrowUp roves selection back to the previous radio (browser behavior).
    md.focus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(sm).toBeChecked();
    await expect(md).not.toBeChecked();
  },
};
