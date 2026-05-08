import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checklist } from './Checklist';

const Stack = ({
  children,
  gap = 'var(--gap-xs)',
}: {
  children: React.ReactNode;
  gap?: string;
}) => <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>;

/* ─── Meta ───────────────────────────────────────────────────────── */

const meta: Meta<typeof Checklist> = {
  title: 'Components/List/checklist',
  component: Checklist,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Checklist>;

/* ═══════════════════════════════════════════════════════════════
   PLAYGROUND
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: {
    label: 'Restock surgical gloves',
    checked: false,
    disabled: false,
  },
  render: (args) => {
    const [checked, setChecked] = useState(args.checked);
    return (
      <div style={{ minWidth: 320 }}>
        <Checklist {...args} checked={checked} onCheckedChange={setChecked} />
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   VARIANTS — one story per state
   ═══════════════════════════════════════════════════════════════ */

/** @summary Unchecked — empty circle, primary label color */
export const Unchecked: Story = {
  args: { label: 'Restock surgical gloves', checked: false, onCheckedChange: () => {} },
};

/** @summary Checked — brand-primary fill, line-through label, subtle row bg */
export const Checked: Story = {
  args: { label: 'Restock surgical gloves', checked: true, onCheckedChange: () => {} },
};

/** @summary Disabled — locked + muted styling, useful during async save */
export const Disabled: Story = {
  args: { label: 'Restock surgical gloves', checked: false, onCheckedChange: () => {}, disabled: true },
};

/** @summary Disabled checked — completion state on a read-only item */
export const DisabledChecked: Story = {
  args: { label: 'Restock surgical gloves', checked: true, onCheckedChange: () => {}, disabled: true },
};

/* ═══════════════════════════════════════════════════════════════
   PATTERNS — irreducible (hook usage)
   ═══════════════════════════════════════════════════════════════ */

/**
 * A daily-maintenance checklist inside a task sheet — the canonical use
 * case in a clinical PMS. The completion bg + strikethrough makes done vs.
 * not-done glanceable at the row level; the running `n of N completed`
 * counter sits above the list. Render-mode is required because the
 * checklist's value comes from the *interaction* between rows.
 *
 * @summary Daily-maintenance checklist with running completion counter
 */
export const DailyMaintenanceChecklist: Story = {
  render: () => {
    const [items, setItems] = useState<{ id: string; label: string; checked: boolean }[]>([
      { id: 'a', label: 'Check and refill hand sanitizer stations', checked: true },
      { id: 'b', label: 'Clean countertops and surfaces', checked: true },
      { id: 'c', label: 'Restock surgical gloves', checked: false },
      { id: 'd', label: 'Verify autoclave temperature log', checked: false },
      { id: 'e', label: 'Empty waste bins', checked: false },
    ]);
    const toggle = (id: string) =>
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
      );
    const completed = items.filter((i) => i.checked).length;

    return (
      <div
        style={{
          maxWidth: 480,
          padding: 'var(--padding-lg)',
          border: 'var(--border-width-md) solid var(--border-secondary)',
          borderRadius: 'var(--border-radius-lg)',
        }}
      >
        <div style={{ marginBottom: 'var(--gap-lg)' }}>
          <h3
            style={{
              fontFamily: 'var(--font-family-heading)',
              fontSize: 'var(--heading-tiny)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-primary)',
              margin: 0,
              marginBottom: 'var(--gap-xs)',
            }}
          >
            Checklist Items
          </h3>
          <span
            style={{
              fontFamily: 'var(--font-family-label)',
              fontSize: 'var(--label-sm)',
              color: 'var(--text-secondary)',
            }}
          >
            {completed} of {items.length} completed
          </span>
        </div>
        <Stack>
          {items.map((item) => (
            <Checklist
              key={item.id}
              label={item.label}
              checked={item.checked}
              onCheckedChange={() => toggle(item.id)}
            />
          ))}
        </Stack>
      </div>
    );
  },
};
