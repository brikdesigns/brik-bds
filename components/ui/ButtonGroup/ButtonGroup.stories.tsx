import type { Meta, StoryObj } from '@storybook/react-vite';
import { ButtonGroup } from './ButtonGroup';
import { Button } from '../Button';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/Action/button-group',
  component: ButtonGroup,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['spaced', 'segmented'],
      description: 'Layout treatment. `spaced` (default) keeps a gap between buttons; `segmented` collapses borders into a toolbar unit.',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Stack direction. Default `horizontal`.',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'between'],
      description: 'Horizontal alignment within the container. `between` replaces the prior manual `ActionBar` flex pattern (first child left, last child right).',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch buttons to fill container width equally.',
    },
    children: {
      control: false,
      description: 'Button / IconButton children. Story args render a canonical 2-3 button set.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

/* ═══════════════════════════════════════════════════════════════
   SPACED — default variant, gap between buttons. Canonical
   action-set look used for form footers, dialog actions, etc.
   Per ADR-010 §components without a variant axis, `variant` IS
   the Q3 axis here (segmented vs spaced is a real layout shape
   difference, not just a prop) — so per-variant stories ship.
   Orientation + align + fullWidth stay as Controls.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Spaced — gap between buttons (default) */
export const Spaced: Story = {
  args: {
    variant: 'spaced',
    orientation: 'horizontal',
    align: 'start',
    fullWidth: false,
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="primary">Save</Button>
      <Button variant="outline">Preview</Button>
      <Button variant="ghost">Cancel</Button>
    </ButtonGroup>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   SEGMENTED — variant: 'segmented'. Buttons share borders into a
   single toolbar unit. Common for view-mode toggles, time-range
   switchers, segmented controls.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Segmented — shared borders, toolbar look */
export const Segmented: Story = {
  args: {
    variant: 'segmented',
    orientation: 'horizontal',
    align: 'start',
    fullWidth: false,
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="secondary">Day</Button>
      <Button variant="secondary">Week</Button>
      <Button variant="secondary">Month</Button>
    </ButtonGroup>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   ACTION-BAR — `align: 'between'` replaces the prior manual flex
   pattern from Button.mdx. Closes #617. Discard on the left,
   primary CTA on the right.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Action bar — discard left, primary right (align="between") */
export const ActionBar: Story = {
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 480 }}><Story /></div>],
  args: {
    variant: 'spaced',
    orientation: 'horizontal',
    align: 'between',
    fullWidth: false,
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="destructive">Discard</Button>
      <Button variant="primary">Continue</Button>
    </ButtonGroup>
  ),
};
