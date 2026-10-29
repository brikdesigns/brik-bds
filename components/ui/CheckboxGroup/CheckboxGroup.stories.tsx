import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CheckboxGroup } from './CheckboxGroup';
import { InteractiveListItem } from '../InteractiveListItem';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof CheckboxGroup> = {
  title: 'Components/checkbox-group',
  component: CheckboxGroup,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    options: {
      control: 'object',
      description: 'Options in render order. Each is `{ label, value, disabled? }`. Omit when passing `children`.',
    },
    children: {
      control: false,
      description:
        'Group-aware items (`SelectableMediaTile`, `InteractiveListItem`) rendered inside the fieldset. Each reads the group through `useSelectionGroup` and renders a native checkbox.',
    },
    name: {
      control: 'text',
      description:
        'Native `name` for the checkboxes rendered from `children`. Omit when the selection is read from `onChange` rather than a `<form>`.',
    },
    value: {
      control: 'object',
      description: 'Controlled selected values (string[]). Pair with `onChange`.',
    },
    defaultValue: {
      control: 'object',
      description: 'Initial selected values for uncontrolled use.',
    },
    onChange: { control: false, description: 'Called with the full next selection array.' },
    legend: { control: 'text', description: 'Accessible group label rendered as a `<legend>`.' },
    selectAllLabel: {
      control: 'text',
      description: 'When set, renders a select-all parent that shows `indeterminate` on a partial selection.',
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
type Story = StoryObj<typeof CheckboxGroup>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. `orientation` + `selectAllLabel`
   are Controls; orientation is an axis (ADR-010 Rule 5), not a
   per-orientation story. Uncontrolled via `defaultValue`.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    legend: 'Notifications',
    selectAllLabel: 'All notifications',
    defaultValue: ['email', 'digest'],
    orientation: 'vertical',
    options: [
      { label: 'Email notifications', value: 'email' },
      { label: 'Push notifications', value: 'push' },
      { label: 'SMS alerts', value: 'sms' },
      { label: 'Weekly digest', value: 'digest' },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   CHILDREN MODE — group-aware rows instead of `options` (ADR-045).
   Each InteractiveListItem reads the group and renders a native checkbox.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Pick-many rows as group-aware children */
export const ChildrenMode: Story = {
  render: () => (
    <CheckboxGroup legend="Channels" defaultValue={['email']}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bds-gap-sm)' }}>
        <InteractiveListItem value="email" title="Email" subtitle="Daily summary" />
        <InteractiveListItem value="sms" title="SMS" subtitle="Urgent only" />
        <InteractiveListItem value="push" title="Push" subtitle="Every update" />
      </div>
    </CheckboxGroup>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   INTERACTION TEST — play-only, hidden from MCP + sidebar. Proves
   the select-all/indeterminate contract, which args can't express.
   ═══════════════════════════════════════════════════════════════ */

/**
 * @summary Verifies select-all + indeterminate transitions
 */
export const InteractionTestSelectAll: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    legend: 'Channels',
    selectAllLabel: 'All channels',
    defaultValue: ['a'],
    options: [
      { label: 'Alpha', value: 'a' },
      { label: 'Bravo', value: 'b' },
      { label: 'Charlie', value: 'c' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByLabelText('All channels') as HTMLInputElement;
    const alpha = canvas.getByLabelText('Alpha') as HTMLInputElement;
    const bravo = canvas.getByLabelText('Bravo') as HTMLInputElement;

    // One of three checked → parent is indeterminate, not checked.
    await expect(all.indeterminate).toBe(true);
    await expect(all).not.toBeChecked();

    // Select-all checks every option and clears indeterminate.
    await userEvent.click(all);
    await expect(alpha).toBeChecked();
    await expect(bravo).toBeChecked();
    await expect(all).toBeChecked();
    await expect(all.indeterminate).toBe(false);

    // Toggling one child back off returns the parent to indeterminate.
    await userEvent.click(bravo);
    await expect(all.indeterminate).toBe(true);
  },
};
