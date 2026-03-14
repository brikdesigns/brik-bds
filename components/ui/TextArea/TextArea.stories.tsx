import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextArea } from './TextArea';

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

const Row = ({ children, gap = 'var(--padding-sm)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', gap, flexWrap: 'wrap', alignItems: 'flex-start' }}>{children}</div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ─── Meta ────────────────────────────────────────────────────── */

const meta = {
  title: 'Components/Form/text-area',
  component: TextArea,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'text' },
    rows: { control: 'number' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
    resize: { control: 'select', options: ['none', 'both', 'horizontal', 'vertical'] },
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    label: 'Notes',
    placeholder: 'Enter your text here...',
    rows: 4,
    size: 'md',
    fullWidth: true,
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, states, resize modes
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <div style={{ width: 520 }}>
      <Stack>
        {/* Sizes */}
        <div>
          <SectionLabel>Sizes</SectionLabel>
          <Row gap="var(--gap-lg)">
            <div style={{ flex: 1 }}>
              <TextArea size="sm" label="Small" placeholder="sm variant..." rows={3} fullWidth />
            </div>
            <div style={{ flex: 1 }}>
              <TextArea size="md" label="Medium" placeholder="md variant..." rows={3} fullWidth />
            </div>
            <div style={{ flex: 1 }}>
              <TextArea size="lg" label="Large" placeholder="lg variant..." rows={3} fullWidth />
            </div>
          </Row>
        </div>

        {/* States */}
        <div>
          <SectionLabel>States</SectionLabel>
          <Stack gap="var(--gap-lg)">
            <TextArea label="Default" placeholder="Enter your message..." rows={3} fullWidth />
            <TextArea label="With value" defaultValue="This is some default text that appears in the textarea." rows={3} fullWidth />
            <TextArea label="Helper text" placeholder="Describe your needs..." helperText="Maximum 500 characters" rows={3} fullWidth />
            <TextArea label="Error" placeholder="Required field" error="This field is required" rows={3} fullWidth />
            <TextArea label="Disabled" placeholder="This field is disabled" disabled rows={3} fullWidth />
          </Stack>
        </div>

        {/* Resize modes */}
        <div>
          <SectionLabel>Resize modes</SectionLabel>
          <Stack gap="var(--gap-lg)">
            <TextArea label="Vertical (default)" placeholder="Resize vertically..." rows={3} resize="vertical" fullWidth />
            <TextArea label="None" placeholder="Cannot be resized" rows={3} resize="none" fullWidth />
            <TextArea label="Both" placeholder="Resize in any direction" rows={3} resize="both" fullWidth />
          </Stack>
        </div>
      </Stack>
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Real-world form layouts
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => (
    <Row gap="var(--padding-xl)">
      {/* Feedback form */}
      <div style={{ width: 400 }}>
        <SectionLabel>Feedback form</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <TextArea label="Description" placeholder="Describe your needs..." rows={4} fullWidth />
          <TextArea label="Additional information" placeholder="Any other details..." rows={4} fullWidth />
        </Stack>
      </div>

      {/* Compact notes */}
      <div style={{ width: 300 }}>
        <SectionLabel>Compact notes</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <TextArea size="sm" label="Internal notes" placeholder="Add a note..." rows={3} resize="none" fullWidth />
          <TextArea size="sm" label="Comments" placeholder="Share your feedback..." rows={6} fullWidth />
        </Stack>
      </div>
    </Row>
  ),
};
