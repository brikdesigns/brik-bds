import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Radio } from './Radio';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Radio> = {
  title: 'Components/radio',
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
   are useless solo) but exposes the prop API via Controls. The
   canonical multi-option use case now lives in `RadioGroup` (#2120),
   which owns the group's `name`, value, and orientation.
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

    // The native input is visually hidden by design (custom radio —
    // position:absolute; opacity:0; width/height:0), so assert it renders
    // and is accessible rather than visible; the visible label proves render.
    await expect(radio).toBeInTheDocument();
    await expect(canvas.getByText('Option A')).toBeVisible();
    await expect(radio).not.toBeChecked();
    // Radios don't toggle off on second click — exclusivity comes from
    // other radios sharing the same `name`. The play test verifies
    // rendering only; group exclusivity is exercised in the Vertical /
    // Horizontal stories where the browser actually has peers to switch
    // between.
  },
};
