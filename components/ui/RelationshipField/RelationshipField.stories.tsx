import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { RelationshipField, type RelationshipItem, type RelationshipOption } from './RelationshipField';

// ── Fixtures — a plan's supported services, ordered ───────────────────────────
// Mirrors settings-plan-edit-page.tsx's Supported Services list: a catalog of
// services, a currently-picked ordered subset. `category` drives the
// icon-text ServiceTag read-mode rendering.

const ALL_SERVICES: readonly RelationshipOption[] = [
  { id: 'brand-identity', label: 'Brand Identity', category: 'brand' },
  { id: 'email-drip', label: 'Email Drip Campaign', category: 'marketing' },
  { id: 'seo-audit', label: 'SEO Audit', category: 'information' },
  { id: 'product-design', label: 'Product Design Sprint', category: 'product' },
  { id: 'billing-setup', label: 'Billing Setup', category: 'back-office' },
];

const PICKED_SERVICES: RelationshipItem[] = [
  { id: 'brand-identity', label: 'Brand Identity', category: 'brand' },
  { id: 'seo-audit', label: 'SEO Audit', category: 'information' },
];

// ── Storybook meta ────────────────────────────────────────────────────────────

const meta: Meta<typeof RelationshipField> = {
  title: 'Containers/relationship-field',
  component: RelationshipField,
  tags: ['surface-product'],
  parameters: { layout: 'centered' },
  argTypes: {
    value: { control: false, description: 'Currently selected items, in persisted order.' },
    options: { control: false, description: 'Full pickable catalog: `{ id, label, category? }[]`.' },
    onChange: { control: false, description: 'Called with the next ordered list on add / remove / reorder.' },
    removeLabel: { control: false },
    moveUpLabel: { control: false },
    moveDownLabel: { control: false },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    helperText: { control: 'text' },
    addPlaceholder: { control: 'text' },
    addLabel: { control: 'text' },
    emptyLabel: { control: 'text' },
    allAddedLabel: { control: 'text' },
    disabled: {
      control: 'boolean',
      description: 'Read mode — TagGroup of icon-text ServiceTag / neutral Tag, order preserved, no controls.',
    },
    maxItems: { control: 'number' },
    className: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof RelationshipField>;

// ── Controlled wrapper — hook-driven state machine args can't express (Q4) ────

const Controlled = (args: React.ComponentProps<typeof RelationshipField>) => {
  const [value, setValue] = useState<RelationshipItem[]>(args.value ?? []);
  return (
    <div style={{ width: 480 }}>
      <RelationshipField
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange?.(next);
        }}
      />
    </div>
  );
};

// ── Stories ────────────────────────────────────────────────────────────────────

/**
 * Two services picked, three still available. Toggle `disabled` in Controls
 * to see the read-mode icon-text ServiceTag rendering.
 *
 * @summary Interactive playground for prop tweaking
 */
export const Default: Story = {
  args: {
    label: 'Supported Services',
    value: PICKED_SERVICES,
    options: ALL_SERVICES,
    addPlaceholder: 'Select a service',
    addLabel: 'Add',
    emptyLabel: 'No services yet — pick one below to add.',
    size: 'md',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * No items picked yet — italic empty message, add row still active.
 *
 * @summary Empty picked list
 */
export const Empty: Story = {
  args: {
    ...Default.args,
    value: [],
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * Every catalog option already picked — the add row disables its dropdown
 * and shows `allAddedLabel` instead of a placeholder.
 *
 * @summary Add row disabled once every option is picked
 */
export const MaxItems: Story = {
  args: {
    ...Default.args,
    value: ALL_SERVICES.slice(),
    maxItems: ALL_SERVICES.length,
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * Selects a service from the add dropdown and confirms it appends to the
 * end of the ordered list.
 *
 * @summary Add appends the picked option
 */
export const InteractionTestAddAppendsOption: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    ...Default.args,
    value: [PICKED_SERVICES[0]],
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvas, args }) => {
    await userEvent.selectOptions(canvas.getByRole('combobox'), 'seo-audit');
    await userEvent.click(canvas.getByRole('button', { name: /^add$/i }));

    await expect(args.onChange).toHaveBeenCalledWith([
      PICKED_SERVICES[0],
      expect.objectContaining({ id: 'seo-audit' }),
    ]);
  },
};

/**
 * Removes the second row and confirms the remaining item survives at its
 * original position.
 *
 * @summary Remove drops the item, order preserved
 */
export const InteractionTestRemoveDropsItem: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    ...Default.args,
    value: PICKED_SERVICES,
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /remove seo audit/i }));

    await expect(args.onChange).toHaveBeenCalledWith([PICKED_SERVICES[0]]);
  },
};

/**
 * Moves the second row up one position and confirms the array swaps in
 * place — order is the persisted value, so this is the whole point of the
 * component.
 *
 * @summary Move up swaps array position
 */
export const InteractionTestMoveUpSwapsOrder: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    ...Default.args,
    value: PICKED_SERVICES,
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /move seo audit up/i }));

    await expect(args.onChange).toHaveBeenCalledWith([PICKED_SERVICES[1], PICKED_SERVICES[0]]);
  },
};
