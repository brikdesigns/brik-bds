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
  title: 'Blocks/checklist',
  component: Checklist,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    label: { control: 'text', description: 'Item label rendered next to the toggle.' },
    checked: {
      control: 'boolean',
      description: 'Completion state. Checked adds line-through + a subtle row background.',
    },
    disabled: {
      control: 'boolean',
      description: 'Locks the toggle and mutes styling — use during async save or on read-only items.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checklist>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox
   ═══════════════════════════════════════════════════════════════ */

/**
 * Canonical checklist row. Toggle `checked` / `disabled` via Controls to
 * see every state — empty circle, brand-primary fill with strikethrough,
 * and the muted locked treatment.
 *
 * @summary Completion-state row with circular toggle + label
 */
export const Default: Story = {
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
   VARIANTS — irreducible composition (inter-row completion state)
   ═══════════════════════════════════════════════════════════════ */

/**
 * A daily-maintenance checklist inside a task sheet — the canonical use
 * case in a clinical PMS. The completion background + strikethrough makes
 * done vs. not-done glanceable at the row level; the running `n of N
 * completed` counter sits above the list. Irreducible because the value
 * comes from the *interaction between rows*, which Controls can't express.
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
