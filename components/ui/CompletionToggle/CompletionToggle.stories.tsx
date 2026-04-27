import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CompletionToggle } from './CompletionToggle';

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
  gap = 'var(--gap-xl)',
}: {
  children: React.ReactNode;
  gap?: string;
}) => <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>;

const Row = ({
  children,
  gap = 'var(--gap-lg)',
}: {
  children: React.ReactNode;
  gap?: string;
}) => (
  <div style={{ display: 'flex', gap, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

/* ─── Meta ───────────────────────────────────────────────────────── */

const meta: Meta<typeof CompletionToggle> = {
  title: 'Components/Form/CompletionToggle',
  component: CompletionToggle,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof CompletionToggle>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: {
    checked: false,
    disabled: false,
  },
  render: (args) => {
    const [checked, setChecked] = useState(args.checked);
    return <CompletionToggle {...args} checked={checked} onCheckedChange={setChecked} />;
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS
   ═══════════════════════════════════════════════════════════════ */

/** @summary All states side by side */
export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>States</SectionLabel>
        <Row gap="var(--gap-xl)">
          <CompletionToggle checked={false} onCheckedChange={() => {}} />
          <CompletionToggle checked={true} onCheckedChange={() => {}} />
          <CompletionToggle checked={false} onCheckedChange={() => {}} disabled />
          <CompletionToggle checked={true} onCheckedChange={() => {}} disabled />
        </Row>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS
   ═══════════════════════════════════════════════════════════════ */

/** @summary Used as a standalone toggle on a card or as the click target inside a row composition */
export const Patterns: Story = {
  render: () => {
    const [items, setItems] = useState<Record<string, boolean>>({
      a: false,
      b: true,
      c: false,
    });
    const toggle = (id: string) => setItems((prev) => ({ ...prev, [id]: !prev[id] }));

    return (
      <Stack gap="var(--gap-huge)">
        <div>
          <SectionLabel>Card chrome (BoardCard pattern)</SectionLabel>
          <div
            style={{
              maxWidth: '320px',
              padding: 'var(--padding-lg)',
              border: 'var(--border-width-md) solid var(--border-secondary)',
              borderRadius: 'var(--border-radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--gap-md)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-family-body)',
                fontSize: 'var(--body-md)',
                color: 'var(--text-primary)',
              }}
            >
              Patient check-in processing
            </span>
            <CompletionToggle checked={items.a} onCheckedChange={() => toggle('a')} />
          </div>
        </div>

        <div>
          <SectionLabel>Inline list of toggleable units</SectionLabel>
          <Stack gap="var(--gap-md)">
            <Row>
              <CompletionToggle checked={items.b} onCheckedChange={() => toggle('b')} />
              <span
                style={{
                  fontFamily: 'var(--font-family-body)',
                  fontSize: 'var(--body-md)',
                  color: 'var(--text-primary)',
                }}
              >
                Restock surgical gloves
              </span>
            </Row>
            <Row>
              <CompletionToggle checked={items.c} onCheckedChange={() => toggle('c')} />
              <span
                style={{
                  fontFamily: 'var(--font-family-body)',
                  fontSize: 'var(--body-md)',
                  color: 'var(--text-primary)',
                }}
              >
                Sanitize workstations
              </span>
            </Row>
          </Stack>
          <p
            style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--body-xs)',
              color: 'var(--text-muted)',
              marginTop: 'var(--gap-md)',
            }}
          >
            For row-wide click targets with completion state, prefer{' '}
            <code>{'<ChecklistItem>'}</code> — it pairs this control with a native{' '}
            <code>{'<label>'}</code> + <code>{'<input>'}</code>.
          </p>
        </div>
      </Stack>
    );
  },
};
