import type { Meta, StoryObj } from '@storybook/react-vite';
import { SheetSection } from './SheetSection';

const meta: Meta<typeof SheetSection> = {
  title: 'Displays/Sheet/sheet-section',
  component: SheetSection,
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
  argTypes: {
    heading: { control: 'text' },
    description: { control: 'text' },
    spacing: { control: 'select', options: ['md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof SheetSection>;

/* ─── Story helpers ──────────────────────────────────────────── */

const bodyText: React.CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-md)', // bds-lint-ignore
  color: 'var(--text-primary)',
  margin: 0,
};

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '480px', padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
    {children}
  </div>
);

/* ─── 1. Playground ──────────────────────────────────────────── */

export const Playground: Story = {
  args: {
    heading: 'Color Primitives',
    description: undefined,
    spacing: 'lg',
  },
  render: (args) => (
    <Frame>
      <SheetSection {...args}>
        <p style={bodyText}>Section content renders here.</p>
      </SheetSection>
    </Frame>
  ),
};

/* ─── 2. Variants ────────────────────────────────────────────── */

export const Variants: Story = {
  render: () => (
    <Frame>
      <SheetSection heading="Positioning">
        <p style={bodyText}>A heading with content, no description.</p>
      </SheetSection>

      <SheetSection
        heading="Brand Identity"
        description="Birdwell & Mutlak Dentistry presents a bold, editorial identity anchored in a warm gold palette paired with neutral grays."
      >
        <p style={bodyText}>A heading with both description and content.</p>
      </SheetSection>

      <SheetSection description="An intro paragraph with no heading — use for sheet-level lead copy.">
        <p style={bodyText}>Sections without a heading skip the uppercase label entirely.</p>
      </SheetSection>

      <SheetSection heading="Standalone heading" />
    </Frame>
  ),
};

/* ─── 3. Patterns ────────────────────────────────────────────── */

export const Patterns: Story = {
  render: () => (
    <Frame>
      <SheetSection description="This sheet documents the foundational brand identity, typography, and mode preferences.">
        {null}
      </SheetSection>

      <SheetSection heading="Color Primitives">
        <div style={{ display: 'flex', gap: 'var(--gap-lg)' }}>
          {['#c49a2f', '#b0b0b0', '#ffffff', '#000000'].map((hex) => (
            <div
              key={hex}
              style={{
                width: 40,
                height: 40,
                background: hex,
                borderRadius: 'var(--border-radius-circle)',
                border: '1px solid var(--border-secondary)',
              }}
            />
          ))}
        </div>
      </SheetSection>

      <SheetSection heading="Typography">
        <p style={bodyText}>Typography table renders here.</p>
      </SheetSection>

      <SheetSection heading="Mode Recommendations">
        <p style={bodyText}>Mode recommendations render here.</p>
      </SheetSection>
    </Frame>
  ),
};
