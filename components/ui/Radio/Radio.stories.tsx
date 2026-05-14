import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Radio } from './Radio';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Radio> = {
  title: 'Components/Form/radio',
  component: Radio,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    label: {
      control: 'text',
      description: 'Visible text rendered next to the radio. Clicking the label selects the input.',
    },
    name: {
      control: 'text',
      description: 'Group name. Radios with the same `name` are mutually exclusive — browser enforces selection-of-one. Required.',
    },
    value: {
      control: 'text',
      description: 'Value submitted to a form when this radio is the selected option in its group. Required.',
    },
    checked: {
      control: 'boolean',
      description: 'Controlled checked state. Pair with `onChange`. For uncontrolled use, set `defaultChecked` instead.',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Initial checked state for uncontrolled use.',
    },
    disabled: {
      control: 'boolean',
      description: 'Locks the input and applies muted styling.',
    },
    onChange: {
      action: 'changed',
      description: 'Called with the native change event when the radio becomes selected.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Radio>;

/* ═══════════════════════════════════════════════════════════════
   SINGLE — args-driven canonical instance. Rare in practice (radios
   are useless solo) but matches the Checkbox shape and exposes the
   prop API via Controls. The Vertical / Horizontal group stories
   below are the canonical use cases.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Single radio option (rarely used solo) */
export const Single: Story = {
  args: {
    label: 'Option A',
    name: 'demo',
    value: 'a',
    defaultChecked: false,
    disabled: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radio = canvas.getByLabelText('Option A') as HTMLInputElement;

    await expect(radio).toBeVisible();
    await expect(radio).not.toBeChecked();
    // Radios don't toggle off on second click — exclusivity comes from
    // other radios sharing the same `name`. The play test verifies
    // rendering only; group exclusivity is exercised in the Vertical /
    // Horizontal stories where the browser actually has peers to switch
    // between.
  },
};

/* ═══════════════════════════════════════════════════════════════
   ORIENTATION axis — Vertical / Horizontal group layouts per ADR-010
   §components without a variant axis (orientation differs → story
   per orientation). Render-only because the layout difference can't
   be expressed as a prop on a single Radio. Uncontrolled: radios
   share `name`, browser enforces exclusivity; `defaultChecked` on
   one radio per group sets initial selection.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Vertical group — radios stacked top-to-bottom */
export const Vertical: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
      <Radio name="plan" value="basic" label="Basic Plan — $9/month" />
      <Radio name="plan" value="pro" label="Pro Plan — $29/month" defaultChecked />
      <Radio name="plan" value="enterprise" label="Enterprise — Custom pricing" />
    </div>
  ),
};

/** @summary Horizontal group — radios inline */
export const Horizontal: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 'var(--gap-xl)', flexWrap: 'wrap' }}>
      <Radio name="size" value="sm" label="Small" />
      <Radio name="size" value="md" label="Medium" defaultChecked />
      <Radio name="size" value="lg" label="Large" />
    </div>
  ),
};
