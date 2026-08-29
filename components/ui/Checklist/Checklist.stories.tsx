import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checklist } from './Checklist';

/* ─── Meta ───────────────────────────────────────────────────────── */

const meta: Meta<typeof Checklist> = {
  title: 'Components/checklist',
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
    onCheckedChange: {
      control: false,
      description: 'Called with the new state when the row is clicked.',
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

/* The titled multi-row checklist (title + running `n of N completed` counter +
   row stack) now lives in `ChecklistGroup` (#2120). Checklist stays the atomic
   row. */
