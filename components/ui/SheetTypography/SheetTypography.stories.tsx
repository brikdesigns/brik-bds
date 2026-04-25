import type { Meta, StoryObj } from '@storybook/react-vite';
import { SheetSectionTitle } from './SheetSectionTitle';
import { SheetFieldLabel } from './SheetFieldLabel';
import { SheetFieldValue } from './SheetFieldValue';
import { SheetHelperText } from './SheetHelperText';

// ── Shared layout helpers (per BDS story convention) ─────────────────────────

const SheetFrame = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      width: 480,
      padding: 'var(--padding-xl)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--gap-lg)',
      background: 'var(--background-primary)',
      border: 'var(--border-width-md) solid var(--border-primary)',
      borderRadius: 'var(--border-radius-md)',
    }}
  >
    {children}
  </div>
);

const Field = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
    {children}
  </div>
);

const Section = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
    {children}
  </div>
);

// ── Storybook meta ───────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Displays/Sheet/sheet-typography',
  tags: ['surface-product'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj;

// ── Individual primitives ────────────────────────────────────────────────────

/**
 * Section title — sits at the top of each SheetSection. Heading family,
 * `--heading-sm`, semibold, primary text. No uppercase transform — distinct
 * from the legacy `<SheetSection heading="..." />` treatment.
 */
export const SectionTitle: Story = {
  render: () => (
    <SheetFrame>
      <SheetSectionTitle>Services & Billing</SheetSectionTitle>
    </SheetFrame>
  ),
};

/**
 * Field label — sits one tier below SheetSectionTitle. Label family,
 * `--label-sm`, semibold, muted text, Title Case. Block-level so values
 * stack below without wrapping.
 */
export const FieldLabel: Story = {
  render: () => (
    <SheetFrame>
      <SheetFieldLabel>Value Proposition</SheetFieldLabel>
    </SheetFrame>
  ),
};

/**
 * Field value — read-mode display below a field label. Body family,
 * `--body-md`, regular weight, primary text, preserves whitespace.
 */
export const FieldValue: Story = {
  render: () => (
    <SheetFrame>
      <SheetFieldValue>
        The only practice in Memphis delivering sedation dentistry in a judgment-free setting.
      </SheetFieldValue>
    </SheetFrame>
  ),
};

/**
 * Field value — empty state. When `children` is null/undefined/empty, the
 * fallback renders muted + italic. Pass `empty={null}` to suppress entirely.
 */
export const FieldValueEmpty: Story = {
  name: 'FieldValue — Empty',
  render: () => (
    <SheetFrame>
      <Field>
        <SheetFieldLabel>Value Proposition</SheetFieldLabel>
        <SheetFieldValue>{null}</SheetFieldValue>
      </Field>
    </SheetFrame>
  ),
};

/**
 * Helper text — neutral. Muted caption under a field, smaller than field
 * label so it never competes for attention.
 */
export const HelperText: Story = {
  render: () => (
    <SheetFrame>
      <Field>
        <SheetFieldLabel>Keywords</SheetFieldLabel>
        <SheetFieldValue>dental implants, teeth whitening, clear aligners</SheetFieldValue>
        <SheetHelperText>Comma-separated, max 15 entries.</SheetHelperText>
      </Field>
    </SheetFrame>
  ),
};

/**
 * Helper text — error tone. For validation messages under an input.
 */
export const HelperTextError: Story = {
  name: 'HelperText — Error',
  render: () => (
    <SheetFrame>
      <Field>
        <SheetFieldLabel>Website URL</SheetFieldLabel>
        <SheetFieldValue>not-a-valid-url</SheetFieldValue>
        <SheetHelperText tone="error">Must be a fully-qualified https:// URL.</SheetHelperText>
      </Field>
    </SheetFrame>
  ),
};

// ── Composition patterns ─────────────────────────────────────────────────────

/**
 * Full sheet-content composition. Demonstrates that the four primitives
 * together read like a well-structured sheet section — section title larger
 * than field labels, labels smaller than values, helper text smallest.
 * This is the hierarchy the portal audit flagged as inverted in 9 of 31
 * sheets prior to this PR.
 */
export const FullSection: Story = {
  name: 'Full Section — Composition',
  render: () => (
    <SheetFrame>
      <Section>
        <SheetSectionTitle>CTA Language</SheetSectionTitle>
        <Field>
          <SheetFieldLabel>Approved Phrases</SheetFieldLabel>
          <SheetFieldValue>
            Book a Consultation · Start Your Smile Journey · Meet Our Team
          </SheetFieldValue>
        </Field>
        <Field>
          <SheetFieldLabel>Rejected Phrases</SheetFieldLabel>
          <SheetFieldValue>
            Schedule Now · Click Here · Learn More
          </SheetFieldValue>
          <SheetHelperText>
            Industry default. Client override not yet set.
          </SheetHelperText>
        </Field>
      </Section>
    </SheetFrame>
  ),
};

/**
 * Two sections stacked. No divider between them — the `--heading-sm`
 * weight of each section title is enough visual separation. This is the
 * no-dividers rule from docs/LAYOUT-CONTEXTS.md.
 */
export const StackedSections: Story = {
  name: 'Stacked Sections — No Dividers',
  render: () => (
    <SheetFrame>
      <Section>
        <SheetSectionTitle>Services</SheetSectionTitle>
        <Field>
          <SheetFieldLabel>Top Services</SheetFieldLabel>
          <SheetFieldValue>Dental implants, clear aligners, teeth whitening</SheetFieldValue>
        </Field>
      </Section>
      <Section>
        <SheetSectionTitle>Billing</SheetSectionTitle>
        <Field>
          <SheetFieldLabel>Financial Model</SheetFieldLabel>
          <SheetFieldValue>Fee for Service</SheetFieldValue>
        </Field>
        <Field>
          <SheetFieldLabel>Financing Partners</SheetFieldLabel>
          <SheetFieldValue>CareCredit, Cherry Finance</SheetFieldValue>
        </Field>
      </Section>
    </SheetFrame>
  ),
};

/**
 * Label-with-input — demonstrates the `htmlFor` prop. When the label is
 * programmatically associated with an input, the primitive renders as
 * `<label>` for screen-reader accessibility; otherwise as `<span>`.
 */
export const LabelWithInput: Story = {
  name: 'FieldLabel — With htmlFor',
  render: () => (
    <SheetFrame>
      <Field>
        <SheetFieldLabel htmlFor="example-input">Tagline</SheetFieldLabel>
        <input
          id="example-input"
          type="text"
          defaultValue="Bring your smile back."
          style={{
            padding: 'var(--padding-sm)',
            border: 'var(--border-width-md) solid var(--border-primary)',
            borderRadius: 'var(--border-radius-sm)',
            font: 'inherit',
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--body-md)',
          }}
        />
        <SheetHelperText>Shown under the hero headline on the homepage.</SheetHelperText>
      </Field>
    </SheetFrame>
  ),
};

/**
 * All four primitives rendered at the same visual level so the tier
 * hierarchy is obvious at a glance. Use this story for regression review
 * after any typography-token change.
 */
export const TierHierarchy: Story = {
  name: 'Tier Hierarchy — Visual Reference',
  render: () => (
    <SheetFrame>
      <SheetSectionTitle>Tier 1 — Section Title (heading-sm)</SheetSectionTitle>
      <SheetFieldLabel>Tier 2 — Field Label (label-sm)</SheetFieldLabel>
      <SheetFieldValue>Tier 3 — Field Value (body-md)</SheetFieldValue>
      <SheetHelperText>Tier 4 — Helper Text (label-xs)</SheetHelperText>
    </SheetFrame>
  ),
};
