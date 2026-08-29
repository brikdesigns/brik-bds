import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChecklistGroup, type ChecklistGroupItem } from './ChecklistGroup';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof ChecklistGroup> = {
  title: 'Components/checklist-group',
  component: ChecklistGroup,
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text', description: 'Group heading rendered above the rows.' },
    items: { control: 'object', description: 'Rows — each `{ id, label, checked, disabled? }`.' },
    onItemChange: { control: false, description: 'Called with the row id + its new completion state.' },
    showCounter: {
      control: 'boolean',
      description: 'Show the running `n of N completed` counter under the title.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChecklistGroup>;

const SEED: ChecklistGroupItem[] = [
  { id: 'a', label: 'Check and refill hand sanitizer stations', checked: true },
  { id: 'b', label: 'Clean countertops and surfaces', checked: true },
  { id: 'c', label: 'Restock surgical gloves', checked: false },
  { id: 'd', label: 'Verify autoclave temperature log', checked: false },
  { id: 'e', label: 'Empty waste bins', checked: false },
];

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. Rows are controlled, so a useState
   render wraps them to make toggling live; `title` / `showCounter`
   stay Controls. The counter updates as rows toggle — the inter-row
   completion state is exactly what this component owns.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    title: 'Daily maintenance',
    showCounter: true,
    items: SEED,
  },
  render: (args) => {
    const [items, setItems] = useState(args.items);
    return (
      <div style={{ maxWidth: 480 }}>
        <ChecklistGroup
          {...args}
          items={items}
          onItemChange={(id, checked) =>
            setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked } : item)))
          }
        />
      </div>
    );
  },
};
