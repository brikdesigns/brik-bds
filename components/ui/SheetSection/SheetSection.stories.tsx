import type { Meta, StoryObj } from '@storybook/react-vite';
import { SheetSection } from './SheetSection';

const meta: Meta<typeof SheetSection> = {
  title: 'Containers/sheet-section',
  component: SheetSection,
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text', description: 'Section title text. Omit for intro / description-only sections.' },
    titleAs: {
      control: 'select',
      options: ['h2', 'h3', 'h4'],
      description: 'HTML element for the title. Defaults to `h3` to keep the Sheet’s own `<h2>` title as the outline root. Also drives the size ramp — `h2`/`h3`/`h4` → `--heading-md`/`--heading-sm`/`--heading-xs`.',
    },
    description: { control: 'text', description: 'Optional lead paragraph rendered under the title.' },
    spacing: { control: 'select', options: ['md', 'lg'], description: 'Vertical rhythm between this section and the next.' },
    children: { control: false, description: 'Section content — Field, FieldGrid, Card, CardList, Table, TagGroup, BulletList, etc.' },
  },
};

export default meta;
type Story = StoryObj<typeof SheetSection>;

/* ─── Story helpers ──────────────────────────────────────────── */

const bodyText: React.CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-md)', // bds-lint-ignore — story-only inline demo style, not shipped component CSS
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
   §components without a variant axis): title-only, title +
   description, description-only (lead), and empty shells are all
   presence/absence of the same two optional props, not distinct
   ARIA roles or contextual semantics. All variation is Controls.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Toggle `title`, `description`, `titleAs`, and `spacing` via
 * Controls — clear `title` for a description-only lead section, or
 * clear `description` for a title-only section.
 *
 * @summary Named block wrapper for content inside a Sheet body
 */
export const Default: Story = {
  args: {
    title: 'Color Primitives',
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

/* ═══════════════════════════════════════════════════════════════
   VARIANTS — irreducible composition (level → size ramp)
   ═══════════════════════════════════════════════════════════════ */

/**
 * `titleAs` drives both the rendered element and its visual size — an `h3`
 * super-group can wrap `h4` sub-groups and the sizes read as a hierarchy,
 * not just a DOM-level change. Irreducible: a single-section Control on the
 * Default story can't show two tiers relating to each other at once.
 *
 * @summary Level → size ramp — h3 super-group wrapping h4 sub-groups
 */
export const LevelRamp: Story = {
  name: 'Level → Size Ramp',
  render: () => (
    <Frame>
      <SheetSection title="Color Primitives" titleAs="h3" spacing="md">
        <SheetSection title="Light Mode" titleAs="h4" spacing="md">
          <p style={bodyText}>Light-mode primitives render here.</p>
        </SheetSection>
        <SheetSection title="Dark Mode" titleAs="h4" spacing="md">
          <p style={bodyText}>Dark-mode primitives render here.</p>
        </SheetSection>
      </SheetSection>
    </Frame>
  ),
};
