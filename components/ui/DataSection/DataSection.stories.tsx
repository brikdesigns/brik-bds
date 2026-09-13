import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataSection } from './DataSection';
import { Field } from '../Field';
import { FieldGrid } from '../FieldGrid';
import { Button } from '../Button';
import { ButtonGroup } from '../ButtonGroup';
import { DatePicker } from '../DatePicker';

const meta: Meta<typeof DataSection> = {
  title: 'Containers/data-section',
  component: DataSection,
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text', description: 'Section title — renders as a heading (default `<h2>`).' },
    subtitle: { control: 'text', description: 'Optional secondary line below the title.' },
    actions: {
      control: false,
      description: 'Action slot rendered flush-right of the title row. Typically a `<ButtonGroup>` with `[View]` / `[Edit]` toggle, or a single `<Button>`.',
    },
    headerControl: {
      control: false,
      description: 'Centered control slot between title and actions — e.g. a month `<DatePicker>`. Switches the header to a `1fr auto 1fr` grid. Suppressed while `loading`.',
    },
    children: {
      control: false,
      description: 'Section body — typically a `<FieldGrid>` of `<Field>`s, but any content works.',
    },
    spacing: {
      control: 'select',
      options: ['md', 'lg'],
      description: 'Vertical rhythm between this section and the next.',
    },
    titleAs: {
      control: 'select',
      options: ['h2', 'h3'],
      description: 'Heading element for the title. `h3` only when nested under an existing `<h2>`.',
    },
    loading: {
      control: 'boolean',
      description:
        'Render the body as Skeleton field rows matching the FieldGrid shape of `children`. Title renders unchanged; `actions` is suppressed.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DataSection>;

/* ─── Story helpers ──────────────────────────────────────────── */

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: '880px', padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
    {children}
  </div>
);

const ViewEditToggle = () => (
  <ButtonGroup>
    <Button size="sm" variant="secondary">View</Button>
    <Button size="sm" variant="secondary">Edit</Button>
  </ButtonGroup>
);

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox
   ═══════════════════════════════════════════════════════════════ */

/**
 * Canonical section. Edit `title` / `subtitle` and toggle `spacing` /
 * `titleAs` via Controls; the `actions` slot holds a `[View]`/`[Edit]`
 * `ButtonGroup` and the body a `<FieldGrid>` of `<Field>`s.
 *
 * @summary Page-side wrapper for read-mode data sections
 */
export const Default: Story = {
  args: {
    title: 'Identity',
    subtitle: undefined,
    spacing: 'lg',
    titleAs: 'h2',
  },
  render: (args) => (
    <Frame>
      <DataSection {...args} actions={<ViewEditToggle />}>
        <FieldGrid columns={2}>
          <Field label="Business Name">Vale Partners</Field>
          <Field label="Legal Name">Vale Partners, LLC</Field>
          <Field label="DBA">Vale</Field>
          <Field label="Year Founded">2019</Field>
        </FieldGrid>
      </DataSection>
    </Frame>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   VARIANTS — irreducible composition (stacked read-mode page)
   ═══════════════════════════════════════════════════════════════ */

/**
 * `headerControl` places a control centered in the header, between the title
 * and the `actions` slot — the header lays out as a `1fr auto 1fr` grid so the
 * control stays optically centered regardless of title/action widths. The
 * canonical use is a month `<DatePicker>` on a section that browses a time
 * series (Reporting → Monthly) — random access to any month. For stepping
 * between adjacent periods instead, the slot takes a `<PeriodNav>` (#2147).
 *
 * @summary Centered header control — date picker in the section header
 */
export const WithHeaderControl: Story = {
  name: 'Centered Header Control (date)',
  render: () => {
    const DatedSection = () => {
      const [month, setMonth] = useState<Date | null>(new Date(2026, 6, 1));
      return (
        <DataSection
          title="Monthly"
          headerControl={
            <DatePicker
              id="ds-header-month"
              precision="month"
              size="sm"
              value={month}
              onChange={setMonth}
            />
          }
          actions={
            <Button size="sm" variant="secondary">
              Open Report
            </Button>
          }
        >
          <FieldGrid columns={3}>
            <Field label="Sessions">12,481</Field>
            <Field label="Users">9,204</Field>
            <Field label="Page Views">31,077</Field>
          </FieldGrid>
        </DataSection>
      );
    };
    return (
      <Frame>
        <DatedSection />
      </Frame>
    );
  },
};

/**
 * `loading` swaps the body for Skeleton field rows matching the shape
 * `children` would have produced — reads `columns` and cell count off a
 * `<FieldGrid>` child. Title stays real; `actions` is suppressed. Shown
 * against a 2-column and a 3-column section to prove the shape adapts —
 * irreducible, since a single boolean Control on one hardcoded FieldGrid
 * can't demonstrate the match.
 *
 * @summary Loading state — skeleton shape matches FieldGrid columns
 */
export const Loading: Story = {
  render: () => (
    <Frame>
      <DataSection title="Identity" actions={<ViewEditToggle />} loading>
        <FieldGrid columns={2}>
          <Field label="Business Name">Vale Partners</Field>
          <Field label="Legal Name">Vale Partners, LLC</Field>
          <Field label="DBA">Vale</Field>
          <Field label="Year Founded">2019</Field>
        </FieldGrid>
      </DataSection>

      <DataSection title="Location" actions={<ViewEditToggle />} loading>
        <FieldGrid columns={3}>
          <Field label="Address">123 Main St</Field>
          <Field label="City">Denver</Field>
          <Field label="State">CO</Field>
          <Field label="Postal Code">80202</Field>
          <Field label="Country">United States</Field>
          <Field label="Timezone">America/Denver</Field>
        </FieldGrid>
      </DataSection>
    </Frame>
  ),
};
