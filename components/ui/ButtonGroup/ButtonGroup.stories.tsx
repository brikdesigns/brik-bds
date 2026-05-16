import type { Meta, StoryObj } from '@storybook/react-vite';
import { ButtonGroup } from './ButtonGroup';
import { Button } from '../Button';

/* ─── Story-only icons ────────────────────────────────────────── */

const Edit = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10z" />
  </svg>
);

const Copy = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3z" />
  </svg>
);

const Share = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z" />
  </svg>
);

const Trash = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H5.5l1-1h3l1 1h2a1 1 0 0 1 1 1v1z" />
  </svg>
);

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/button-group',
  component: ButtonGroup,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Stack direction. Default `horizontal`.',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'between'],
      description:
        'Horizontal alignment within the container. ' +
        '`end` is the canonical modal / sheet action-row choice (primary far right, secondary to its left). ' +
        '`between` places the first child against the leading edge and the last against the trailing edge.',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch buttons to fill container width equally. When true, `align` is ignored.',
    },
    children: {
      control: false,
      description: 'Button / IconButton children. Story args render canonical 3-4 button compositions.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — canonical action set: 1 primary + 2 secondary buttons
   in horizontal layout. Use Controls to flip orientation / align /
   fullWidth.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Default — primary + outline + ghost action set */
export const Default: Story = {
  args: {
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
   ICON-BUTTON GROUP — composing IconButton children. Common for
   inline toolbars on rows / cards (edit, copy, share, delete).
   ═══════════════════════════════════════════════════════════════ */

/** @summary Icon-button toolbar — up to 4 actions */
export const IconButtonGroup: Story = {
  args: {
    orientation: 'horizontal',
    align: 'start',
    fullWidth: false,
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button icon={<Edit />} label="Edit" variant="ghost" />
      <Button icon={<Copy />} label="Copy" variant="ghost" />
      <Button icon={<Share />} label="Share" variant="ghost" />
      <Button icon={<Trash />} label="Delete" variant="destructive" />
    </ButtonGroup>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   ACTION-BAR — modal / sheet action row. Per platform conventions
   (macOS HIG, Material, Carbon), the primary action sits on the
   far right with secondary actions to its LEFT. align="end" with
   [secondary, primary] order achieves this.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Action bar — modal / sheet row, primary far right */
export const ActionBar: Story = {
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 480 }}><Story /></div>],
  args: {
    orientation: 'horizontal',
    align: 'end',
    fullWidth: false,
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="ghost">Cancel</Button>
      <Button variant="primary">Save</Button>
    </ButtonGroup>
  ),
};
