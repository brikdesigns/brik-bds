import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip';
import { Button } from '../Button';

/* ─── Layout Helpers (story-only) ─────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{
    fontFamily: 'var(--font-family-label)',
    fontSize: 'var(--body-xs)', // bds-lint-ignore
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 'var(--gap-md)',
    color: 'var(--text-muted)',
  }}>
    {children}
  </div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

const Row = ({ children, gap = 'var(--gap-lg)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap, alignItems: 'center' }}>{children}</div>
);

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Feedback/tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ padding: '80px' /* bds-lint-ignore — extra space for tooltip overflow */ }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    content: { control: 'text' },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof Tooltip>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    content: 'This is a tooltip',
    placement: 'top',
    children: <Button variant="outline">Hover me</Button>,
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — All placements
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Placements</SectionLabel>
        <Row gap="var(--gap-xl)">
          <Tooltip content="Top placement" placement="top">
            <Button variant="outline" size="sm">Top</Button>
          </Tooltip>
          <Tooltip content="Bottom placement" placement="bottom">
            <Button variant="outline" size="sm">Bottom</Button>
          </Tooltip>
          <Tooltip content="Left placement" placement="left">
            <Button variant="outline" size="sm">Left</Button>
          </Tooltip>
          <Tooltip content="Right placement" placement="right">
            <Button variant="outline" size="sm">Right</Button>
          </Tooltip>
        </Row>
      </div>

      <div>
        <SectionLabel>With keyboard shortcut</SectionLabel>
        <Tooltip content="Save (Cmd+S)" placement="bottom">
          <Button size="sm">Save</Button>
        </Tooltip>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Icon buttons + form help text
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => {
    const iconBtnStyle = {
      width: '32px', // bds-lint-ignore — icon button touch target
      height: '32px', // bds-lint-ignore
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--background-secondary)',
      border: 'var(--border-width-md) solid var(--border-secondary)',
      borderRadius: 'var(--border-radius-md)',
      cursor: 'pointer',
    };

    return (
      <Stack>
        <div>
          <SectionLabel>Icon button toolbar</SectionLabel>
          <Row gap="var(--gap-md)">
            <Tooltip content="Edit item">
              <button style={iconBtnStyle}>✏️</button>
            </Tooltip>
            <Tooltip content="Delete item">
              <button style={iconBtnStyle}>🗑️</button>
            </Tooltip>
            <Tooltip content="Share">
              <button style={iconBtnStyle}>📤</button>
            </Tooltip>
          </Row>
        </div>

        <div>
          <SectionLabel>Form help text</SectionLabel>
          <div style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--body-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--gap-md)',
          }}>
            <span>Username</span>
            <Tooltip content="Must be 3-20 characters" placement="right">
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px', // bds-lint-ignore — help icon size
                height: '16px', // bds-lint-ignore
                backgroundColor: 'var(--background-secondary)',
                color: 'var(--text-secondary)',
                borderRadius: '50%',
                fontSize: 'var(--label-sm)',
                cursor: 'help',
              }}>
                ?
              </span>
            </Tooltip>
          </div>
        </div>
      </Stack>
    );
  },
};
