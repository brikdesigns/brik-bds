import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChecklistItem } from './ChecklistItem';

/* ─── Layout helpers (story-only) ────────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div
    style={{
      fontFamily: 'var(--font-family-label)',
      fontSize: 'var(--body-xs)', // bds-lint-ignore
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      marginBottom: 'var(--gap-md)',
      color: 'var(--text-muted)',
    }}
  >
    {children}
  </div>
);

const Stack = ({
  children,
  gap = 'var(--gap-xs)',
}: {
  children: React.ReactNode;
  gap?: string;
}) => <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>;

/* ─── Meta ───────────────────────────────────────────────────────── */

const meta: Meta<typeof ChecklistItem> = {
  title: 'Components/Form/ChecklistItem',
  component: ChecklistItem,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ChecklistItem>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND
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
        <ChecklistItem {...args} checked={checked} onCheckedChange={setChecked} />
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS
   ═══════════════════════════════════════════════════════════════ */

/** @summary All states side by side */
export const Variants: Story = {
  render: () => (
    <div style={{ minWidth: 360 }}>
      <SectionLabel>States</SectionLabel>
      <Stack>
        <ChecklistItem label="Unchecked" checked={false} onCheckedChange={() => {}} />
        <ChecklistItem label="Checked" checked={true} onCheckedChange={() => {}} />
        <ChecklistItem label="Disabled" checked={false} onCheckedChange={() => {}} disabled />
        <ChecklistItem
          label="Disabled checked"
          checked={true}
          onCheckedChange={() => {}}
          disabled
        />
      </Stack>
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS
   ═══════════════════════════════════════════════════════════════ */

/** @summary Real-world: a daily-maintenance checklist inside a task sheet */
export const Patterns: Story = {
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
            <ChecklistItem
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
