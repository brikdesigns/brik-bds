import type { Meta, StoryObj } from '@storybook/react-vite';
import { SheetSection } from './SheetSection';

const meta: Meta<typeof SheetSection> = {
  title: 'Containers/sheet-section',
  component: SheetSection,
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
  argTypes: {
    heading: { control: 'text', description: 'Omit for intro / description-only sections.' },
    headingLevel: {
      control: 'select',
      options: ['h2', 'h3', 'h4'],
      description: 'Render level for the heading element. Defaults to `h3` to keep the Sheet’s own `<h2>` title as the outline root.',
    },
    description: { control: 'text', description: 'Optional lead paragraph rendered under the heading.' },
    spacing: { control: 'select', options: ['md', 'lg'], description: 'Vertical rhythm between this section and the next.' },
    children: { control: false, description: 'Section content — Field, FieldGrid, Card, CardList, Table, TagGroup, BulletList, etc.' },
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

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — SheetSection has no semantic-variant axis (ADR-010
   §components without a variant axis): heading-only, heading +
   description, description-only (lead), and empty shells are all
   presence/absence of the same two optional props, not distinct
   ARIA roles or contextual semantics. All variation is Controls.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Toggle `heading`, `description`, `headingLevel`, and `spacing` via
 * Controls — clear `heading` for a description-only lead section, or
 * clear `description` for a heading-only section.
 *
 * @summary Named block wrapper for content inside a Sheet body
 */
export const Default: Story = {
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
